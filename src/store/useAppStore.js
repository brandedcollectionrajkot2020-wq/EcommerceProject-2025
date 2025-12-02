"use client";

import { create } from "zustand";
import toast from "react-hot-toast";

export const useAppStore = create((set, get) => ({
  wishlist: [],
  cart: [],
  loadingWishlist: false,
  loadingCart: false,

  // --------- WISHLIST ---------
  fetchWishlist: async () => {
    try {
      set({ loadingWishlist: true });

      const res = await fetch("/api/wishlist", {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      set({ wishlist: data.wishlist || [] });
    } catch (err) {
      toast.error("Failed to load wishlist");
      console.error(err);
    } finally {
      set({ loadingWishlist: false });
    }
  },

  addToWishlist: async (product) => {
    try {
      const exists = get().wishlist.some((p) => p._id === product._id);
      if (exists) return toast("⚠ Already in wishlist");

      // Optimistic UI
      set({ wishlist: [...get().wishlist, product] });

      const res = await fetch("/api/wishlist", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id }),
      });

      if (!res.ok) throw new Error();

      await get().fetchWishlist(); // 🔥 sync with backend
      toast.success("❤️ Added to wishlist");
    } catch (e) {
      toast.error("Failed updating wishlist");
      console.error(e);
      await get().fetchWishlist();
    }
  },

  removeFromWishlist: async (productId) => {
    try {
      set({ wishlist: get().wishlist.filter((p) => p._id !== productId) });

      const res = await fetch(`/api/wishlist?productId=${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error();

      await get().fetchWishlist(); // 🔥 sync
      toast("💔 Removed");
    } catch (e) {
      toast.error("Failed");
      await get().fetchWishlist();
    }
  },

  isInWishlist: (id) => get().wishlist.some((p) => p._id === id),

  // --------- CART ---------
  fetchCart: async () => {
    try {
      set({ loadingCart: true });

      const res = await fetch("/api/cart", {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Unauthorized");

      const data = await res.json();

      const normalized = data.cart.map((item) => ({
        ...item.product,
        qty: item.qty,
      }));

      set({ cart: normalized });
    } catch (err) {
      toast.error("Failed to load cart");
      console.error(err);
    } finally {
      set({ loadingCart: false });
    }
  },

  addToCart: async (product) => {
    try {
      const existing = get().cart.find(
        (p) => p._id === product._id || product.id
      );

      if (existing) {
        set({
          cart: get().cart.map((p) =>
            p._id === product._id ? { ...p, qty: p.qty + 1 } : p
          ),
        });
      } else {
        set({ cart: [...get().cart, { ...product, qty: 1 }] });
      }

      const res = await fetch("/api/cart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id }),
      });

      if (!res.ok) throw new Error();

      await get().fetchCart(); // 🔥 sync
      toast.success("🛍 Updated Cart");
    } catch {
      await get().fetchCart();
    }
  },

  updateQty: async (productId, qty) => {
    try {
      const newCart =
        qty < 1
          ? get().cart.filter((p) => p._id !== productId)
          : get().cart.map((p) => (p._id === productId ? { ...p, qty } : p));

      set({ cart: newCart });

      const res = await fetch("/api/cart", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, qty }),
      });

      if (!res.ok) throw new Error();

      await get().fetchCart(); // 🔥 sync
    } catch {
      await get().fetchCart();
    }
  },

  removeFromCart: async (productId) => {
    try {
      set({ cart: get().cart.filter((p) => p._id !== productId) });

      await fetch(`/api/cart?productId=${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      await get().fetchCart(); // 🔥 sync
    } catch {
      await get().fetchCart();
    }
  },

  removeFromCart: async (productId) => {
    try {
      const old = get().cart;
      set({ cart: old.filter((p) => p._id !== productId) });

      const res = await fetch(`/api/cart?productId=${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed");

      toast("🗑 Removed from cart");
    } catch (e) {
      toast.error("Failed removing item");
      console.error(e);

      await get().fetchCart();
    }
  },

  cartCount: () => get().cart.reduce((t, item) => t + (item.qty || 0), 0),
}));
