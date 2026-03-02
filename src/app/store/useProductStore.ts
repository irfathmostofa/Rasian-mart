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
  // Existing state
  products: Product[];
  currentPage: number;
  totalPages: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  loading: boolean;
  error: string | null;

  // New state for recent products
  recentProducts: Product[];
  recentCurrentPage: number;
  recentTotalPages: number;
  recentHasNextPage: boolean;
  recentLoading: boolean;
  recentError: string | null;

  // New state for best-selling products
  bestSellingProducts: Product[];
  bestSellingCurrentPage: number;
  bestSellingTotalPages: number;
  bestSellingHasNextPage: boolean;
  bestSellingLoading: boolean;
  bestSellingError: string | null;

  // Existing functions
  fetchProducts: (
    page?: number,
    limit?: number,
    append?: boolean,
  ) => Promise<void>;
  loadMore: () => Promise<void>;
  clearProducts: () => void;

  // New functions for recent products
  fetchRecentProducts: (
    page?: number,
    limit?: number,
    days?: number,
    append?: boolean,
  ) => Promise<void>;
  loadMoreRecent: () => Promise<void>;
  clearRecentProducts: () => void;

  // New functions for best-selling products
  fetchBestSellingProducts: (
    page?: number,
    limit?: number,
    append?: boolean,
  ) => Promise<void>;
  loadMoreBestSelling: () => Promise<void>;
  clearBestSellingProducts: () => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  // Existing state
  products: [],
  currentPage: 1,
  totalPages: 1,
  limit: 12,
  hasNextPage: true,
  hasPrevPage: false,
  loading: false,
  error: null,

  // Recent products state
  recentProducts: [],
  recentCurrentPage: 1,
  recentTotalPages: 1,
  recentHasNextPage: true,
  recentLoading: false,
  recentError: null,

  // Best-selling products state
  bestSellingProducts: [],
  bestSellingCurrentPage: 1,
  bestSellingTotalPages: 1,
  bestSellingHasNextPage: true,
  bestSellingLoading: false,
  bestSellingError: null,

  // Existing function
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

  // New function for recent products
  fetchRecentProducts: async (
    page = 1,
    limit = 20,
    days = 30,
    append = false,
  ) => {
    try {
      set({ recentLoading: true, recentError: null });

      const response = await api.post("/product/get-recent-product", {
        page,
        limit,
        days,
      });
      const payload = response?.data?.data || {};
      const fetched = payload.data || [];
      const pagination = payload.pagination || {};

      set((state) => ({
        recentProducts: append
          ? [...state.recentProducts, ...fetched]
          : fetched,
        recentCurrentPage: pagination.currentPage || page,
        recentTotalPages: pagination.totalPages || 1,
        recentHasNextPage: pagination.hasNextPage ?? false,
      }));
    } catch (err) {
      console.error("Error fetching recent products:", err);
      set({ recentError: "Failed to load recent products" });
    } finally {
      set({ recentLoading: false });
    }
  },

  loadMoreRecent: async () => {
    const {
      recentCurrentPage,
      recentTotalPages,
      recentHasNextPage,
      recentLoading,
      fetchRecentProducts,
    } = get();
    if (recentLoading || !recentHasNextPage) return;
    await fetchRecentProducts(recentCurrentPage + 1, 20, 30, true);
  },

  clearRecentProducts: () =>
    set({
      recentProducts: [],
      recentCurrentPage: 1,
      recentHasNextPage: true,
      recentError: null,
    }),

  // New function for best-selling products
  fetchBestSellingProducts: async (page = 1, limit = 20, append = false) => {
    try {
      set({ bestSellingLoading: true, bestSellingError: null });

      const response = await api.post("/product/get-best-selling-product", {
        page,
        limit,
      });

      const payload = response?.data?.data || {};
      const fetched = payload.data || [];
      const pagination = payload.pagination || {};

      set((state) => ({
        bestSellingProducts: append
          ? [...state.bestSellingProducts, ...fetched]
          : fetched,
        bestSellingCurrentPage: pagination.currentPage || page,
        bestSellingTotalPages: pagination.totalPages || 1,
        bestSellingHasNextPage: pagination.hasNextPage ?? false,
      }));
    } catch (err) {
      console.error("Error fetching best-selling products:", err);
      set({ bestSellingError: "Failed to load best-selling products" });
    } finally {
      set({ bestSellingLoading: false });
    }
  },

  loadMoreBestSelling: async () => {
    const {
      bestSellingCurrentPage,
      bestSellingTotalPages,
      bestSellingHasNextPage,
      bestSellingLoading,
      fetchBestSellingProducts,
    } = get();
    if (bestSellingLoading || !bestSellingHasNextPage) return;
    await fetchBestSellingProducts(bestSellingCurrentPage + 1, 20, true);
  },

  clearBestSellingProducts: () =>
    set({
      bestSellingProducts: [],
      bestSellingCurrentPage: 1,
      bestSellingHasNextPage: true,
      bestSellingError: null,
    }),
}));
