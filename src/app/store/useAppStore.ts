import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AppState {
  user: any | null;
  cart: any[];
  setUser: (user: any) => void;
  addToCart: (item: any) => void;
  clearCart: () => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      cart: [],
      setUser: (user) => set({ user }),
      addToCart: (item) =>
        set((state) => ({
          cart: [...state.cart, item],
        })),
      clearCart: () => set({ cart: [] }),
      logout: () => set({ user: null, cart: [] }),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => localStorage), //  correct & type-safe
    }
  )
);
