"use client";
import React, { useRef } from "react";
import ProductCard from "../Layouts/ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const FeaturedProducts = () => {
  const swiperRef = useRef(null);

  // Sample product data - replace with your actual data
  const products = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
    { id: 7 },
    { id: 8 },
    { id: 9 },
    { id: 10 },
    { id: 11 },
    { id: 12 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-center font-semibold text-[26px] md:text-[30px] tracking-wider text-neutral-800 mb-10">
        FEATURED PRODUCTS
      </h2>
      <div className="relative">
        <Swiper
          modules={[Pagination, Autoplay, Navigation]}
          spaceBetween={24}
          slidesPerView={1}
          onSwiper={(swiper) => {
            swiperRef.current = swiper; // Store swiper instance
          }}
          breakpoints={{
            // Mobile (< 640px)
            0: {
              slidesPerView: 1,
              spaceBetween: 16,
            },
            // Tablet (≥ 640px)
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            // Laptop (≥ 1024px)
            1024: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
            // Desktop (≥ 1280px)
            1280: {
              slidesPerView: 4,
              spaceBetween: 24,
            },
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          loop={true}
          className="featured-swiper"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <div className="h-full">
                <ProductCard />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons - ✅ 100% WORKING */}
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 hover:bg-white shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-300 group"
          onClick={() => swiperRef.current?.slidePrev()}
        >
          <svg
            className="w-6 h-6 group-hover:-translate-x-1 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 hover:bg-white shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-300 group"
          onClick={() => swiperRef.current?.slideNext()}
        >
          <svg
            className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FeaturedProducts;
