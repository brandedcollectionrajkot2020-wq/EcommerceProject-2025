import { NextResponse } from "next/server";
import { connectDb } from "@/lib/dbConnect";
import Products from "@/models/Products";
import { getCache, setCache } from "@/lib/globalProductChache";

export async function GET(req) {
  await connectDb();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { message: "Product ID required" },
      { status: 400 }
    );
  }

  // Load cache
  let cache = getCache();
  if (!cache.products.length) {
    const dbData = await Products.find().lean({ virtuals: true });
    setCache(dbData);
    cache = getCache();
  }

  const products = cache.products;
  const current = products.find((p) => p._id.toString() === id);

  if (!current) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  const price = current.price?.current || 0;

  // 🎯 Weight System (AI Style)
  const WEIGHTS = {
    category: 50,
    mainCategory: 30,
    price: 40,
    tags: 15,
    fabric: 10,
    fits: 15,
    sizes: 10,
  };

  function scoreProduct(p) {
    if (p._id.toString() === current._id.toString()) return -1;

    let score = 0;

    // 1) Category match
    if (p.category === current.category) score += WEIGHTS.category;
    else if (p.mainCategory === current.mainCategory)
      score += WEIGHTS.mainCategory;

    // 2) Price similarity
    const priceDiff = Math.abs((p.price?.current || 0) - price);
    const pricePercent = priceDiff / price;

    if (pricePercent < 0.1) score += WEIGHTS.price; // very close
    else if (pricePercent < 0.25) score += WEIGHTS.price * 0.6;
    else if (pricePercent < 0.4) score += WEIGHTS.price * 0.3;

    // 3) Tags match
    if (current.tags?.length && p.tags?.length) {
      const commonTags = p.tags.filter((t) => current.tags.includes(t));
      score += commonTags.length * WEIGHTS.tags;
    }

    // 4) Fabric match
    if (p.fabric && p.fabric === current.fabric) {
      score += WEIGHTS.fabric;
    }

    // 5) Fit match
    if (p.fits && p.fits === current.fits) {
      score += WEIGHTS.fits;
    }

    // 6) Size overlap
    if (
      Array.isArray(current.availableSizes) &&
      Array.isArray(p.availableSizes)
    ) {
      const common = p.availableSizes.filter((s) =>
        current.availableSizes.includes(s)
      );
      score += Math.min(common.length * WEIGHTS.sizes, WEIGHTS.sizes);
    }

    return score;
  }

  // 🧠 Sort all products by score (descending)
  const recommendations = products
    .map((p) => ({ ...p, _score: scoreProduct(p) }))
    .filter((p) => p._score > 0) // ignore negative scores
    .sort((a, b) => b._score - a._score)
    .slice(0, 10);

  return NextResponse.json({ recommendations });
}
