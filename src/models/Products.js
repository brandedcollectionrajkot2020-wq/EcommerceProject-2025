import mongoose from "mongoose";
import slugify from "slugify";

const { Schema } = mongoose;

/** ---------- PRICE ---------- */
const PriceSchema = new Schema(
  {
    current: { type: Number, required: true },
    old: { type: Number },
    discountText: { type: String, trim: true },
  },
  { _id: false }
);

/** ---------- SPECIFICATIONS ---------- */
const SpecificationSchema = new Schema(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

/** ---------- GALLERY ---------- */
const GalleryImageSchema = new Schema(
  {
    fileId: { type: Schema.Types.ObjectId, required: true },
    filename: { type: String, required: true },
  },
  { _id: false }
);

/** ---------- SIZE + STOCK ---------- */
const SizeStockSchema = new Schema(
  {
    size: {
      type: String,
      required: true,
      enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

/** ---------- MAIN PRODUCT ---------- */
const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },

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

    /** 🔥 SIZE-WISE STOCK */
    sizes: {
      type: [SizeStockSchema],
      default: [],
    },

    mainCategory: {
      type: String,
      enum: ["clothes", "shoes", "accessories"],
      default: "clothes",
      required: true,
    },

    isNewArrival: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },

    salesCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/** ---------- IMAGE VIRTUALS ---------- */
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

/** ---------- SIZE HELPERS ---------- */
ProductSchema.virtual("availableSizes").get(function () {
  return this.sizes?.filter((s) => s.quantity > 0).map((s) => s.size);
});

ProductSchema.virtual("totalStock").get(function () {
  return this.sizes?.reduce((sum, s) => sum + s.quantity, 0) || 0;
});

/** ---------- SEARCH INDEX ---------- */
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
  { name: "ProductTextIndex" }
);

/** ---------- SLUG ---------- */
ProductSchema.pre("save", async function () {
  if (!this.isModified("name")) return;

  const baseSlug = slugify(this.name, { lower: true, strict: true });
  let slug = baseSlug;
  let i = 1;

  while (await mongoose.models.Product.findOne({ slug })) {
    slug = `${baseSlug}-${i++}`;
  }

  this.slug = slug;
});

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
