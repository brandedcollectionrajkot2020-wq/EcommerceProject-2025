"use client";

import React, { useState } from "react";
import Image from "next/image";
import { HeartIcon } from "@heroicons/react/24/outline"; // Assuming you have Heroicons installed

// If you don't have Heroicons, you can use a simple SVG icon or a regular image.
// Example SVG for HeartIcon (replace if using Heroicons):
/*
const HeartIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={props.className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.835 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
    />
  </svg>
);
*/

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Fallback for product data if not provided (for demonstration)
  const defaultProduct = {
    id: "1",
    name: "Ben 10: Omnitrix",
    category: "Oversized T-Shirts",
    price: 899,
    oldPrice: 1049,
    discount: "150 OFF",
    imageFront: "/assets/Products/Product1.jpg", // Make sure these paths are correct or set up placeholders
    imageBack: "/assets/Products/Product1Back.jpg", // in your public directory for testing.
    badges: ["OVERSIZED FIT", "PREMIUM HEAVY GAUGE FABRIC"],
  };

  const currentProduct = product || defaultProduct;

  return (
    <div className="relative group w-full max-w-sm bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Product Image Section */}
      <div
        className="relative w-full h-96 overflow-hidden" // Fixed height for image consistency
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Main Image (Front) */}
        <Image
          src={currentProduct.imageFront}
          alt={`${currentProduct.name} - Front`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-opacity duration-500 ease-in-out ${
            isHovered ? "opacity-0" : "opacity-100"
          }`}
          priority // Prioritize loading for visible products
        />

        {/* Hover Image (Back) - Always mounted for smooth transition */}
        <Image
          src={currentProduct.imageBack}
          alt={`${currentProduct.name} - Back`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-opacity duration-500 ease-in-out ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={!isHovered} // Improve accessibility
        />

        {/* Badges on Image */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2 z-10">
          {currentProduct.badges.map((badge, index) => (
            <span
              key={index}
              className="bg-neutral-800 text-white text-xs font-semibold px-2 py-1 tracking-wider"
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Heart Icon */}
        <button
          className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md hover:scale-105 active:scale-95 transition-transform duration-200"
          aria-label="Add to wishlist"
        >
          <HeartIcon className="h-5 w-5 text-gray-700" />
        </button>
      </div>

      {/* Product Details Section */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
          {currentProduct.name}
        </h3>
        <p className="text-sm text-gray-500 mb-2 line-clamp-1">
          {currentProduct.category}
        </p>

        {/* Price and Discount */}
        <div className="flex items-baseline space-x-2">
          <span className="text-xl font-bold text-gray-900">
            ₹{currentProduct.price}
          </span>
          {currentProduct.oldPrice && (
            <span className="text-sm text-gray-400 line-through">
              ₹{currentProduct.oldPrice}
            </span>
          )}
          {currentProduct.discount && (
            <span className="text-sm text-red-500 font-medium">
              {currentProduct.discount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
