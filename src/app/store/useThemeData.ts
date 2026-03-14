// app/store/useThemeStore.ts
"use client";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

// ─── Fetcher ──────────────────────────────────────────────────────────────────

async function fetchThemeData(): Promise<Record<string, any>> {
  const response = await api.get("/setup/get-setup-data");
  const items: any[] = Array.isArray(response.data)
    ? response.data
    : response.data?.data || [];

  return Object.fromEntries(
    items.map((item) => {
      try {
        return [item.key_name, JSON.parse(item.value)];
      } catch {
        return [item.key_name, item.value];
      }
    }),
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useThemeStore() {
  return useQuery({
    queryKey: ["theme"],
    queryFn: fetchThemeData,
    staleTime: 10 * 60 * 1000, // theme changes rarely — 10 min
  });
}

// O(1) selector — same API as before
export function useThemeData(key: string) {
  const { data } = useThemeStore();
  return data?.[key];
}

// Use when you need both the value and loading state
export function useThemeDataWithStatus(key: string) {
  const { data, isLoading, isError } = useThemeStore();
  return { data: data?.[key], isLoading, isError };
}
