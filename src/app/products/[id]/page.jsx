import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectDb } from "@/lib/dbConnect";
import Products from "@/models/Products";
import ProductDetailsClient from "@/components/product/ProductDetailsClient";

export default async function ProductDetails({ params }) {
  const awaited = await params;
  const id = awaited.id;

  if (!mongoose.Types.ObjectId.isValid(id)) return notFound();

  await connectDb();
  const product = await Products.findById(id).lean({ virtuals: true });

  if (!product) return notFound();

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <ProductDetailsClient product={JSON.parse(JSON.stringify(product))} />
    </div>
  );
}
