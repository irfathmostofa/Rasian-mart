// app/store/useThemeStore.ts
"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "@/lib/api";

const CACHE_TTL = 10 * 60 * 1000; // 10 min — theme config changes rarely

function isStale(fetchedAt: number | null): boolean {
  if (!fetchedAt) return true;
  return Date.now() - fetchedAt > CACHE_TTL;
}

interface ThemeStore {
  data: Record<string, any>;
  loading: boolean;
  error: string | null;
  hydrated: boolean;
  fetchedAt: number | null;

  setHydrated: (state: boolean) => void;
  fetchThemeData: () => Promise<void>;
  invalidate: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      data: {},
      loading: false,
      error: null,
      hydrated: false,
      fetchedAt: null,

      setHydrated: (state) => set({ hydrated: state }),

      fetchThemeData: async () => {
        const { loading, fetchedAt } = get();
        if (loading) return; // already in-flight
        if (!isStale(fetchedAt)) return; // data is fresh — skip

        set({ loading: true, error: null });
        try {
          const response = await api.get("/setup/get-setup-data");
          const items = Array.isArray(response.data)
            ? response.data
            : response.data?.data || [];

          const dataMap: Record<string, any> = {};
          items.forEach((item: any) => {
            try {
              dataMap[item.key_name] = JSON.parse(item.value);
            } catch {
              dataMap[item.key_name] = item.value;
            }
          });

          set({ data: dataMap, fetchedAt: Date.now() });
        } catch (error) {
          console.error("[useThemeStore] fetchThemeData:", error);
          set({ error: "Failed to load theme" });
        } finally {
          set({ loading: false });
        }
      },

      invalidate: () => set({ fetchedAt: null }),
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        data: state.data,
        fetchedAt: state.fetchedAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

// O(1) selector — unchanged API
export const useThemeData = (key: string) =>
  useThemeStore((state) => state.data[key]);
