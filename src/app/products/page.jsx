"use client";

import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import ProductCard from "@/components/Layouts/ProductCard";
import toast from "react-hot-toast";

// STATIC FILTER OPTIONS (you can tweak these)
const CATEGORY_OPTIONS = ["Oversized", "Shirts", "Hoodies", "Joggers"];
const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const GENDER_OPTIONS = ["Men", "Women", "Unisex"];
const FIT_OPTIONS = ["Oversized", "Relaxed", "Regular", "Slim"];
const SLEEVE_OPTIONS = [
  "Half Sleeve",
  "Full Sleeve",
  "Sleeveless",
  "3/4 Sleeve",
];
const NECK_OPTIONS = ["Round Neck", "V-Neck", "Collar", "Hooded"];
const FABRIC_OPTIONS = [
  "Cotton",
  "Organic Cotton",
  "Polyester",
  "Linen",
  "Blended",
];
const TAG_OPTIONS = [
  "New Arrival",
  "Trending",
  "Bestseller",
  "Limited Edition",
];
const COLOR_OPTIONS = ["Black", "White", "Red", "Blue", "Green", "Yellow"];

const PAGE_SIZE = 12;

export default function ProductsPage() {
  // All products from API (one-time load)
  const [allProducts, setAllProducts] = useState([]);
  // Currently visible products (after filters + pagination)
  const [products, setProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState(true);

  // Search / autocomplete
  const [typing, setTyping] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Mobile filter drawer
  const [openFilters, setOpenFilters] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    search: "",
    category: [], // multi
    size: "", // single
    gender: [], // multi
    fits: [], // multi
    sleeves: [], // multi
    neck: [], // multi
    fabric: [], // multi
    tags: [], // multi
    colors: [], // multi (color names as strings)
    price: [0, 5000], // [min, max]
    sort: "newest",
  });

  // ---------------------------
  // 1. LOAD PRODUCTS ONCE
  // ---------------------------
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (!Array.isArray(data.products)) {
          toast.error("Products fetch failed");
          return;
        }
        setAllProducts(data.products);
        setProducts(data.products.slice(0, PAGE_SIZE));
        setHasMore(data.products.length > PAGE_SIZE);
      } catch (err) {
        console.error(err);
        toast.error("Failed loading products 💀");
      }
    };
    load();
  }, []);

  // ---------------------------
  // 2. AUTOCOMPLETE
  // ---------------------------
  useEffect(() => {
    if (!typing) {
      setSuggestions([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/autocomplete?q=${typing}`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch (err) {
        console.error(err);
      }
    }, 200);

    return () => clearTimeout(delay);
  }, [typing]);

  // Small helper to safely check string presence in product
  const productIncludesText = (product, text) => {
    if (!text) return false;
    const t = String(text).toLowerCase();
    const blob = JSON.stringify(product).toLowerCase();
    return blob.includes(t);
  };

  // ---------------------------
  // 3. FILTERING LOGIC
  // ---------------------------
  useEffect(() => {
    let filtered = [...allProducts];

    // search
    if (filters.search) {
      filtered = filtered.filter((p) => productIncludesText(p, filters.search));
    }

    // category (multi)
    if (filters.category.length) {
      filtered = filtered.filter((p) => filters.category.includes(p.category));
    }

    // size (single)
    if (filters.size) {
      filtered = filtered.filter((p) =>
        Array.isArray(p.availableSizes)
          ? p.availableSizes.includes(filters.size)
          : false
      );
    }

    // gender, fits, sleeves, neck, fabric, tags -> text search, multi
    const arrayFilterKeys = [
      "gender",
      "fits",
      "sleeves",
      "neck",
      "fabric",
      "tags",
    ];

    arrayFilterKeys.forEach((key) => {
      const activeValues = filters[key];
      if (Array.isArray(activeValues) && activeValues.length) {
        filtered = filtered.filter((p) =>
          activeValues.some((val) => productIncludesText(p, val))
        );
      }
    });

    // colors (multi)
    if (Array.isArray(filters.colors) && filters.colors.length) {
      filtered = filtered.filter((p) =>
        filters.colors.some((colorName) => productIncludesText(p, colorName))
      );
    }

    // price range
    filtered = filtered.filter((p) => {
      const price = p?.price?.current ?? 0;
      return price >= filters.price[0] && price <= filters.price[1];
    });

    // sort
    const sorted = [...filtered];
    switch (filters.sort) {
      case "priceLow":
        sorted.sort(
          (a, b) => (a.price?.current ?? 0) - (b.price?.current ?? 0)
        );
        break;
      case "priceHigh":
        sorted.sort(
          (a, b) => (b.price?.current ?? 0) - (a.price?.current ?? 0)
        );
        break;
      case "bestseller":
        sorted.sort((a, b) => (b.salesCount ?? 0) - (a.salesCount ?? 0));
        break;
      case "newest":
      default:
        sorted.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        break;
    }

    // reset pagination on filter change
    setVisibleCount(PAGE_SIZE);
    setProducts(sorted.slice(0, PAGE_SIZE));
    setHasMore(sorted.length > PAGE_SIZE);
  }, [filters, allProducts]);

  // ---------------------------
  // 4. INFINITE SCROLL LOAD
  // ---------------------------
  const loadMore = () => {
    const newCount = visibleCount + PAGE_SIZE;
    setVisibleCount(newCount);

    // re-run filtering and then slice
    let filtered = [...allProducts];

    if (filters.search) {
      filtered = filtered.filter((p) => productIncludesText(p, filters.search));
    }
    if (filters.category.length) {
      filtered = filtered.filter((p) => filters.category.includes(p.category));
    }
    if (filters.size) {
      filtered = filtered.filter((p) =>
        Array.isArray(p.availableSizes)
          ? p.availableSizes.includes(filters.size)
          : false
      );
    }
    const arrayFilterKeys = [
      "gender",
      "fits",
      "sleeves",
      "neck",
      "fabric",
      "tags",
    ];
    arrayFilterKeys.forEach((key) => {
      const activeValues = filters[key];
      if (Array.isArray(activeValues) && activeValues.length) {
        filtered = filtered.filter((p) =>
          activeValues.some((val) => productIncludesText(p, val))
        );
      }
    });
    if (Array.isArray(filters.colors) && filters.colors.length) {
      filtered = filtered.filter((p) =>
        filters.colors.some((colorName) => productIncludesText(p, colorName))
      );
    }
    filtered = filtered.filter((p) => {
      const price = p?.price?.current ?? 0;
      return price >= filters.price[0] && price <= filters.price[1];
    });

    const sorted = [...filtered];
    switch (filters.sort) {
      case "priceLow":
        sorted.sort(
          (a, b) => (a.price?.current ?? 0) - (b.price?.current ?? 0)
        );
        break;
      case "priceHigh":
        sorted.sort(
          (a, b) => (b.price?.current ?? 0) - (a.price?.current ?? 0)
        );
        break;
      case "bestseller":
        sorted.sort((a, b) => (b.salesCount ?? 0) - (a.salesCount ?? 0));
        break;
      case "newest":
      default:
        sorted.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        break;
    }

    const nextSlice = sorted.slice(0, newCount);
    setProducts(nextSlice);
    setHasMore(nextSlice.length < sorted.length);
  };

  // ---------------------------
  // 5. UI HELPERS
  // ---------------------------

  const toggleMultiFilter = (key, value) => {
    setFilters((prev) => {
      const current = Array.isArray(prev[key]) ? prev[key] : [];
      const exists = current.includes(value);
      return {
        ...prev,
        [key]: exists
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  const FilterBlock = ({ label, keyName, options }) => (
    <div>
      <h4 className="font-semibold text-[#654321] mb-2">{label}</h4>
      <div className="flex flex-wrap gap-2">
        {options.map((val) => (
          <button
            key={val}
            onClick={() => toggleMultiFilter(keyName, val)}
            className={`px-3 py-1 text-sm rounded-full border ${
              filters[keyName]?.includes(val)
                ? "bg-[#654321] text-white border-[#654321]"
                : "border-gray-400 text-gray-700"
            }`}
          >
            {val}
          </button>
        ))}
      </div>
    </div>
  );

  const ColorFilterBlock = () => (
    <div>
      <h4 className="font-semibold text-[#654321] mb-2">Colors</h4>
      <div className="flex flex-wrap gap-2">
        {COLOR_OPTIONS.map((name) => {
          const selected = filters.colors.includes(name);
          return (
            <button
              key={name}
              onClick={() => toggleMultiFilter("colors", name)}
              className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                selected ? "ring-2 ring-[#654321]" : ""
              }`}
              style={{
                backgroundColor:
                  name === "Black"
                    ? "#000"
                    : name === "White"
                    ? "#fff"
                    : name === "Red"
                    ? "#e63946"
                    : name === "Blue"
                    ? "#4361ee"
                    : name === "Green"
                    ? "#2a9d8f"
                    : name === "Yellow"
                    ? "#f4d35e"
                    : "#ccc",
              }}
            >
              {selected && <span className="w-2 h-2 bg-white rounded-full" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  const SizeBlock = () => (
    <div>
      <h4 className="font-semibold text-[#654321] mb-2">Size</h4>
      <div className="flex flex-wrap gap-2">
        {SIZE_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                size: prev.size === s ? "" : s,
              }))
            }
            className={`px-3 py-1 text-sm rounded-full border ${
              filters.size === s
                ? "bg-[#654321] text-white border-[#654321]"
                : "border-gray-400 text-gray-700"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );

  const SortBlock = () => (
    <div>
      <h4 className="font-semibold text-[#654321] mb-2">Sort By</h4>
      <select
        value={filters.sort}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, sort: e.target.value }))
        }
        className="border px-3 py-2 rounded-md w-full"
      >
        <option value="newest">Newest</option>
        <option value="priceLow">Price: Low → High</option>
        <option value="priceHigh">Price: High → Low</option>
        <option value="bestseller">Best Seller</option>
      </select>
    </div>
  );

  const SearchBlock = () => (
    <div>
      <h4 className="font-semibold text-[#654321] mb-2">Search</h4>
      <input
        value={typing}
        onChange={(e) => {
          setTyping(e.target.value);
          setFilters((prev) => ({ ...prev, search: e.target.value }));
        }}
        placeholder="Search products..."
        className="border px-3 py-2 rounded-md w-full"
      />
      {suggestions.length > 0 && (
        <div className="bg-white border shadow-md rounded-lg mt-1 max-h-40 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setTyping(s);
                setFilters((prev) => ({ ...prev, search: s }));
                setSuggestions([]);
              }}
              className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // ---------------------------
  // 6. RENDER
  // ---------------------------
  return (
    <div className="min-h-screen bg-[#fff9f4]">
      {/* HERO */}
      <div className="bg-[#654321] text-white py-6 px-6">
        <h2 className="text-2xl font-bold">Products</h2>
        <p className="text-sm opacity-80">
          Home / {filters.category[0] || "All Products"}
        </p>
      </div>

      {/* MOBILE FILTER BUTTON */}
      <div className="md:hidden px-4 py-3 flex justify-end">
        <button
          className="px-4 py-2 bg-[#654321] text-white rounded-full"
          onClick={() => setOpenFilters(true)}
        >
          Filters
        </button>
      </div>

      <div className="flex max-w-7xl mx-auto gap-6 px-4 py-6">
        {/* SIDEBAR FILTERS (DESKTOP) */}
        <aside className="hidden md:block w-72 space-y-6">
          <SearchBlock />
          <FilterBlock
            label="Category"
            keyName="category"
            options={CATEGORY_OPTIONS}
          />
          <SizeBlock />
          <FilterBlock
            label="Gender"
            keyName="gender"
            options={GENDER_OPTIONS}
          />
          <FilterBlock label="Fit Type" keyName="fits" options={FIT_OPTIONS} />
          <FilterBlock
            label="Sleeves"
            keyName="sleeves"
            options={SLEEVE_OPTIONS}
          />
          <FilterBlock
            label="Neck Type"
            keyName="neck"
            options={NECK_OPTIONS}
          />
          <FilterBlock
            label="Fabric"
            keyName="fabric"
            options={FABRIC_OPTIONS}
          />
          <FilterBlock label="Tags" keyName="tags" options={TAG_OPTIONS} />
          <ColorFilterBlock />
          <SortBlock />
        </aside>

        {/* PRODUCTS GRID */}
        <div className="flex-1">
          <InfiniteScroll
            dataLength={products.length}
            next={loadMore}
            hasMore={hasMore}
            loader={
              <p className="text-center py-6 text-gray-500">Loading...</p>
            }
            scrollThreshold={0.8}
            style={{ overflow: "visible" }} // 👈 removes scrollbar!
            hasChildren={true}
            scrollableTarget={null} // 👈 uses window scroll
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </InfiniteScroll>

          {!products.length && (
            <p className="text-center py-10 text-gray-500 text-lg">
              No matching products 🥲
            </p>
          )}
        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      {openFilters && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex">
          <div className="bg-white w-72 p-4 overflow-y-auto space-y-6">
            <SearchBlock />
            <FilterBlock
              label="Category"
              keyName="category"
              options={CATEGORY_OPTIONS}
            />
            <SizeBlock />
            <FilterBlock
              label="Gender"
              keyName="gender"
              options={GENDER_OPTIONS}
            />
            <FilterBlock
              label="Fit Type"
              keyName="fits"
              options={FIT_OPTIONS}
            />
            <FilterBlock
              label="Sleeves"
              keyName="sleeves"
              options={SLEEVE_OPTIONS}
            />
            <FilterBlock
              label="Neck Type"
              keyName="neck"
              options={NECK_OPTIONS}
            />
            <FilterBlock
              label="Fabric"
              keyName="fabric"
              options={FABRIC_OPTIONS}
            />
            <FilterBlock label="Tags" keyName="tags" options={TAG_OPTIONS} />
            <ColorFilterBlock />
            <SortBlock />

            <button
              className="mt-4 w-full py-2 bg-[#654321] text-white rounded-full"
              onClick={() => setOpenFilters(false)}
            >
              Apply Filters
            </button>
          </div>
          <div className="flex-1" onClick={() => setOpenFilters(false)} />
        </div>
      )}
    </div>
  );
}
