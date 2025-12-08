import { NextResponse } from "next/server";
import Products from "@/models/Products";
import { connectDb } from "@/lib/dbConnect";

export async function GET(req) {
  await connectDb();

  const keyword = req.nextUrl.searchParams.get("q")?.trim();

  if (!keyword || keyword.length < 2)
    return NextResponse.json({ suggestions: [] });

  // 🔥 Smart Query
  const results = await Products.find({
    $or: [
      { $text: { $search: keyword } },
      { name: { $regex: keyword, $options: "i" } },
      { category: { $regex: keyword, $options: "i" } },
      { tags: { $regex: keyword, $options: "i" } },
      { material: { $regex: keyword, $options: "i" } },
      { theme: { $regex: keyword, $options: "i" } },
    ],
  })
    .limit(6)
    .select("name category imageFront price");

  return NextResponse.json({ suggestions: results });
}
