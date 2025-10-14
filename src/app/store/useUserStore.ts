"use client";

import { create } from "zustand";
import api from "@/lib/api";

interface User {
  id: number;
  code: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  created_by: string;
  creation_date: string;
  last_update?: string | null;
  last_update_date?: string | null;
}

interface UserStore {
  user: User | null;
  token: string | null;
  loading: boolean;

  // Actions
  setToken: (token: string | null) => void;
  fetchUser: () => Promise<void>;
  clearSession: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  loading: true,

  setToken: (token) => {
    if (token) {
      localStorage.setItem("token", token);
      set({ token });
    } else {
      localStorage.removeItem("token");
      set({ token: null, user: null });
    }
  },

  clearSession: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null });
  },

  fetchUser: async () => {
    const token = get().token;
    if (!token) {
      set({ user: null, loading: false });
      return;
    }

    try {
      const res = await api.get("/auth/customer-profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success && res.data.user) {
        set({ user: res.data.user, loading: false });
      } else {
        console.warn("Token invalid or expired, clearing session.");
        get().clearSession();
        set({ loading: false });
      }
    } catch (err) {
      console.error("Token verification failed:", err);
      get().clearSession();
      set({ loading: false });
    }
  },
}));

// Auto-check token on refresh
if (typeof window !== "undefined") {
  const store = useUserStore.getState();
  store.fetchUser();
}
