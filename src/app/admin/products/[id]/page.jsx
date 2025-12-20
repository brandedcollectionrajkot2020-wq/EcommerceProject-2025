"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "../components/ProductForm";
import { useApiClient } from "../../lib/api";

export default function ProductDetailPage({ params }) {
  const id = params.id;
  const api = useApiClient();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (id === "new") return;
      setLoading(true);
      const res = await api.fetchProduct(id);
      setProduct(res.data || null);
      setLoading(false);
    })();
  }, [id]);

  async function handleSave(payload) {
    if (id === "new") {
      const res = await api.createProduct(payload);
      if (res.ok) router.push("/admin/products");
    } else {
      const res = await api.updateProduct(id, payload);
      if (res.ok) router.push("/admin/products");
    }
  }

  return (
    <div>
      <header className="mb-4">
        <h2 className="text-lg font-semibold">
          {id === "new" ? "Create product" : "Edit product"}
        </h2>
      </header>

      <div className="bg-white p-4 rounded-md shadow-sm">
        <ProductForm initial={product} loading={loading} onSave={handleSave} />
      </div>
    </div>
  );
}
