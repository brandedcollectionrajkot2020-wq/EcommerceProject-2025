// store/useProductsStore.js
import { create } from "zustand";
import toast from "react-hot-toast";

export const useProductsStore = create((set, get) => ({
  products: [],
  page: 1,
  hasMore: true,
  loading: false,

  fetchProducts: async () => {
    const { page, products, loading } = get();

    if (loading) return; // prevent double fetch
    set({ loading: true });

    try {
      const res = await fetch(`/api/products?page=${page}`);
      const data = await res.json();

      if (!data?.products) {
        set({ hasMore: false, loading: false });
        return;
      }

      set({
        products: [...products, ...data.products],
        page: page + 1,
        hasMore: data.hasMore,
        loading: false,
      });
    } catch (err) {
      toast.error("❌ Failed loading products");
      console.log("PRODUCT STORE ERROR:", err);
      set({ loading: false });
    }
  },

  resetProducts: () => set({ products: [], page: 1, hasMore: true }),
}));
