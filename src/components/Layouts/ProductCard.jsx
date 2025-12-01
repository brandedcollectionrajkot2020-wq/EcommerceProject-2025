"use client";
import React, { useState } from "react";
import Image from "next/image";
import { HeartIcon } from "@heroicons/react/24/outline";

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [frontLoaded, setFrontLoaded] = useState(false);

  const defaultProduct = {
    name: "Ben 10: Omnitrix",
    category: "Oversized T-Shirts",
    price: { current: 899, old: 1049, discountText: "150 OFF" },
    imageFront: "/assets/Products/Product1.jpg",
    imageBack: "/assets/Products/Product1Back.jpg",
    badges: ["OVERSIZED FIT", "PREMIUM FABRIC"],
  };

  const currentProduct = product || defaultProduct;

  // --- FIX: Works in Dev + Production + GridFS ---
  const resolveImage = (img) => {
    if (!img) return "/placeholder.png";

    if (img.startsWith("http")) return img;

    // for GridFS images
    if (img.startsWith("/api/images")) return img;

    return img; // public folder
  };

  const FRONT_URL = resolveImage(currentProduct.imageFront);
  const BACK_URL = resolveImage(currentProduct.imageBack);

  return (
    <div className="relative group w-full max-w-sm bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div
        className="relative w-full h-96 overflow-hidden cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {!frontLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        {/* FRONT IMAGE */}
        <Image
          src={FRONT_URL}
          alt={currentProduct.name}
          fill
          sizes="(max-width:768px) 100vw, 33vw"
          loading="lazy"
          onLoad={() => setFrontLoaded(true)}
          className={`object-cover transition-opacity duration-500 ${
            frontLoaded && !isHovered ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* BACK IMAGE */}
        {frontLoaded && BACK_URL && (
          <Image
            src={BACK_URL}
            alt="Back"
            fill
            sizes="(max-width:768px) 100vw, 33vw"
            loading="lazy"
            className={`object-cover transition-opacity duration-500 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {frontLoaded && (
          <>
            {/* Wishlist Button */}
            <button className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md hover:scale-105 transition-all">
              <HeartIcon className="h-5 w-5 text-gray-700" />
            </button>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1">
              {currentProduct.badges?.map((badge, i) => (
                <span key={i} className="bg-black text-white text-xs px-2 py-1">
                  {badge}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* PRODUCT INFO */}
      <div
        className={`p-4 transition-opacity duration-500 ${
          frontLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
          {currentProduct.name}
        </h3>
        <p className="text-sm text-gray-500 mb-2 line-clamp-1">
          {currentProduct.category}
        </p>

        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold">
            ₹{currentProduct.price?.current}
          </span>
          {currentProduct.price?.old && (
            <span className="line-through text-gray-400">
              ₹{currentProduct.price.old}
            </span>
          )}
          {currentProduct.price?.discountText && (
            <span className="text-red-500 font-medium">
              {currentProduct.price.discountText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
