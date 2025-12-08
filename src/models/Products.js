import mongoose from "mongoose";
import slugify from "slugify"; // <— ADD THIS (npm i slugify)

const { Schema } = mongoose;

/** ---------- Price Schema ---------- */
const PriceSchema = new Schema(
  {
    current: { type: Number, required: true },
    old: { type: Number },
    discountText: { type: String, trim: true },
  },
  { _id: false }
);

const SpecificationSchema = new Schema(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const GalleryImageSchema = new Schema(
  {
    fileId: { type: Schema.Types.ObjectId, required: true },
    filename: { type: String, required: true },
  },
  { _id: false }
);

/** ---------- MAIN PRODUCT SCHEMA ---------- */
const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true }, // 🔥 Slug added

    brand: { type: String, default: "Branded Collection" },
    category: { type: String, required: true, trim: true },
    subcategory: { type: String, trim: true },

    price: { type: PriceSchema, required: true },

    imageFrontFileId: { type: Schema.Types.ObjectId, required: true },
    imageBackFileId: { type: Schema.Types.ObjectId },
    imageFrontFilename: { type: String, required: true },
    imageBackFilename: { type: String },

    description: { type: String },
    specifications: [SpecificationSchema],
    material: { type: String },
    careInstructions: { type: String },

    gallery: [GalleryImageSchema],

    tags: [{ type: String }],
    availableSizes: [
      {
        type: String,
        enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
      },
    ],

    isNewArrival: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },

    salesCount: { type: Number, default: 0 },
    stock: { type: Number, default: 100 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/** ----------------------------------
🔥 VIRTUAL IMAGE URLs
---------------------------------- **/

ProductSchema.virtual("imageFront").get(function () {
  return this.imageFrontFileId ? `/api/images/${this.imageFrontFileId}` : null;
});

ProductSchema.virtual("imageBack").get(function () {
  return this.imageBackFileId ? `/api/images/${this.imageBackFileId}` : null;
});

ProductSchema.virtual("galleryUrls").get(function () {
  return this.gallery?.map((g) => ({
    url: `/api/images/${g.fileId}`,
    filename: g.filename,
  }));
});

/** ----------------------------------
⭐ TEXT SEARCH INDEX
---------------------------------- **/
ProductSchema.index(
  {
    name: "text",
    brand: "text",
    category: "text",
    subcategory: "text",
    description: "text",
    material: "text",
    tags: "text",
    "specifications.key": "text",
    "specifications.value": "text",
  },
  {
    name: "ProductTextIndex",
    weights: {
      name: 10,
      brand: 8,
      category: 7,
      material: 6,
      tags: 5,
      description: 4,
      "specifications.value": 3,
    },
  }
);

/** ----------------------------------
🔥 PRE-SAVE HOOK WITH SLUG BUILDER
---------------------------------- **/
ProductSchema.pre("save", async function (next) {
  if (!this.isModified("name")) return next();

  const baseSlug = slugify(this.name, {
    lower: true,
    strict: true, // remove symbols
  });

  let newSlug = baseSlug;
  let counter = 1;

  // ensure unique slug
  while (await mongoose.models.Product.findOne({ slug: newSlug })) {
    newSlug = `${baseSlug}-${counter++}`;
  }

  this.slug = newSlug;
  next();
});

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
