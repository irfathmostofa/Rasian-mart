import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "@/lib/api";

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
  setHydrated: (state: boolean) => void;
  fetchCategories: () => Promise<void>;
  setCategories: (categories: Category[]) => void;
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: [],
      loading: false,
      hydrated: false,

      setHydrated: (state) => set({ hydrated: state }),

      setCategories: (categories) => set({ categories }),

      fetchCategories: async () => {
        set({ loading: true });
        try {
          const response = await api.get("/product/get-product-cat");
          set({ categories: response.data.data, loading: false });
        } catch (error) {
          set({ loading: false });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "category-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
