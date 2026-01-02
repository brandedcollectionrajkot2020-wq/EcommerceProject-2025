"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import InfiniteScroll from "react-infinite-scroll-component";
import ProductCard from "@/components/Layouts/ProductCard";
import toast from "react-hot-toast";
import HeroSection from "@/components/products/HeroSection";

/* --------------------------------- */
/* -------- FILTER DATA ------------- */
/* --------------------------------- */

const CATEGORY_OPTIONS = ["Oversized", "Shirts", "Hoodies", "Joggers"];
const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const PAGE_SIZE = 12;

/* --------------------------------- */
/* -------- MAIN COMPONENT ---------- */
/* --------------------------------- */

export default function ProductsPageClient() {
  const searchParams = useSearchParams();

  const urlMainCategory = searchParams.get("mainCategory") || "";
  const urlCategory = searchParams.get("category") || "";
  const urlSubcategory = searchParams.get("subcategory") || "";
  const urlSize = searchParams.get("size") || "";
  const urlSearch = searchParams.get("search") || "";

  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState(true);

  const [filters, setFilters] = useState({
    search: urlSearch,
    mainCategory: urlMainCategory,
    category: urlCategory ? [urlCategory] : [],
    subcategory: urlSubcategory,
    size: urlSize,
    brand: "",
    discountOnly: false,
    price: [0, 5000],
  });

  /* ---------------- LOAD PRODUCTS ---------------- */

  useEffect(() => {
    async function loadProducts() {
      try {
        let url = `/api/products?limit=999&mainCategory=${filters.mainCategory}&minPrice=${filters.price[0]}&maxPrice=${filters.price[1]}`;

        if (filters.category.length) url += `&category=${filters.category[0]}`;

        if (filters.size) url += `&size=${filters.size}`;
        if (filters.search) url += `&search=${filters.search}`;

        const res = await fetch(url);
        const data = await res.json();

        if (!data.products) {
          toast.error("Failed loading products");
          return;
        }

        let filtered = [...data.products];

        /* BRAND FILTER */
        if (filters.brand) {
          filtered = filtered.filter((p) => p.brand === filters.brand);
        }

        /* SUBCATEGORY FILTER */
        if (filters.subcategory) {
          filtered = filtered.filter(
            (p) => p.subcategory === filters.subcategory
          );
        }

        /* DISCOUNT FILTER */
        if (filters.discountOnly) {
          filtered = filtered.filter(
            (p) => p.price?.old && p.price.old > p.price.current
          );
        }

        setAllProducts(filtered);
        setProducts(filtered.slice(0, PAGE_SIZE));
        setHasMore(filtered.length > PAGE_SIZE);

        /* UNIQUE BRANDS */
        const uniqueBrands = [
          ...new Set(data.products.map((p) => p.brand).filter(Boolean)),
        ];
        setBrands(uniqueBrands);

        /* SUBCATEGORIES */
        if (filters.category.length) {
          const uniqueSubs = [
            ...new Set(data.products.map((p) => p.subcategory).filter(Boolean)),
          ];
          setSubcategories(uniqueSubs);
        } else {
          setSubcategories([]);
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading products");
      }
    }

    loadProducts();
  }, [
    filters.mainCategory,
    filters.category,
    filters.subcategory,
    filters.size,
    filters.search,
    filters.price,
    filters.brand,
    filters.discountOnly,
  ]);

  /* RESET SCROLL */
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters]);

  /* LOAD MORE */
  const loadMore = () => {
    const newCount = visibleCount + PAGE_SIZE;
    setVisibleCount(newCount);
    setProducts(allProducts.slice(0, newCount));
    setHasMore(newCount < allProducts.length);
  };

  /* FILTER HELPERS */
  const toggleCategory = (c) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category.includes(c) ? [] : [c],
      subcategory: "",
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
      <HeroSection
        slides={slides}
        search={filters.search}
        setSearch={(v) => setFilters((p) => ({ ...p, search: v }))}
      />

      <div className="flex max-w-7xl mx-auto gap-6 px-4 py-6">
        {/* SIDEBAR */}
        <aside className="hidden md:block w-72 space-y-6">
          <FilterBlock title="Search">
            <input
              value={filters.search}
              onChange={(e) =>
                setFilters((p) => ({ ...p, search: e.target.value }))
              }
              className="border px-3 py-2 rounded-md w-full"
              placeholder="Search products..."
            />
          </FilterBlock>

          <FilterBlock title="Category">
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((c) => (
                <FilterChip
                  key={c}
                  active={filters.category.includes(c)}
                  onClick={() => toggleCategory(c)}
                >
                  {c}
                </FilterChip>
              ))}
            </div>
          </FilterBlock>

          {subcategories.length > 0 && (
            <FilterBlock title="Sub Category">
              <div className="flex flex-wrap gap-2">
                {subcategories.map((s) => (
                  <FilterChip
                    key={s}
                    active={filters.subcategory === s}
                    onClick={() =>
                      setFilters((p) => ({
                        ...p,
                        subcategory: p.subcategory === s ? "" : s,
                      }))
                    }
                  >
                    {s}
                  </FilterChip>
                ))}
              </div>
            </FilterBlock>
          )}

          {brands.length > 0 && (
            <FilterBlock title="Brand">
              <div className="flex flex-wrap gap-2">
                {brands.map((b) => (
                  <FilterChip
                    key={b}
                    active={filters.brand === b}
                    onClick={() =>
                      setFilters((p) => ({
                        ...p,
                        brand: p.brand === b ? "" : b,
                      }))
                    }
                  >
                    {b}
                  </FilterChip>
                ))}
              </div>
            </FilterBlock>
          )}

          <FilterBlock title="Size">
            <div className="flex flex-wrap gap-2">
              {SIZE_OPTIONS.map((s) => (
                <FilterChip
                  key={s}
                  active={filters.size === s}
                  onClick={() => toggleSize(s)}
                >
                  {s}
                </FilterChip>
              ))}
            </div>
          </FilterBlock>

          <FilterBlock title="Offers">
            <FilterChip
              active={filters.discountOnly}
              onClick={() =>
                setFilters((p) => ({
                  ...p,
                  discountOnly: !p.discountOnly,
                }))
              }
            >
              On Discount
            </FilterChip>
          </FilterBlock>

          <FilterBlock title="Price">
            <input
              type="range"
              min="0"
              max="5000"
              value={filters.price[1]}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  price: [0, Number(e.target.value)],
                }))
              }
              className="w-full"
            />
            <p className="text-sm mt-1">
              Up to <span className="font-semibold">₹{filters.price[1]}</span>
            </p>
          </FilterBlock>
        </aside>

        {/* PRODUCT GRID */}
        <div className="flex-1">
          <InfiniteScroll
            dataLength={products.length}
            next={loadMore}
            hasMore={hasMore}
            loader={<p className="text-center py-6 text-gray-500">Loading…</p>}
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

/* ---------------- UI HELPERS ---------------- */

function FilterBlock({ title, children }) {
  return (
    <div>
      <h4 className="font-semibold text-[#654321] mb-2">{title}</h4>
      {children}
    </div>
  );
}

function FilterChip({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={`px-3 py-1 text-sm rounded-full border transition ${
        active
          ? "bg-[#654321] text-white border-[#654321]"
          : "border-gray-400 text-gray-700 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}
