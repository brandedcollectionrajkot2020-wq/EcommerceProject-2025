"use client";
import React, { useState } from "react";
import Image from "next/image";
import { HeartIcon } from "@heroicons/react/24/outline";

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [frontLoaded, setFrontLoaded] = useState(false); // <-- FIX: only track the front image load

  const defaultProduct = {
    id: "1",
    name: "Ben 10: Omnitrix",
    category: "Oversized T-Shirts",
    price: { current: 899, old: 1049, discountText: "150 OFF" },
    imageFront: "/assets/Products/Product1.jpg",
    imageBack: "/assets/Products/Product1Back.jpg",
    badges: ["OVERSIZED FIT", "PREMIUM HEAVY GAUGE FABRIC"],
  };

  const currentProduct = product || defaultProduct;

  return (
    <div className="relative group w-full max-w-sm bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div
        className="relative w-full h-96 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Skeleton Until Front Loads */}
        {!frontLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        {/* FRONT IMAGE - Primary loader */}
        <Image
          src={currentProduct.imageFront}
          alt={currentProduct.name}
          fill
          loading="lazy"
          onLoad={() => setFrontLoaded(true)} // <-- FIX: only front controls the state
          className={`object-cover transition-opacity duration-500 
            ${
              frontLoaded
                ? isHovered
                  ? "opacity-0"
                  : "opacity-100"
                : "opacity-0"
            }`}
        />

        {/* BACK IMAGE (only visible when front is loaded AND hovered) */}
        {frontLoaded && (
          <Image
            src={currentProduct.imageBack}
            alt="Back"
            fill
            loading="lazy"
            className={`object-cover transition-opacity duration-500 
              ${isHovered ? "opacity-100" : "opacity-0"}`}
          />
        )}

        {/* Badges */}
        {frontLoaded && (
          <div className="absolute top-4 left-4 flex flex-col space-y-2 z-10">
            {currentProduct.badges.map((badge, i) => (
              <span
                key={i}
                className="bg-neutral-800 text-white text-xs font-semibold px-2 py-1 tracking-wider"
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Heart Icon */}
        {frontLoaded && (
          <button className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md hover:scale-105 transition-transform duration-200">
            <HeartIcon className="h-5 w-5 text-gray-700" />
          </button>
        )}
      </div>

      {/* DETAILS SECTION */}
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

        <div className="flex items-baseline space-x-2">
          <span className="text-xl font-bold text-gray-900">
            ₹{currentProduct.price?.current}
          </span>

          {currentProduct.price?.old && (
            <span className="text-sm text-gray-400 line-through">
              ₹{currentProduct.price.old}
            </span>
          )}

          {currentProduct.price?.discountText && (
            <span className="text-sm text-red-500 font-medium">
              {currentProduct.price.discountText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
