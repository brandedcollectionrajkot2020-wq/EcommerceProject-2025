import { NextResponse } from "next/server";
import { connectDb } from "@/lib/dbConnect";
import Products from "@/models/Products";
import mongoose from "mongoose";

export async function GET(req, context) {
  try {
    await connectDb();

    // 🚀 FIX: unwrap params
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID missing" },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const product = await Products.findById(id).lean({ virtuals: true });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
