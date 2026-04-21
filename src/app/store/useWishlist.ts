// app/store/useWishlist.ts
"use client";
import api from "@/lib/api";
import { create } from "zustand";

interface WishlistItem {
  id: number;
  primary_variant_id: number;
  name: string;
  price: number;
  slug: string;
  image: string;
  stock: number;
  dbId?: number;
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

// ─── Helper: always read token fresh from localStorage ────────────────────────
// Never store it in Zustand state — avoids SSR crash and stale-token bugs.
function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useWishlist = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  // ── Initialize ─────────────────────────────────────────────────────────────
  initializeWishlist: async (customerId) => {
    if (!customerId) {
      set({ error: "Customer ID is required", items: [] });
      return;
    }

    // Avoid re-fetching if already loaded
    if (get().items.length > 0) return;

    set({ isLoading: true, error: null });
    try {
      const response = await api.post(
        "/order/get-customer-item",
        { customerId },
        { headers: getAuthHeaders() },
      );
      if (response.data.success) {
        const wishlistItems: WishlistItem[] = response.data.data
          .filter(
            (item: any) => item.item_type === "WISHLIST" && item.status === "A",
          )
          .map((item: any) => ({
            id: item.product_variant_id,
            primary_variant_id: item.product_variant_id,
            name: item.product_name || `Product ${item.product_variant_id}`,
            price: parseFloat(item.unit_price) || 0,
            slug: item.product_slug || "",
            image: item.image || "",
            stock: item.stock || 0,
            dbId: item.id,
          }));

        set({ items: wishlistItems });
      } else {
        set({ error: "Failed to fetch wishlist" });
      }
    } catch (err: any) {
      console.error("[useWishlist] initializeWishlist:", err);
      set({ error: err?.response?.data?.message || "Failed to load wishlist" });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Add ────────────────────────────────────────────────────────────────────
  addToWishlist: async (item, customerId) => {
    if (!customerId) {
      set({ error: "Login required" });
      return;
    }
    if (get().isInWishlist(item.id)) return;

    set({ isLoading: true, error: null });
    try {
      const response = await api.post(
        "/order/add-customer-item",
        {
          customer_id: customerId,
          product_variant_id: item.primary_variant_id,
          item_type: "WISHLIST",
          quantity: 1,
          unit_price: item.price,
          status: "A",
        },
        { headers: getAuthHeaders() },
      );

      if (response.data.success) {
        set((state) => ({
          items: [...state.items, { ...item, dbId: response.data.data.id }],
        }));
      }
    } catch (err: any) {
      console.error("[useWishlist] addToWishlist:", err);
      set({
        error: err?.response?.data?.message || "Failed to add to wishlist",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Remove ─────────────────────────────────────────────────────────────────
  removeFromWishlist: async (productVariantId, customerId) => {
    if (!customerId) {
      set({ error: "Login required" });
      return;
    }

    const item = get().items.find((i) => i.id === productVariantId);

    // Optimistic update — remove immediately so UI feels instant
    set((state) => ({
      items: state.items.filter((i) => i.id !== productVariantId),
    }));

    try {
      if (item?.dbId) {
        await api.post(
          "/order/delete-customer-item",
          { id: item.dbId },
          { headers: getAuthHeaders() },
        );
      } else {
        // dbId unknown — refetch to get it, then retry
        await get().initializeWishlist(customerId);
        const refreshed = get().items.find((i) => i.id === productVariantId);
        if (refreshed?.dbId) {
          await api.post(
            "/order/delete-customer-item",
            { id: refreshed.dbId },
            { headers: getAuthHeaders() },
          );
          set((state) => ({
            items: state.items.filter((i) => i.id !== productVariantId),
          }));
        }
      }
    } catch (err: any) {
      console.error("[useWishlist] removeFromWishlist:", err);
      // Rollback optimistic update on failure
      if (item) {
        set((state) => ({ items: [...state.items, item] }));
      }
      set({ error: err?.response?.data?.message || "Failed to remove item" });
    }
  },

  // ── Toggle ─────────────────────────────────────────────────────────────────
  toggleWishlist: async (item, customerId) => {
    if (!customerId) {
      set({ error: "Login required" });
      return false;
    }

    if (get().isInWishlist(item.id)) {
      await get().removeFromWishlist(item.id, customerId);
      return false;
    } else {
      await get().addToWishlist(item, customerId);
      return true;
    }
  },

  // ── Helpers ────────────────────────────────────────────────────────────────
  isInWishlist: (productVariantId) =>
    get().items.some((item) => item.id === productVariantId),

  // ── Clear ──────────────────────────────────────────────────────────────────
  clearWishlist: async (customerId) => {
    if (!customerId) {
      set({ error: "Login required" });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await api.post(
        "/order/get-customer-item",
        { customerId },
        { headers: getAuthHeaders() },
      );

      if (response.data.success) {
        const wishlistItems = response.data.data.filter(
          (item: any) => item.item_type === "WISHLIST",
        );
        await Promise.all(
          wishlistItems.map((item: any) =>
            api.post(
              "/order/delete-customer-item",
              { id: item.id },
              { headers: getAuthHeaders() },
            ),
          ),
        );
        set({ items: [] });
      }
    } catch (err: any) {
      console.error("[useWishlist] clearWishlist:", err);
      set({
        error: err?.response?.data?.message || "Failed to clear wishlist",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Reset (on logout) ──────────────────────────────────────────────────────
  resetWishlist: () => set({ items: [], error: null, isLoading: false }),
}));
