"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Heart, ShoppingBag, CheckCircle2 } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import toast from "react-hot-toast";

import { useAppStore } from "@/store/useAppStore";
import { useCartStore } from "@/store/useCartStore";
import CartModal from "../Layouts/CartModal";
import ProductCard from "../Layouts/ProductCard";
import { redirect } from "next/navigation";

const PALETTE = {
  BACKGROUND: "bg-[#fff9f4]",
  BORDER: "border-[#deb887]",
  TEXT: "text-[#654321]",
  ACCENT: "bg-[#654321]",
  HOVER: "hover:bg-[#deb887]",
};

export default function ProductDetailsClient({ product }) {
  // ------- Image Fix -------
  const imgFront = product?.imageFront || null;
  const imgBack = product?.imageBack || null;

  const gallery = useMemo(() => {
    const extra = product?.gallery?.map((g) => `/api/images/${g.fileId}`) || [];
    return [imgFront, imgBack, ...extra].filter(Boolean);
  }, [product]);

  // Recommendation
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    async function loadRecs() {
      const res = await fetch(
        `/api/products/recommendations?id=${product._id}`
      );
      const data = await res.json();
      setRecommended(data.recommendations || []);
    }
    loadRecs();
  }, [product._id]);

  // Wishlist
  const { wishlist, addToWishlist, removeFromWishlist } = useAppStore();
  const isWishlisted = wishlist.some((item) => item._id === product._id);

  const toggleWishlist = () => {
    isWishlisted ? removeFromWishlist(product._id) : addToWishlist(product);
  };

  // Cart
  const addToCart = useCartStore((s) => s.addToCart);
  const [selectedSize, setSelectedSize] = useState(null);
  const [added, setAdded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSize) return toast.error("Select a size first 👕");

    addToCart({
      _id: product._id,
      name: product.name,
      selectedSize,
      price: product.price.current,
      imageFront: imgFront,
      availableSizes: product.availableSizes,
    });

    setAdded(true);
    toast.success(`Added to Cart 🛍 (${selectedSize})`);
  };

  return (
    <div
      className={`max-w-[1400px] mx-auto px-4 py-10 ${PALETTE.BACKGROUND} overflow-x-hidden`}
    >
      {/* 🧭 Breadcrumb */}
      <p className={`text-xs opacity-60 mb-4 ${PALETTE.TEXT}`}>
        Home / {product.category} /{" "}
        <span className="opacity-90">{product.name}</span>
      </p>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-10">
        {/* 🖼 DESKTOP IMAGES */}
        <div className="hidden lg:grid grid-cols-2 gap-6">
          {gallery.map((img, i) => (
            <div
              key={i}
              className="relative w-full h-[650px] rounded-lg overflow-hidden bg-[#ebdfd6]"
            >
              <Image
                src={img}
                fill
                alt={product.name}
                className="object-cover hover:scale-105 duration-500"
              />
            </div>
          ))}
        </div>

        {/* 📱 MOBILE + TABLET SWIPER */}
        <div className="lg:hidden w-full max-w-full overflow-hidden">
          <Swiper>
            {gallery.map((img, i) => (
              <SwiperSlide key={i}>
                <div className="relative w-full h-[420px] sm:h-[480px] rounded-xl overflow-hidden bg-[#ead9c9]">
                  <Image
                    src={img}
                    fill
                    alt={product.name}
                    className="object-cover"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:sticky lg:top-10 space-y-6 overflow-x-hidden">
          <h1 className={`text-3xl font-semibold ${PALETTE.TEXT}`}>
            {product.name}
          </h1>

          {/* Wishlist */}
          <button
            onClick={toggleWishlist}
            className={`p-2 border rounded-md transition ${PALETTE.BORDER} ${PALETTE.TEXT} hover:bg-[#deb887]`}
          >
            <Heart
              className={`${isWishlisted ? "fill-red-500 text-red-500" : ""}`}
            />
          </button>

          {/* PRICE */}
          <div className={`border-y py-4 ${PALETTE.BORDER}`}>
            <p className={`text-3xl font-bold ${PALETTE.TEXT}`}>
              ₹{product.price?.current}
            </p>
          </div>

          {/* Size */}
          <div>
            <p className={`text-xs uppercase mb-2 ${PALETTE.TEXT}`}>
              Select Size
            </p>
            <div className="flex gap-2 flex-wrap">
              {product.availableSizes?.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-5 py-2 rounded-md text-sm border transition ${
                    selectedSize === s
                      ? `${PALETTE.ACCENT} text-white`
                      : `${PALETTE.BORDER} ${PALETTE.TEXT} hover:bg-[#deb887]`
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Cart */}
          {!added ? (
            <button
              onClick={handleAddToCart}
              className={`${PALETTE.ACCENT} ${PALETTE.HOVER} w-full py-3 rounded-md text-white flex items-center justify-center gap-2`}
            >
              <ShoppingBag className="w-5 h-5" /> Add To Bag
            </button>
          ) : (
            <button
              onClick={() => redirect("/cart")}
              className={`w-full py-3 border ${PALETTE.BORDER} rounded-md flex items-center justify-center gap-2 font-semibold ${PALETTE.TEXT} hover:bg-[#deb88740]`}
            >
              <CheckCircle2 className="w-5 h-5" /> Go To Cart
            </button>
          )}

          {/* Description */}
          <div>
            <h3 className={`text-lg font-semibold mt-4 ${PALETTE.TEXT}`}>
              Description
            </h3>
            <p className="text-sm text-gray-600">{product.description}</p>
          </div>
        </div>
      </div>

      {cartOpen && <CartModal close={() => setCartOpen(false)} />}

      {/* ================= Recommended ================= */}
      {recommended.length > 0 && (
        <div className="mt-16">
          <h2 className={`text-2xl font-semibold mb-4 ${PALETTE.TEXT}`}>
            You may also like
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommended.map((prod, idx) => (
              <ProductCard product={prod} key={idx} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
