// app/store/useCart.ts
"use client";

import api from "@/lib/api";
import { create } from "zustand";

interface CartItem {
  id: number;
  primary_variant_id: number;
  name: string;
  price: number;
  image: string;
  weight: string;
  quantity: number;
  dbId?: number;
}

interface CartState {
  cart: CartItem[];
  isLoading: boolean;
  error: string | null;

  initializeCart: (customerId: number) => Promise<void>;
  addToCart: (
    item: Omit<CartItem, "dbId">,
    customerId: number,
  ) => Promise<void>;
  removeFromCart: (
    productVariantId: number,
    customerId: number,
  ) => Promise<void>;
  updateQuantity: (
    productVariantId: number,
    quantity: number,
    customerId: number,
  ) => Promise<void>;
  clearCart: (customerId: number) => Promise<void>;
  resetCart: () => void;
}

// ─── Helper: always read token fresh — never stale ────────────────────────────
function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCart = create<CartState>((set, get) => ({
  cart: [],
  isLoading: false,
  error: null,

  // ── Initialize ─────────────────────────────────────────────────────────────
  initializeCart: async (customerId) => {
    if (!customerId) {
      set({ error: "Customer ID is required", cart: [] });
      return;
    }

    const token = getToken();
    if (!token) {
      set({ error: "Authentication required", cart: [] });
      return;
    }

    // Skip if already loaded
    if (get().cart.length > 0) return;

    set({ isLoading: true, error: null });
    try {
      const res = await api.post(
        "/order/get-customer-item",
        { customerId },
        { headers: getAuthHeaders() },
      );

      if (res.data.success) {
        const cartItems: CartItem[] = res.data.data
          .filter(
            (item: any) => item.item_type === "CART" && item.status === "A",
          )
          .map((item: any) => ({
            id: item.product_variant_id,
            primary_variant_id: item.product_variant_id,
            name: item.product_name || `Product ${item.product_variant_id}`,
            price: parseFloat(item.unit_price) || 0,
            image: item.image || "",
            weight: item.variant_weight || "0",
            quantity: item.quantity || 1,
            dbId: item.id,
          }));
        set({ cart: cartItems });
      } else {
        set({ error: "Failed to fetch cart" });
      }
    } catch (err: any) {
      console.error("[useCart] initializeCart:", err);
      set({
        error: err?.response?.data?.message || "Failed to load cart",
        cart: [],
      });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Add ────────────────────────────────────────────────────────────────────
  addToCart: async (item, customerId) => {
    const token = getToken();
    if (!customerId || !token) {
      set({ error: "Login required" });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const existing = get().cart.find((i) => i.id === item.id);

      if (existing) {
        // Delegate to updateQuantity
        await get().updateQuantity(
          item.id,
          existing.quantity + item.quantity,
          customerId,
        );
        return;
      }

      // Optimistic add
      const optimistic: CartItem = { ...item, dbId: undefined };
      set((s) => ({ cart: [...s.cart, optimistic] }));

      const res = await api.post(
        "/order/add-customer-item",
        {
          customer_id: customerId,
          product_variant_id: item.primary_variant_id,
          item_type: "CART",
          quantity: item.quantity,
          unit_price: item.price,
          status: "A",
        },
        { headers: getAuthHeaders() },
      );

      if (res.data.success) {
        // Patch dbId onto the optimistic item
        set((s) => ({
          cart: s.cart.map((i) =>
            i.id === item.id && !i.dbId ? { ...i, dbId: res.data.data.id } : i,
          ),
        }));
      } else {
        // Rollback
        set((s) => ({ cart: s.cart.filter((i) => i.id !== item.id) }));
      }
    } catch (err: any) {
      console.error("[useCart] addToCart:", err);
      set((s) => ({
        cart: s.cart.filter((i) => i.id !== item.id),
        error: err?.response?.data?.message || "Failed to add to cart",
      }));
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Remove ─────────────────────────────────────────────────────────────────
  removeFromCart: async (productVariantId, customerId) => {
    const token = getToken();
    if (!customerId || !token) {
      set({ error: "Login required" });
      return;
    }

    const item = get().cart.find((i) => i.id === productVariantId);

    // Optimistic remove
    set((s) => ({ cart: s.cart.filter((i) => i.id !== productVariantId) }));

    try {
      if (item?.dbId) {
        await api.post(
          "/order/delete-customer-item",
          { id: item.dbId },
          { headers: getAuthHeaders() },
        );
      } else {
        // dbId unknown — refetch then retry
        await get().initializeCart(customerId);
        const refreshed = get().cart.find((i) => i.id === productVariantId);
        if (refreshed?.dbId) {
          await api.post(
            "/order/delete-customer-item",
            { id: refreshed.dbId },
            { headers: getAuthHeaders() },
          );
          set((s) => ({
            cart: s.cart.filter((i) => i.id !== productVariantId),
          }));
        }
      }
    } catch (err: any) {
      console.error("[useCart] removeFromCart:", err);
      // Rollback
      if (item) set((s) => ({ cart: [...s.cart, item] }));
      set({ error: err?.response?.data?.message || "Failed to remove item" });
    }
  },

  // ── Update quantity ────────────────────────────────────────────────────────
  updateQuantity: async (productVariantId, quantity, customerId) => {
    const token = getToken();
    if (!customerId || !token) {
      set({ error: "Login required" });
      return;
    }

    if (quantity < 1) {
      await get().removeFromCart(productVariantId, customerId);
      return;
    }

    const item = get().cart.find((i) => i.id === productVariantId);
    if (!item) {
      set({ error: "Item not found in cart" });
      return;
    }

    // Optimistic update
    const prevQty = item.quantity;
    set((s) => ({
      cart: s.cart.map((i) =>
        i.id === productVariantId ? { ...i, quantity } : i,
      ),
    }));

    try {
      if (item.dbId) {
        await api.post(
          "/order/update-customer-item",
          { id: item.dbId, quantity, unit_price: item.price, status: "A" },
          { headers: getAuthHeaders() },
        );
      } else {
        const res = await api.post(
          "/order/add-customer-item",
          {
            customer_id: customerId,
            product_variant_id: productVariantId,
            item_type: "CART",
            quantity,
            unit_price: item.price,
            status: "A",
          },
          { headers: getAuthHeaders() },
        );
        if (res.data.success) {
          set((s) => ({
            cart: s.cart.map((i) =>
              i.id === productVariantId
                ? { ...i, quantity, dbId: res.data.data.id }
                : i,
            ),
          }));
        }
      }
    } catch (err: any) {
      console.error("[useCart] updateQuantity:", err);
      // Rollback
      set((s) => ({
        cart: s.cart.map((i) =>
          i.id === productVariantId ? { ...i, quantity: prevQty } : i,
        ),
        error: err?.response?.data?.message || "Failed to update quantity",
      }));
    }
  },

  // ── Clear ──────────────────────────────────────────────────────────────────
  clearCart: async (customerId) => {
    const token = getToken();
    if (!customerId || !token) {
      set({ error: "Login required" });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await api.post(
        "/order/get-customer-item",
        { customerId },
        { headers: getAuthHeaders() },
      );

      if (res.data.success) {
        const cartItems = res.data.data.filter(
          (item: any) => item.item_type === "CART",
        );
        await Promise.all(
          cartItems.map((item: any) =>
            api.post(
              "/order/delete-customer-item",
              { id: item.id },
              { headers: getAuthHeaders() },
            ),
          ),
        );
        set({ cart: [] });
      }
    } catch (err: any) {
      console.error("[useCart] clearCart:", err);
      set({ error: err?.response?.data?.message || "Failed to clear cart" });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Reset (on logout) ──────────────────────────────────────────────────────
  resetCart: () => set({ cart: [], error: null, isLoading: false }),
}));
