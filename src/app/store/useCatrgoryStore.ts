import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "@/lib/api";

// Categories change rarely — 10 min in-session, persisted across refreshes
const CACHE_TTL = 10 * 60 * 1000;

function isStale(fetchedAt: number | null): boolean {
  if (!fetchedAt) return true;
  return Date.now() - fetchedAt > CACHE_TTL;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
  children?: Category[];
}

interface CategoryState {
  categories: Category[];
  loading: boolean;
  hydrated: boolean;
  fetchedAt: number | null;

  setHydrated: (state: boolean) => void;
  setCategories: (categories: Category[]) => void;
  fetchCategories: () => Promise<void>;
  invalidate: () => void;
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: [],
      loading: false,
      hydrated: false,
      fetchedAt: null,

      setHydrated: (state) => set({ hydrated: state }),

      setCategories: (categories) => set({ categories, fetchedAt: Date.now() }),

      fetchCategories: async () => {
        const { loading, fetchedAt } = get();
        if (loading) return; // already in-flight
        if (!isStale(fetchedAt)) return; // data is fresh — skip

        set({ loading: true });
        try {
          const response = await api.get("/product/get-product-cat");
          set({
            categories: response.data.data,
            fetchedAt: Date.now(),
          });
        } catch (error) {
          console.error("[useCategoryStore] fetchCategories:", error);
        } finally {
          set({ loading: false });
        }
      },

      // Force a re-fetch on next call (e.g. after admin updates categories)
      invalidate: () => set({ fetchedAt: null }),
    }),
    {
      name: "category-storage",
      storage: createJSONStorage(() => localStorage),
      // Persist data + timestamp — so even a hard refresh uses cached data
      // until TTL expires
      partialize: (state) => ({
        categories: state.categories,
        fetchedAt: state.fetchedAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
