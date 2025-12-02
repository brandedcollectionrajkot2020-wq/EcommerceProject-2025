"use client";
import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

export default function AppInitializer() {
  const { fetchCart, fetchWishlist } = useAppStore();

  useEffect(() => {
    fetchCart();
    fetchWishlist();
  }, []);

  return null; // no UI
}
