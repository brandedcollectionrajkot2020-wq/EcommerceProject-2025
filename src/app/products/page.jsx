"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import InfiniteScroll from "react-infinite-scroll-component";
import ProductCard from "@/components/Layouts/ProductCard";
import toast from "react-hot-toast";
import HeroSection from "@/components/products/HeroSection";

const CATEGORY_OPTIONS = ["Oversized", "Shirts", "Hoodies", "Joggers"];
const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const PAGE_SIZE = 12;

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const urlMainCategory = searchParams.get("mainCategory") || "";
  const urlCategory = searchParams.get("category") || "";
  const urlSize = searchParams.get("size") || "";
  const urlSearch = searchParams.get("search") || "";

  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState(true);

  const [filters, setFilters] = useState({
    search: urlSearch,
    mainCategory: urlMainCategory,
    category: urlCategory ? [urlCategory] : [],
    size: urlSize,
    price: [0, 5000],
  });

  // ---------------------------------------
  // LOAD PRODUCTS FROM API
  // ---------------------------------------
  useEffect(() => {
    async function load() {
      try {
        let url = `/api/products?limit=999&mainCategory=${filters.mainCategory}&minPrice=${filters.price[0]}&maxPrice=${filters.price[1]}`;

        if (filters.category.length) url += `&category=${filters.category[0]}`;
        if (filters.size) url += `&size=${filters.size}`;
        if (filters.search) url += `&search=${filters.search}`;

        const res = await fetch(url);
        const data = await res.json();

        if (!data.products) return toast.error("Failed loading products");

        setAllProducts(data.products);
        setProducts(data.products.slice(0, PAGE_SIZE));
        setHasMore(data.products.length > PAGE_SIZE);
      } catch (err) {
        toast.error("Error loading products");
      }
    }
    load();
  }, [
    filters.mainCategory,
    filters.category,
    filters.size,
    filters.search,
    filters.price, // ⭐ ADD THIS
  ]);

  // ---------------------------------------
  // LOAD MORE
  // ---------------------------------------
  const loadMore = () => {
    const newCount = visibleCount + PAGE_SIZE;
    setVisibleCount(newCount);
    setProducts(allProducts.slice(0, newCount));
    setHasMore(newCount < allProducts.length);
  };

  // ---------------------------------------
  // UI HELPERS
  // ---------------------------------------
  const toggleCategory = (c) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category.includes(c) ? [] : [c],
    }));
  };

  const toggleSize = (s) => {
    setFilters((prev) => ({
      ...prev,
      size: prev.size === s ? "" : s,
    }));
  };
  const slides = [
    { type: "image", url: "/assets/CarouselAssets/banner1.avif" },
    { type: "video", url: "/assets/CarouselAssets/video1.mp4" },
    { type: "image", url: "/assets/CarouselAssets/banner2.avif" },
  ];
  return (
    <div className="min-h-screen bg-[#fff9f4]">
      {/* HERO */}
      <HeroSection slides={slides} search={search} setSearch={setSearch} />
      {/* <div className="bg-[#654321] text-white flex items-center justify-center flex-col py-6 px-6">
        <h2 className="text-2xl font-bold">
          {filters.mainCategory
            ? filters.mainCategory.toUpperCase()
            : "PRODUCTS"}
        </h2>
        <p className="text-sm opacity-80">Home / Products</p>
      </div> */}
      <div className="flex max-w-7xl mx-auto gap-6 px-4 py-6">
        {/* SIDEBAR */}
        <aside className="hidden md:block w-72 space-y-6">
          {/* Search */}
          <div>
            <h4 className="font-semibold text-[#654321] mb-2">Search</h4>
            <input
              value={filters.search}
              onChange={(e) =>
                setFilters((p) => ({ ...p, search: e.target.value }))
              }
              className="border px-3 py-2 rounded-md w-full"
              placeholder="Search..."
            />
          </div>

          {/* Category */}
          <div>
            <h4 className="font-semibold text-[#654321] mb-2">Category</h4>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleCategory(c)}
                  className={`px-3 py-1 text-sm rounded-full border ${
                    filters.category.includes(c)
                      ? "bg-[#654321] text-white"
                      : "border-gray-400 text-gray-700"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <h4 className="font-semibold text-[#654321] mb-2">Size</h4>
            <div className="flex flex-wrap gap-2">
              {SIZE_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSize(s)}
                  className={`px-3 py-1 text-sm rounded-full border ${
                    filters.size === s
                      ? "bg-[#654321] text-white"
                      : "border-gray-400 text-gray-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-[#654321] mb-2">Price</h4>
            <input
              type="range"
              min="0"
              color="black"
              max="5000"
              value={filters.price[1]}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  price: [0, Number(e.target.value)],
                }))
              }
              className="w-full bg-amber-600"
            />
            <p className="text-sm mt-1">
              Up to: <span className="font-bold">₹{filters.price[1]}</span>
            </p>
          </div>
        </aside>

        {/* PRODUCT GRID */}
        <div className="flex-1">
          <InfiniteScroll
            dataLength={products.length}
            next={loadMore}
            hasMore={hasMore}
            loader={
              <p className="text-center py-6 text-gray-500">Loading...</p>
            }
            scrollThreshold={0.8}
            style={{ overflow: "visible" }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </InfiniteScroll>

          {!products.length && (
            <p className="text-center py-10 text-gray-500 text-lg">
              No matching products 😢
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
