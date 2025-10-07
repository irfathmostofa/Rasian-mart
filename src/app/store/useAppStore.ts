import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AppState {
  user: Record<string, any> | null;
  cart: any[];
  setUser: (user: Record<string, any>) => void;
  addToCart: (item: any) => void;
  clearCart: () => void;
  logout: () => void;
  hydrated: boolean;
  setHydrated: (state: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      cart: [],
      hydrated: false, // fix: initial value
      setUser: (user) => set({ user }),
      addToCart: (item) =>
        set((state) => ({
          cart: [...state.cart, item],
        })),
      clearCart: () => set({ cart: [] }),
      logout: () => set({ user: null, cart: [] }),
      setHydrated: (state) => set({ hydrated: state }),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
