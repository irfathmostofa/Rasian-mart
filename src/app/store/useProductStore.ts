"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "@/lib/api";

// ─── TTL ──────────────────────────────────────────────────────────────────────
const PRODUCT_TTL = 5 * 60 * 1000; // general / recent / best-selling
const FEATURED_TTL = 5 * 60 * 1000; // per-section featured products

function isStale(fetchedAt: number | null, ttl = PRODUCT_TTL): boolean {
  if (!fetchedAt) return true;
  return Date.now() - fetchedAt > ttl;
}

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface FeaturedEntry {
  products: Product[];
  fetchedAt: number | null;
  loading: boolean;
}

interface ProductStore {
  // ── General products ────────────────────────────────────────────────────────
  products: Product[];
  currentPage: number;
  totalPages: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  loading: boolean;
  error: string | null;
  productsFetchedAt: number | null;

  fetchProducts: (
    page?: number,
    limit?: number,
    append?: boolean,
  ) => Promise<void>;
  loadMore: () => Promise<void>;
  clearProducts: () => void;

  // ── Recent products ─────────────────────────────────────────────────────────
  recentProducts: Product[];
  recentCurrentPage: number;
  recentTotalPages: number;
  recentHasNextPage: boolean;
  recentLoading: boolean;
  recentError: string | null;
  recentFetchedAt: number | null;

  fetchRecentProducts: (
    page?: number,
    limit?: number,
    days?: number,
    append?: boolean,
  ) => Promise<void>;
  loadMoreRecent: () => Promise<void>;
  clearRecentProducts: () => void;

  // ── Best-selling products ───────────────────────────────────────────────────
  bestSellingProducts: Product[];
  bestSellingCurrentPage: number;
  bestSellingTotalPages: number;
  bestSellingHasNextPage: boolean;
  bestSellingLoading: boolean;
  bestSellingError: string | null;
  bestSellingFetchedAt: number | null;

  fetchBestSellingProducts: (
    page?: number,
    limit?: number,
    append?: boolean,
  ) => Promise<void>;
  loadMoreBestSelling: () => Promise<void>;
  clearBestSellingProducts: () => void;

  // ── Featured products (keyed by section/category combo) ────────────────────
  // key = "feat_<sortedCatIds>_l<limit>", e.g. "feat_2_5_8_l8"
  featured: Record<string, FeaturedEntry>;
  fetchFeaturedProducts: (
    key: string,
    categoryIds: number[],
    limit?: number,
  ) => Promise<void>;

  // ── Global invalidation ─────────────────────────────────────────────────────
  invalidateAll: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      // ── General ─────────────────────────────────────────────────────────────
      products: [],
      currentPage: 1,
      totalPages: 1,
      limit: 12,
      hasNextPage: true,
      hasPrevPage: false,
      loading: false,
      error: null,
      productsFetchedAt: null,

      fetchProducts: async (page = 1, limit = 12, append = false) => {
        const { loading, productsFetchedAt } = get();
        // For paginated appends we always fetch; for page-1 fresh loads use TTL
        if (loading) return;
        if (page === 1 && !append && !isStale(productsFetchedAt)) return;

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
            productsFetchedAt: append ? state.productsFetchedAt : Date.now(),
          }));
        } catch (err) {
          console.error("[useProductStore] fetchProducts:", err);
          set({ error: "Failed to load products" });
        } finally {
          set({ loading: false });
        }
      },

      loadMore: async () => {
        const { currentPage, hasNextPage, loading, fetchProducts, limit } =
          get();
        if (loading || !hasNextPage) return;
        await fetchProducts(currentPage + 1, limit, true);
      },

      clearProducts: () =>
        set({
          products: [],
          currentPage: 1,
          hasNextPage: true,
          productsFetchedAt: null,
        }),

      // ── Recent ───────────────────────────────────────────────────────────────
      recentProducts: [],
      recentCurrentPage: 1,
      recentTotalPages: 1,
      recentHasNextPage: true,
      recentLoading: false,
      recentError: null,
      recentFetchedAt: null,

      fetchRecentProducts: async (
        page = 1,
        limit = 20,
        days = 30,
        append = false,
      ) => {
        const { recentLoading, recentFetchedAt } = get();
        if (recentLoading) return;
        if (page === 1 && !append && !isStale(recentFetchedAt)) return;

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
            recentFetchedAt: append ? state.recentFetchedAt : Date.now(),
          }));
        } catch (err) {
          console.error("[useProductStore] fetchRecentProducts:", err);
          set({ recentError: "Failed to load recent products" });
        } finally {
          set({ recentLoading: false });
        }
      },

      loadMoreRecent: async () => {
        const {
          recentCurrentPage,
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
          recentFetchedAt: null,
        }),

      // ── Best-selling ─────────────────────────────────────────────────────────
      bestSellingProducts: [],
      bestSellingCurrentPage: 1,
      bestSellingTotalPages: 1,
      bestSellingHasNextPage: true,
      bestSellingLoading: false,
      bestSellingError: null,
      bestSellingFetchedAt: null,

      fetchBestSellingProducts: async (
        page = 1,
        limit = 20,
        append = false,
      ) => {
        const { bestSellingLoading, bestSellingFetchedAt } = get();
        if (bestSellingLoading) return;
        if (page === 1 && !append && !isStale(bestSellingFetchedAt)) return;

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
            bestSellingFetchedAt: append
              ? state.bestSellingFetchedAt
              : Date.now(),
          }));
        } catch (err) {
          console.error("[useProductStore] fetchBestSellingProducts:", err);
          set({ bestSellingError: "Failed to load best-selling products" });
        } finally {
          set({ bestSellingLoading: false });
        }
      },

      loadMoreBestSelling: async () => {
        const {
          bestSellingCurrentPage,
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
          bestSellingFetchedAt: null,
        }),

      // ── Featured ─────────────────────────────────────────────────────────────
      featured: {},

      fetchFeaturedProducts: async (key, categoryIds, limit = 8) => {
        const existing = get().featured[key];
        if (existing?.loading) return;
        if (existing && !isStale(existing.fetchedAt, FEATURED_TTL)) return;

        // Keep stale products visible while re-fetching (no flash of empty)
        set((s) => ({
          featured: {
            ...s.featured,
            [key]: {
              products: existing?.products ?? [],
              fetchedAt: existing?.fetchedAt ?? null,
              loading: true,
            },
          },
        }));

        try {
          const response = await api.post(
            "/product/get-all-products-with-cat",
            {
              page: 1,
              limit,
              category_ids: categoryIds,
              category_match_type: "ANY",
            },
          );
          const data: Product[] =
            response?.data?.data?.data ?? response?.data?.data ?? [];

          set((s) => ({
            featured: {
              ...s.featured,
              [key]: { products: data, fetchedAt: Date.now(), loading: false },
            },
          }));
        } catch (err) {
          console.error("[useProductStore] fetchFeaturedProducts:", err);
          // On error: keep existing products, clear loading
          set((s) => ({
            featured: {
              ...s.featured,
              [key]: {
                products: existing?.products ?? [],
                fetchedAt: existing?.fetchedAt ?? null,
                loading: false,
              },
            },
          }));
        }
      },

      // ── Invalidation ─────────────────────────────────────────────────────────
      invalidateAll: () =>
        set({
          productsFetchedAt: null,
          recentFetchedAt: null,
          bestSellingFetchedAt: null,
          featured: {},
        }),
    }),
    {
      name: "product-store",
      storage: createJSONStorage(() => localStorage),
      // Only persist the data arrays + timestamps, not loading/error flags
      partialize: (state) => ({
        products: state.products,
        productsFetchedAt: state.productsFetchedAt,
        recentProducts: state.recentProducts,
        recentFetchedAt: state.recentFetchedAt,
        bestSellingProducts: state.bestSellingProducts,
        bestSellingFetchedAt: state.bestSellingFetchedAt,
        featured: state.featured,
      }),
    },
  ),
);
