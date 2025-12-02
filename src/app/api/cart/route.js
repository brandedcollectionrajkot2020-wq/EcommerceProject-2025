import { NextResponse } from "next/server";
import { connectDb } from "@/lib/dbConnect";
import Products from "@/models/Products";
import User from "@/models/User";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

/**
 * GET /api/cart
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  if (!token)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const decoded = jwtDecode(token);

  await connectDb();

  const populatedUser = await User.findById(decoded.userId).populate(
    "cart.product"
  );

  const items = populatedUser.cart.map((item) => ({
    _id: item.product._id,
    qty: item.qty,
    product: item.product.toObject({ virtuals: true }),
  }));

  return NextResponse.json({ status: "success", cart: items });
}

/**
 * POST /api/cart
 */
export async function POST(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  if (!token)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const decoded = jwtDecode(token);

  await connectDb();
  const user = await User.findById(decoded.userId);

  const { productId, qty = 1 } = await request.json();
  if (!productId)
    return NextResponse.json(
      { message: "productId required" },
      { status: 400 }
    );

  const product = await Products.findById(productId);
  if (!product)
    return NextResponse.json({ message: "Product not found" }, { status: 404 });

  const index = user.cart.findIndex(
    (item) => item.product.toString() === productId
  );

  if (index === -1) user.cart.push({ product: productId, qty });
  else user.cart[index].qty += qty;

  await user.save();

  return NextResponse.json({ status: "success" });
}

/**
 * PATCH /api/cart
 */
export async function PATCH(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  if (!token)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const decoded = jwtDecode(token);

  await connectDb();
  const user = await User.findById(decoded.userId);

  const { productId, qty } = await request.json();
  if (!productId || typeof qty !== "number")
    return NextResponse.json(
      { message: "productId & qty required" },
      { status: 400 }
    );

  const index = user.cart.findIndex(
    (item) => item.product.toString() === productId
  );

  if (index === -1)
    return NextResponse.json({ message: "Item not found" }, { status: 404 });

  if (qty <= 0) user.cart.splice(index, 1);
  else user.cart[index].qty = qty;

  await user.save();

  return NextResponse.json({ status: "success" });
}

/**
 * DELETE /api/cart
 */
export async function DELETE(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  if (!token)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const decoded = jwtDecode(token);

  await connectDb();
  const user = await User.findById(decoded.userId);

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId)
    return NextResponse.json(
      { message: "productId required" },
      { status: 400 }
    );

  user.cart = user.cart.filter((item) => item.product.toString() !== productId);

  await user.save();

  return NextResponse.json({ status: "success" });
}
