// app/store/useProductStore.ts
"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "@/lib/api";
import { ProductCardProps } from "@/types/ProductCard";

// ─── Types ────────────────────────────────────────────────────────────────────



interface PaginatedResponse {
  data: ProductCardProps[];
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    total: number;
  };
}

// ─── Query keys — centralised so invalidation is easy ────────────────────────

export const productKeys = {
  all: ["products"] as const,
  list: (page: number, limit: number) =>
    ["products", "list", page, limit] as const,
  recent: (page: number, limit: number, days: number) =>
    ["products", "recent", page, limit, days] as const,
  bestSelling: (page: number, limit: number) =>
    ["products", "best-selling", page, limit] as const,
  featured: (categoryIds: number[], limit: number) =>
    ["products", "featured", [...categoryIds].sort().join(","), limit] as const,
};

// ─── Fetchers ─────────────────────────────────────────────────────────────────

async function fetchProducts(
  page: number,
  limit: number,
): Promise<PaginatedResponse> {
  const res = await api.post("/product/get-all-products", { page, limit });
  return res.data?.data;
}

async function fetchRecentProducts(
  page: number,
  limit: number,
  days: number,
): Promise<PaginatedResponse> {
  const res = await api.post("/product/get-recent-product", {
    page,
    limit,
    days,
  });
  return res.data?.data;
}

async function fetchBestSellingProducts(
  page: number,
  limit: number,
): Promise<PaginatedResponse> {
  const res = await api.post("/product/get-best-selling-product", {
    page,
    limit,
  });
  return res.data?.data;
}

async function fetchFeaturedProducts(
  categoryIds: number[],
  limit: number,
): Promise<ProductCardProps[]> {
  const res = await api.post("/product/get-all-products-with-cat", {
    page: 1,
    limit,
    category_ids: categoryIds,
    category_match_type: "ANY",
  });
  return res.data?.data?.data ?? res.data?.data ?? [];
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** General paginated product list with client-side load-more */
export function useProductList(initialLimit = 12) {
  const [page, setPage] = useState(1);
  const limit = initialLimit;

  const { data, isLoading, error } = useQuery({
    queryKey: productKeys.list(page, limit),
    queryFn: () => fetchProducts(page, limit),
  });

  return {
    products: data?.data ?? [],
    currentPage: data?.pagination.currentPage ?? page,
    totalPages: data?.pagination.totalPages ?? 1,
    hasNextPage: data?.pagination.hasNextPage ?? false,
    hasPrevPage: data?.pagination.hasPrevPage ?? false,
    loading: isLoading,
    error: error ? "Failed to load products" : null,
    loadMore: () => setPage((p) => p + 1),
  };
}

/** Recent products — used by DynamicSectionRenderer */
export function useRecentProducts(limit = 20, days = 30) {
  const { data, isLoading, error } = useQuery({
    queryKey: productKeys.recent(1, limit, days),
    queryFn: () => fetchRecentProducts(1, limit, days),
    staleTime: 5 * 60 * 1000,
  });

  return {
    recentProducts: data?.data ?? [],
    recentLoading: isLoading,
    recentError: error ? "Failed to load recent products" : null,
  };
}

/** Best-selling products — used by DynamicSectionRenderer */
export function useBestSellingProducts(limit = 20) {
  const { data, isLoading, error } = useQuery({
    queryKey: productKeys.bestSelling(1, limit),
    queryFn: () => fetchBestSellingProducts(1, limit),
    staleTime: 5 * 60 * 1000,
  });

  return {
    bestSellingProducts: data?.data ?? [],
    bestSellingLoading: isLoading,
    bestSellingError: error ? "Failed to load best-selling products" : null,
  };
}

/** Featured products per section — used by DynamicSectionRenderer */
export function useFeaturedProducts(categoryIds: number[], limit = 8) {
  const enabled = categoryIds.length > 0;

  const { data, isLoading, error } = useQuery({
    queryKey: productKeys.featured(categoryIds, limit),
    queryFn: () => fetchFeaturedProducts(categoryIds, limit),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  return {
    products: data ?? [],
    loading: isLoading && enabled,
    error: error ? "Failed to load featured products" : null,
  };
}

/**
 * Backwards-compatible hook used by Header search and other components
 * that called useProductStore() expecting { products, fetchProducts }
 */
export function useProductStore() {
  const { products, loading, loadMore } = useProductList(20);
  return {
    products,
    loading,
    fetchProducts: () => {}, // no-op — React Query fetches on mount automatically
    loadMore,
  };
}

/** Invalidate all product queries (call after admin edits) */
export function useInvalidateProducts() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: productKeys.all });
}
