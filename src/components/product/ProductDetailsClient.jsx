"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import { Heart, ShoppingCart, CreditCard } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { gsap } from "gsap";
import toast from "react-hot-toast";
import clsx from "clsx";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import "swiper/css/thumbs";

export default function ProductDetailsClient({ product }) {
  const { wishlist, addToWishlist, removeFromWishlist, addToCart } =
    useAppStore();

  const isWishlisted = wishlist.some((w) => w._id === product._id);

  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const gallery = useMemo(() => {
    const extra = product.gallery?.map((g) => `/api/images/${g.fileId}`) ?? [];
    return [product.imageFront, product.imageBack, ...extra].filter(Boolean);
  }, [product]);

  // Animations
  const pageRef = useRef(null);

  useEffect(() => {
    gsap.from(pageRef.current.children, {
      opacity: 0,
      y: 25,
      duration: 0.6,
      stagger: 0.08,
      ease: "power2.out",
    });
  }, []);

  const handleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(product._id);
      toast("Removed from wishlist");
    } else {
      addToWishlist(product);
      toast.success("Added to wishlist");
    }
  };

  return (
    <div
      ref={pageRef}
      className="max-w-6xl mx-auto px-5 py-8 md:py-14 grid gap-12 md:grid-cols-[90px_1fr]"
    >
      {/* --- Breadcrumb --- */}
      <nav className="text-xs text-gray-500 tracking-wide col-span-full mb-3">
        Home / {product.category} /{" "}
        <span className="text-black">{product.name}</span>
      </nav>

      {/* --- Vertical Thumbs --- */}
      <div className="hidden md:flex flex-col gap-3">
        <Swiper
          modules={[FreeMode, Thumbs]}
          onSwiper={setThumbsSwiper}
          direction="vertical"
          slidesPerView={5}
          spaceBetween={10}
          freeMode
          watchSlidesProgress
          className="h-[500px]"
        >
          {gallery.map((src, i) => (
            <SwiperSlide key={i}>
              <div className="relative w-[80px] h-[100px] cursor-pointer border hover:border-black transition rounded-md overflow-hidden">
                <Image src={src} alt="thumb" fill className="object-cover" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* --- Main Product Viewer + Info --- */}
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Main Swiper */}
        <div className="relative rounded-lg overflow-hidden bg-white border">
          <Swiper
            modules={[Navigation, Thumbs]}
            thumbs={{ swiper: thumbsSwiper }}
            navigation
            loop={true}
          >
            {gallery.map((src, index) => (
              <SwiperSlide key={index}>
                <div className="relative h-[420px] md:h-[560px] w-full">
                  <Image
                    src={src}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Product Content */}
        <div className="space-y-6">
          {/* Title + Wishlist */}
          <div className="flex justify-between">
            <h1 className="text-3xl font-medium tracking-tight">
              {product.name}
            </h1>
            <button
              className={clsx(
                "p-3 rounded-full border transition",
                isWishlisted ? "border-red-500 text-red-500" : "border-gray-300"
              )}
              onClick={handleWishlist}
            >
              <Heart
                className={clsx("w-5 h-5", isWishlisted && "fill-red-500")}
              />
            </button>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold">
              ₹{product.price.current}
            </span>
            {product.price.old && (
              <span className="line-through text-gray-400">
                ₹{product.price.old}
              </span>
            )}
          </div>

          {/* Size Selector */}
          <div>
            <p className="text-sm uppercase tracking-wide text-gray-600">
              Select Size
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {product.availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={clsx(
                    "w-12 h-12 border text-sm font-medium transition rounded-md",
                    selectedSize === size
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-black"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed">
            {product.description}
          </p>

          {/* Specs */}
          {product.specifications?.length > 0 && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Product Details</p>
              <table className="text-sm w-full">
                <tbody>
                  {product.specifications.map((spec, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-2 text-gray-500">{spec.key}</td>
                      <td className="py-2">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() =>
                selectedSize
                  ? addToCart({ ...product, selectedSize })
                  : toast.error("Select a size first.")
              }
              className="flex-1 flex items-center justify-center gap-2 border border-black py-3 rounded-lg text-sm hover:bg-black hover:text-white transition"
            >
              <ShoppingCart size={18} /> Add to Cart
            </button>
            {/* <button className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg text-sm hover:opacity-90 transition">
              <CreditCard size={18} /> Buy Now
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}
