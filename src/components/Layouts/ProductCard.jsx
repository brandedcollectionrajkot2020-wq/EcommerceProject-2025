"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import SelectSizeModal from "./SelectSizeModal";
import { useRouter } from "next/navigation";

import { useAppStore } from "@/store/useAppStore";
import { useCartStore } from "@/store/useCartStore";

const PALETTE = {
  CARD: "bg-[#FAF0E6]",
  BORDER: "border-[#DEB887]",
  TEXT: "text-[#654321]",
  ACCENT: "bg-[#654321] text-white hover:bg-[#7a4a27]",
};

export default function ProductCard({ product }) {
  if (!product) return null;
  const item = product;

  const router = useRouter();
  const [hover, setHover] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);

  const wishlist = useAppStore((s) => s.wishlist);
  const addWishlist = useAppStore((s) => s.addToWishlist);
  const removeWishlist = useAppStore((s) => s.removeFromWishlist);
  const isWishlisted = wishlist.some((i) => i._id === item._id);

  const addToCart = useCartStore((s) => s.addToCart);

  return (
    <>
      <div
        className={`${PALETTE.CARD} rounded-2xl shadow-md border ${PALETTE.BORDER}
        transition-all hover:shadow-xl hover:scale-[1.01] cursor-pointer`}
        onClick={() => router.push(`/products/${item._id}`)}
      >
        <div
          className="relative h-80 w-full"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {item.imageFrontFileId && (
            <Image
              src={`/api/images/${item.imageFrontFileId}`}
              alt={item.name}
              fill
              className={`object-cover transition duration-500 ${
                hover ? "opacity-0" : "opacity-100"
              }`}
            />
          )}

          {item.imageBackFileId && (
            <Image
              src={`/api/images/${item.imageBackFileId}`}
              alt="back"
              fill
              className={`object-cover transition duration-500 ${
                hover ? "opacity-100" : "opacity-0"
              }`}
            />
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              isWishlisted ? removeWishlist(item._id) : addWishlist(item);
            }}
            className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:scale-110 transition z-20"
          >
            <Heart
              className={`w-5 h-5 ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-[#654321]"
              }`}
            />
          </button>
        </div>

        <div className="p-4">
          <h3 className={`font-semibold text-lg truncate ${PALETTE.TEXT}`}>
            {item.name}
          </h3>
          <p className="text-sm text-gray-500">{item.category}</p>

          <div className="flex items-center justify-between mt-3">
            <span className={`text-xl font-bold ${PALETTE.TEXT}`}>
              ₹{item.price.current}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();

                if (item.mainCategory === "accessories") {
                  addToCart(item);
                  toast.success("Added to cart 🛒");
                  return;
                }

                setShowSizeModal(true);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${PALETTE.ACCENT}`}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {showSizeModal && (
        <SelectSizeModal
          mainCategory={item.mainCategory}
          sizes={item.sizes}
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
