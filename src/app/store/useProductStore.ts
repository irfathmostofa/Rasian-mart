"use client";

import { create } from "zustand";
import api from "@/lib/api";

export interface Product {
  id: number;
  code: string;
  slug: string;
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
  currentPage: number;
  totalPages: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  loading: boolean;
  error: string | null;

  fetchProducts: (
    page?: number,
    limit?: number,
    append?: boolean,
  ) => Promise<void>;
  loadMore: () => Promise<void>;
  clearProducts: () => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  currentPage: 1,
  totalPages: 1,
  limit: 12,
  hasNextPage: true,
  hasPrevPage: false,
  loading: false,
  error: null,

  fetchProducts: async (page = 1, limit = 12, append = false) => {
    try {
      set({ loading: true, error: null });

      const response = await api.post("/product/get-all-products", {
        page,
        limit,
      });

      const payload = response?.data?.data || {};
      const fetched = payload.data || [];
      const pagination = payload.pagination || {};

      set((state) => ({
        products: append ? [...state.products, ...fetched] : fetched,
        currentPage: pagination.currentPage || page,
        totalPages: pagination.totalPages || 1,
        hasNextPage: pagination.hasNextPage ?? false,
        hasPrevPage: pagination.hasPrevPage ?? false,
      }));
    } catch (err) {
      console.error("Error fetching products:", err);
      set({ error: "Failed to load products" });
    } finally {
      set({ loading: false });
    }
  },

  loadMore: async () => {
    const {
      currentPage,
      totalPages,
      hasNextPage,
      loading,
      fetchProducts,
      limit,
    } = get();
    if (loading || !hasNextPage) return;
    await fetchProducts(currentPage + 1, limit, true);
  },

  clearProducts: () => set({ products: [], currentPage: 1, hasNextPage: true }),
}));
