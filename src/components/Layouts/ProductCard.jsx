"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import SelectSizeModal from "./SelectSizeModal";
import { useRouter } from "next/navigation";

// STORES
import { useAppStore } from "@/store/useAppStore";
import { useCartStore } from "@/store/useCartStore";

// Theme Colors
const PALETTE = {
  CARD: "bg-[#FAF0E6]",
  BORDER: "border-[#DEB887]",
  TEXT: "text-[#654321]",
  ACCENT: "bg-[#654321] text-white hover:bg-[#7a4a27]",
};

export default function ProductCard({ product }) {
  const router = useRouter();
  const [hover, setHover] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);

  const fallbackProduct = {
    _id: "static",
    name: "Ben 10: Omnitrix Tee",
    category: "Oversized Tee",
    price: { current: 899 },
    imageFront: "/assets/Products/Product1.jpg",
    imageBack: "/assets/Products/Product1Back.jpg",
    availableSizes: ["S", "M", "L", "XL"],
  };

  const item = product || fallbackProduct;
  console.log(item);

  // ❤️ Wishlist
  const wishlist = useAppStore((s) => s.wishlist);
  const addWishlist = useAppStore((s) => s.addToWishlist);
  const removeWishlist = useAppStore((s) => s.removeFromWishlist);
  const isWishlisted = wishlist.some((i) => i._id === item._id);

  // 🛒 Cart
  const addToCart = useCartStore((s) => s.addToCart);

  return (
    <>
      {/* CARD (clickable) */}
      <div
        className={`${PALETTE.CARD} rounded-2xl shadow-md border ${PALETTE.BORDER} 
        transition-all hover:shadow-xl hover:scale-[1.01] cursor-pointer`}
        onClick={() => router.push(`/products/${item._id}`)} // 👈 NOW NAVIGATION WORKS ONLY WHEN CARD CLICKED
      >
        {/* IMAGE */}
        <div
          className="relative h-80 w-full"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <Image
            src={`/api/images/${item.imageFrontFileId}`}
            alt={item.name}
            fill
            className={`object-cover transition duration-500 ${
              hover ? "opacity-0" : "opacity-100"
            }`}
          />

          <Image
            src={`/api/images/${item.imageBackFileId}`}
            alt="back"
            fill
            className={`object-cover transition duration-500 ${
              hover ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* ❤️ WISHLIST BUTTON (Stops navigation) */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // 👈 prevents routing on click
              isWishlisted ? removeWishlist(item._id) : addWishlist(item);
            }}
            className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:scale-110 transition z-20"
          >
            <Heart
              className={`w-5 h-5 ${
                isWishlisted
                  ? "fill-red-500 text-red-500 scale-125"
                  : "text-[#654321]"
              }`}
            />
          </button>
        </div>

        {/* DETAILS */}
        <div className="p-4">
          <h3 className={`font-semibold text-lg truncate ${PALETTE.TEXT}`}>
            {item.name}
          </h3>
          <p className="text-sm text-gray-500">{item.category}</p>

          <div className="flex items-center justify-between mt-3">
            <span className={`text-xl font-bold ${PALETTE.TEXT}`}>
              ₹{item.price.current}
            </span>

            {/* ADD TO CART BUTTON (Stops navigation) */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // 👈 prevents redirect
                setShowSizeModal(true);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${PALETTE.ACCENT}`}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* SIZE MODAL */}
      {showSizeModal && (
        <SelectSizeModal
          sizes={item.availableSizes}
          close={() => setShowSizeModal(false)}
          onSelect={(size) => {
            addToCart({ ...item, selectedSize: size });
            setShowSizeModal(false);
          }}
        />
      )}
    </>
  );
}
