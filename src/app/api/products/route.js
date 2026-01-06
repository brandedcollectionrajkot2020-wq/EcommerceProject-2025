import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDb } from "@/lib/dbConnect";
import Products from "@/models/Products";
import { uploadToGridFs, deleteFromGridFs } from "@/lib/gridFsClient";
import {
  getCache,
  setCache,
  removeCacheItem,
  clearCache,
} from "@/lib/globalProductChache";

export const dynamic = "force-dynamic";
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
function normalizeSlugToLabel(slug) {
  if (!slug) return "";
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ---------------- POST ---------------- */
export async function POST(req) {
  await connectDb();
  const uploadedFileIds = [];

  try {
    const formData = await req.formData();
    const productData = JSON.parse(formData.get("productData"));

    const front = await uploadToBlob(formData.get("imageFront"));
    uploadedFileIds.push(front.id.toString());

    let back = {};
    const backFile = formData.get("imageBack");
    if (backFile && backFile.size > 0) {
      back = await uploadToBlob(backFile);
      uploadedFileIds.push(back.id.toString());
    }

    const gallery = [];
    for (const file of formData.getAll("galleryImages")) {
      if (file.size > 0) {
        const img = await uploadToBlob(file);
        uploadedFileIds.push(img.id.toString());
        gallery.push({ fileId: img.id, filename: img.filename });
      }
    }

    const product = await Products.create({
      ...productData,
      imageFrontFileId: front.id,
      imageFrontFilename: front.filename,
      imageBackFileId: back.id,
      imageBackFilename: back.filename,
      gallery,
    });

    const cache = getCache();
    cache.products.unshift(product.toObject({ virtuals: true }));

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.log(err);

    await Promise.all(uploadedFileIds.map((id) => deleteFromGridFs(id)));
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

/* ---------------- GET ---------------- */
export async function GET(req) {
  await connectDb();

  const cache = getCache();

  // ✅ Only hit DB if cache is empty
  if (!cache.products.length) {
    const db = await Products.find().lean({ virtuals: true });
    setCache(db);
  }

  const { searchParams } = new URL(req.url);

  const mainCategory = searchParams.get("mainCategory");
  const categorySlug = searchParams.get("category");
  const subcategorySlug = searchParams.get("subcategory");
  const size = searchParams.get("size");
  const featured = searchParams.get("featured");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  let result = [...getCache().products];

  /* ---------- CATEGORY FILTERS ---------- */

  if (mainCategory) {
    result = result.filter((p) => p.mainCategory === mainCategory);
  }

  if (categorySlug) {
    const categoryLabel = normalizeSlugToLabel(categorySlug);
    result = result.filter((p) => p.category === categoryLabel);
  }

  if (subcategorySlug) {
    const subLabel = normalizeSlugToLabel(subcategorySlug);
    result = result.filter((p) => p.subcategory === subLabel);
  }

  /* ---------- SIZE FILTER ---------- */

  if (size) {
    result = result.filter((p) =>
      p.sizes?.some((s) => s.size === size && s.quantity > 0)
    );
  }

  /* ---------- FEATURED FILTER ---------- */

  if (featured === "true") {
    result = result.filter((p) => p.featured === true);
  }

  /* ---------- PRICE FILTER (FIXED) ---------- */

  const min = minPrice !== null ? Number(minPrice) : null;
  const max = maxPrice !== null ? Number(maxPrice) : null;

  result = result.filter((p) => {
    const price = Number(p?.price?.current);

    // 🚫 skip products with invalid price
    if (Number.isNaN(price)) return false;

    if (min !== null && !Number.isNaN(min) && price < min) return false;
    if (max !== null && !Number.isNaN(max) && price > max) return false;

    return true;
  });

  return NextResponse.json({
    products: result,
    hasMore: false,
  });
}

/* ---------------- PUT ---------------- */
export async function PUT(req) {
  await connectDb();

  try {
    const formData = await req.formData();
    const productId = formData.get("productId");
    const productData = JSON.parse(formData.get("productData"));

    const product = await Products.findById(productId);
    if (!product) throw new Error("Product not found");

    Object.assign(product, productData);
    await product.save();

    const cache = getCache();
    const index = cache.products.findIndex(
      (p) => p._id.toString() === productId
    );
    if (index !== -1)
      cache.products[index] = product.toObject({ virtuals: true });

    return NextResponse.json({ product });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

/* ---------------- DELETE ---------------- */
export async function DELETE(req) {
  await connectDb();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const product = await Products.findById(id);
  if (!product) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const fileIds = [
    product.imageFrontFileId,
    product.imageBackFileId,
    ...product.gallery.map((g) => g.fileId),
  ].filter(Boolean);

  await Products.deleteOne({ _id: id });
  await Promise.all(fileIds.map((fid) => deleteFromGridFs(fid.toString())));

  // ✅ USE CACHE HELPER
  await clearCache();
  console.log("chache cleared", getCache());
  const data = getCache();
  console.log(data);

  return NextResponse.json({ success: true });
}
