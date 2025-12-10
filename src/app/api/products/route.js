import { NextResponse } from "next/server";
// Import the new GridFS client utility
import { uploadToGridFs, deleteFromGridFs } from "@/lib/gridFsClient";
import mongoose from "mongoose";
import { connectDb } from "@/lib/dbConnect";
import Products from "@/models/Products";
import { getCache, setCache } from "@/lib/globalProductChache";

export const dynamic = "force-dynamic";

// --- UTILITY FOR FILE UPLOAD (GridFS) ---

/**
 * Uploads a file to GridFS, handling the ArrayBuffer conversion.
 * @param {File} file - The file object obtained from request.formData().
 * @returns {Promise<{id: mongoose.Types.ObjectId, filename: string}>} The uploaded file details.
 */
async function uploadToBlob(file) {
  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  if (fileBuffer.length === 0) {
    throw new Error(`File upload rejected: ${file.name} is empty (0 bytes).`);
  }

  // CRITICAL FIX: SANITIZE FILENAME
  // 1. Remove non-alphanumeric, non-dot characters, replacing them with underscores.
  // 2. Prevent consecutive underscores.
  const sanitizedName = file.name
    .replace(/[^a-zA-Z0-9.]/g, "_")
    .replace(/_+/g, "_");

  const uniqueFilename = `${Date.now()}_${sanitizedName}`;

  const result = await uploadToGridFs(fileBuffer, uniqueFilename, file.type);

  return result; // returns { id: ObjectId, filename: string }
}

// --- POST HANDLER (Create Product with Image Upload) ---

export async function POST(request) {
  await connectDb();

  // Variables to track uploaded file IDs for rollback (stored as strings)
  const uploadedFileIds = [];

  try {
    const formData = await request.formData();
    const imageFrontFile = formData.get("imageFront");
    const imageBackFile = formData.get("imageBack");
    const productJson = formData.get("productData");
    const galleryFiles = formData.getAll("galleryImages");

    if (!imageFrontFile) {
      return NextResponse.json(
        { message: "Front image file is required." },
        { status: 400 }
      );
    }

    const productData = JSON.parse(productJson);
    let frontBlobResult = { id: null, filename: null };
    let backBlobResult = { id: null, filename: null };
    let galleryResults = [];

    // --- 1. Upload Images and Collect IDs/Filenames ---

    // a. Main Front Image
    frontBlobResult = await uploadToBlob(imageFrontFile);
    uploadedFileIds.push(frontBlobResult.id.toString());

    // b. Main Back Image (if provided)
    if (imageBackFile && imageBackFile.size > 0) {
      backBlobResult = await uploadToBlob(imageBackFile);
      uploadedFileIds.push(backBlobResult.id.toString());
    }

    // c. Gallery Images (if provided)
    if (galleryFiles && galleryFiles.length > 0) {
      const validGalleryFiles = galleryFiles.filter(
        (f) => f instanceof File && f.size > 0
      );

      for (const file of validGalleryFiles) {
        const result = await uploadToBlob(file);
        uploadedFileIds.push(result.id.toString());
        galleryResults.push({
          fileId: result.id,
          filename: result.filename,
        });
      }
    }

    // --- 2. Prepare MongoDB Data ---
    const finalProductData = {
      ...productData,
      imageFrontFileId: frontBlobResult.id,
      imageFrontFilename: frontBlobResult.filename,
      imageBackFileId: backBlobResult.id,
      imageBackFilename: backBlobResult.filename,
      gallery: galleryResults,
      mainCategory: productData.mainCategory,
    };

    // --- 3. Save to MongoDB ---
    const newProduct = await Products.create(finalProductData);

    return NextResponse.json(
      {
        status: "success",
        product: newProduct.toObject({ virtuals: true }),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Product POST Error (GridFS):", error);

    // --- ERROR HANDLING & ROLLBACK (GridFS Deletion) ---
    if (uploadedFileIds.length > 0) {
      try {
        console.log(
          `Attempting to clean up ${uploadedFileIds.length} file(s) from GridFS...`
        );
        await Promise.all(
          uploadedFileIds.map((fileId) => deleteFromGridFs(fileId))
        );
        console.log("Cleanup complete.");
      } catch (cleanupError) {
        console.error("GridFS Cleanup Failed:", cleanupError.message);
      }
    }

    if (error instanceof mongoose.Error.ValidationError) {
      const messages = Object.values(error.errors).map((val) => val.message);
      return NextResponse.json(
        { status: "fail", message: messages.join(". ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        status: "error",
        message:
          "Failed to create product or upload images. Rollback attempted.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// --- GET HANDLER (Filtering and Sorting) ---

export async function GET(req) {
  await connectDb();

  const cache = getCache();

  if (!cache.products.length) {
    console.log("⚡ Loading Products Into Global Cache...");
    const dbData = await Products.find().lean({ virtuals: true });
    setCache(dbData);
  }

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = 10;

  const search = searchParams.get("search")?.trim() || "";
  const category = searchParams.get("category") || "All";
  const mainCategory = searchParams.get("mainCategory") || "";
  const size = searchParams.get("size") || "";
  const minPrice = Number(searchParams.get("minPrice")) || 0;
  const maxPrice = Number(searchParams.get("maxPrice")) || 999999;

  let result = [...cache.products];

  if (search) {
    result = result.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
    );
  }

  if (category !== "All")
    result = result.filter((p) => p.category === category);

  if (mainCategory)
    result = result.filter((p) => p.mainCategory === mainCategory);

  if (size) result = result.filter((p) => p.availableSizes?.includes(size));
  result = result.filter((p) => {
    const price = p?.price?.current ?? 0;
    return price >= minPrice && price <= maxPrice;
  });

  const paginated = result.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    products: paginated,
    hasMore: page * limit < result.length, // 👈 THIS STOPS SCROLL
  });
}
// --- GET RECOMMENDATIONS (same category + similar price) ---
export async function GET_RECOMMENDATIONS(req) {
  await connectDb();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { message: "Product ID required" },
      { status: 400 }
    );
  }

  const cache = getCache();
  let products = cache.products.length
    ? cache.products
    : await Products.find().lean();

  // find current product
  const current = products.find((p) => p._id.toString() === id);

  if (!current) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  const price = current.price?.current || 0;
  const category = current.category;

  // recommended: same category + price ± 30%
  const low = price * 0.7;
  const high = price * 1.3;

  const recs = products
    .filter(
      (p) =>
        p._id.toString() !== id &&
        p.category === category &&
        p.price?.current >= low &&
        p.price?.current <= high
    )
    .slice(0, 10); // limit to 10

  return NextResponse.json({ recommendations: recs }, { status: 200 });
}

// NOTE: This assumes DELETE is called with the product ID in the query, e.g., /api/products?id=12345
export async function DELETE(request) {
  await connectDb();

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required for deletion." },
        { status: 400 }
      );
    }

    const product = await Products.findById(productId);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }

    // --- 1. Collect all File IDs for cleanup ---
    const fileIdsToClean = [];

    // Main images
    if (product.imageFrontFileId)
      fileIdsToClean.push(product.imageFrontFileId.toString());
    if (product.imageBackFileId)
      fileIdsToClean.push(product.imageBackFileId.toString());

    // Gallery images
    product.gallery.forEach((img) => {
      if (img.fileId) fileIdsToClean.push(img.fileId.toString());
    });

    // --- 2. Delete product from MongoDB ---
    await Products.deleteOne({ _id: productId });

    // --- 3. Clean up files from GridFS (Cleanup runs *after* DB delete for reliability) ---
    if (fileIdsToClean.length > 0) {
      try {
        console.log(
          `Cleaning up ${fileIdsToClean.length} files from GridFS...`
        );
        await Promise.all(fileIdsToClean.map((id) => deleteFromGridFs(id)));
        console.log("GridFS cleanup successful.");
      } catch (cleanupError) {
        console.error(
          "GridFS Cleanup Failed after product deletion:",
          cleanupError.message
        );
        // Continue, as the main product deletion was successful
      }
    }

    return NextResponse.json(
      { status: "success", message: "Product and associated images deleted." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Product DELETE Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to delete product.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
