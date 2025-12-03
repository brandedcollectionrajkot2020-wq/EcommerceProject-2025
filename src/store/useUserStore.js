import axios from "axios";
import { create } from "zustand";

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,

  getUser: async (force = false) => {
    // If already loaded and not forcing refresh, skip request
    if (get().initialized && !force) return;

    set({ loading: true, error: null });

    try {
      const res = await axios.get("http://localhost:3000/api/user/profile", {
        cache: "no-store",
      });
      console.log(res);
      const data = await res.data;

      if (!data.success) {
        set({
          user: null,
          loading: false,
          error: data.message || "Failed to fetch user",
          initialized: true,
        });
        return;
      }

      set({
        user: data.user,
        loading: false,
        error: null,
        initialized: true,
      });
    } catch (error) {
      console.error("User Fetch Error:", error);
      set({
        loading: false,
        error: error.message,
        initialized: true,
      });
    }
  },

  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    set({ user: null, initialized: false });
  },
}));
