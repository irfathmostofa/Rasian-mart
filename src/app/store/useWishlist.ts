// app/store/useWishlist.ts
"use client";
import api from "@/lib/api";
import { create } from "zustand";

interface WishlistItem {
  id: number;
  primary_variant_id: number;
  name: string;
  price: number;
  image: string;
  stock: number;
  dbId?: number; // Database ID for server operations
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  initializeWishlist: (customerId: number) => Promise<void>;
  addToWishlist: (
    item: Omit<WishlistItem, "dbId">,
    customerId: number,
  ) => Promise<void>;
  removeFromWishlist: (
    productVariantId: number,
    customerId: number,
  ) => Promise<void>;
  toggleWishlist: (
    item: Omit<WishlistItem, "dbId">,
    customerId: number,
  ) => Promise<boolean>;
  isInWishlist: (productVariantId: number) => boolean;
  clearWishlist: (customerId: number) => Promise<void>;
  resetWishlist: () => void;
}

export const useWishlist = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  initializeWishlist: async (customerId: number) => {
    if (!customerId) {
      set({ error: "Customer ID is required", items: [] });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/order/get-customer-item", {
        customerId,
      });

      if (response.data.success) {
        const wishlistItems = response.data.data
          .filter(
            (item: any) => item.item_type === "WISHLIST" && item.status === "A",
          )
          .map((item: any) => ({
            id: item.product_variant_id,
            primary_variant_id: item.product_variant_id,
            name: item.product_name || `Product ${item.product_variant_id}`,
            price: parseFloat(item.unit_price) || 0,
            image: item.product_image || "",
            stock: item.product_stock || 0,
            dbId: item.id,
          }));

        set({ items: wishlistItems });
      } else {
        set({ error: "Failed to fetch wishlist items" });
      }
    } catch (error: any) {
      console.error("Failed to initialize wishlist:", error);
      set({
        error: error.response?.data?.message || "Failed to load wishlist",
        items: [],
      });
    } finally {
      set({ isLoading: false });
    }
  },

  addToWishlist: async (
    item: Omit<WishlistItem, "dbId">,
    customerId: number,
  ) => {
    if (!customerId) {
      set({ error: "User must be logged in to add to wishlist" });
      return;
    }

    if (get().isInWishlist(item.id)) {
      return; // Already in wishlist
    }

    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/order/add-customer-item", {
        customer_id: customerId,
        product_variant_id: item.id,
        item_type: "WISHLIST",
        quantity: 1,
        unit_price: item.price,
        status: "A",
      });

      if (response.data.success) {
        // Add to local state with dbId
        const newItem = {
          ...item,
          dbId: response.data.data.id,
        };
        set((state) => ({
          items: [...state.items, newItem],
        }));
      }
    } catch (error: any) {
      console.error("Failed to add to wishlist:", error);
      set({
        error:
          error.response?.data?.message || "Failed to add item to wishlist",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  removeFromWishlist: async (productVariantId: number, customerId: number) => {
    if (!customerId) {
      set({ error: "User must be logged in to remove from wishlist" });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      // Find item in local state to get dbId
      const itemToRemove = get().items.find((i) => i.id === productVariantId);

      if (itemToRemove?.dbId) {
        // Delete from server using dbId
        await api.post("/order/delete-customer-item", {
          id: itemToRemove.dbId,
        });

        // Remove from local state
        set((state) => ({
          items: state.items.filter((item) => item.id !== productVariantId),
        }));
      } else {
        // If no dbId, refetch from server first
        await get().initializeWishlist(customerId);
        // Try again after refetch
        await get().removeFromWishlist(productVariantId, customerId);
      }
    } catch (error: any) {
      console.error("Failed to remove from wishlist:", error);
      set({
        error:
          error.response?.data?.message ||
          "Failed to remove item from wishlist",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleWishlist: async (
    item: Omit<WishlistItem, "dbId">,
    customerId: number,
  ) => {
    if (!customerId) {
      set({ error: "User must be logged in to toggle wishlist" });
      return false;
    }

    const isInWishlist = get().isInWishlist(item.id);

    if (isInWishlist) {
      await get().removeFromWishlist(item.id, customerId);
      return false;
    } else {
      await get().addToWishlist(item, customerId);
      return true;
    }
  },

  isInWishlist: (productVariantId: number) => {
    return get().items.some((item) => item.id === productVariantId);
  },

  clearWishlist: async (customerId: number) => {
    if (!customerId) {
      set({ error: "User must be logged in to clear wishlist" });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      // Get all wishlist items for this customer
      const response = await api.post("/order/get-customer-item", {
        customerId,
      });

      if (response.data.success) {
        const wishlistItems = response.data.data.filter(
          (item: any) => item.item_type === "WISHLIST",
        );

        // Delete each wishlist item from server
        for (const item of wishlistItems) {
          await api.post("/order/delete-customer-item", {
            id: item.id,
          });
        }

        // Clear local state
        set({ items: [] });
      }
    } catch (error: any) {
      console.error("Failed to clear wishlist:", error);
      set({
        error: error.response?.data?.message || "Failed to clear wishlist",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  resetWishlist: () => {
    // Clear wishlist when user logs out
    set({ items: [], error: null, isLoading: false });
  },
}));
