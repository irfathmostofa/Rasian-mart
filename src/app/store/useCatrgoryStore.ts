// app/store/useCategoryStore.ts
"use client";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  parent_id?: number | null;
  children?: Category[];
}

// ─── Fetcher ──────────────────────────────────────────────────────────────────

async function fetchCategories(): Promise<Category[]> {
  const response = await api.get("/product/get-product-cat");
  return response.data?.data ?? [];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCategoryStore() {
  const { data, isLoading, error } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000, // categories change rarely — 10 min
  });

  return {
    categories: data ?? [],
    loading: isLoading,
    error: error ? "Failed to load categories" : null,
    // kept for components that call fetchCategories() manually — no-op now,
    // React Query handles deduplication automatically
    fetchCategories: () => {},
  };
}