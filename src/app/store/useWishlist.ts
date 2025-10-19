"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistItem {
  id: number;
  primary_variant_id: number;
  name: string;
  price: number;
  image: string;
  stock: number;
}

interface WishlistState {
  items: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: number) => void;
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: number) => boolean;
  clearWishlist: () => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addToWishlist: (item) => {
        if (!get().items.some((p) => p.id === item.id)) {
          set({ items: [...get().items, item] });
        }
      },

      removeFromWishlist: (id) =>
        set({ items: get().items.filter((p) => p.id !== id) }),

      toggleWishlist: (item) => {
        const exists = get().isInWishlist(item.id);
        if (exists) {
          get().removeFromWishlist(item.id);
        } else {
          get().addToWishlist(item);
        }
      },

      isInWishlist: (id) => get().items.some((p) => p.id === id),

      clearWishlist: () => set({ items: [] }),
    }),
    { name: "wishlist-storage" }
  )
);
