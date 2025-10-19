"use client";

import api from "@/lib/api";
import { create } from "zustand";

export interface Product {
  id: number;
  code: string;
  name: string;
  description: string;
  cost_price: number;
  selling_price: number;
  regular_price: number;
  status: string;
  uom_name: string;
  categories: Array<{
    id: number;
    name: string;
    slug?: string;
    code: string;
    image: string | null;
    is_primary: boolean;
  }>;
  images: Array<{
    id: number;
    url: string;
    alt_text: string;
    is_primary: boolean;
  }>;
  total_stock: number;
  badge: string | null;
  rating: number | null;
  review_count: number | null;
  total_sales: number;
  primary_variant_id: number;
}

interface ProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  hydrated: boolean;
  fetchProducts: (page?: number, limit?: number) => Promise<void>;
  clearProducts: () => void;
  setHydrated: (value: boolean) => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  loading: false,
  error: null,
  hydrated: false,

  setHydrated: (value) => set({ hydrated: value }),

  fetchProducts: async (page = 1, limit = 10) => {
    try {
      set({ loading: true, error: null });

      const response = await api.post("/product/get-all-products", {
        data: { page, limit },
        tokenType: "jwt",
      });

      if (response?.data?.success && response?.data?.data) {
        set({
          products: response.data.data.data || [],
          error: null,
          hydrated: true, // ✅ mark store as ready
        });
      } else {
        set({ error: "Failed to fetch products", hydrated: true });
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      set({ error: "Error loading products", hydrated: true });
    } finally {
      set({ loading: false });
    }
  },

  clearProducts: () => set({ products: [] }),
}));
