"use client";
import { useEffect } from "react";
import FilterTabs from "../Home/FiltersTabs";
import InfiniteScroll from "react-infinite-scroll-component";
import ProductCard from "../Layouts/ProductCard";
import { useProductsStore } from "@/store/useProductStore";

function ProductGrid() {
  const { products, fetchProducts, hasMore } = useProductsStore();

  return (
    <InfiniteScroll
      dataLength={products.length}
      next={fetchProducts}
      hasMore={hasMore}
      loader={<p className="text-center py-6">Loading...</p>}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </InfiniteScroll>
  );
}

export default function Products() {
  const { products, fetchProducts, hasMore } = useProductsStore();

  useEffect(() => {
    if (products.length === 0) fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-[#fff9f4]">
      <FilterTabs />

      <InfiniteScroll
        dataLength={products.length}
        next={fetchProducts}
        hasMore={hasMore}
        loader={<p className="text-center py-6 text-gray-500">Loading...</p>}
      >
        <div className="grid max-w-7xl mx-auto grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 px-4 py-6 sm:px-6 md:px-10">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
}
