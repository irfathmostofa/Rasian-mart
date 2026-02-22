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
  dbId?: number; // Database ID for server operations
}

interface CartState {
  cart: CartItem[];
  isLoading: boolean;
  token: string | null;
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
  setToken: (token: string | null) => void;
}

export const useCart = create<CartState>((set, get) => ({
  cart: [],
  isLoading: false,
  error: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,

  setToken: (token) => {
    if (token) {
      localStorage.setItem("token", token);
      set({ token });
    } else {
      localStorage.removeItem("token");
      set({ token: null, cart: [] });
    }
  },

  // Helper function to get headers with token
  getAuthHeaders: () => {
    const token = get().token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  initializeCart: async (customerId: number) => {
    if (!customerId) {
      set({ error: "Customer ID is required", cart: [] });
      return;
    }

    const token = get().token;
    if (!token) {
      set({ error: "Authentication required", cart: [] });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await api.post(
        "/order/get-customer-item",
        { customerId: customerId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        const cartItems = response.data.data
          .filter(
            (item: any) => item.item_type === "CART" && item.status === "A",
          )
          .map((item: any) => ({
            id: item.product_variant_id,
            primary_variant_id: item.product_variant_id,
            name: item.product_name || `Product ${item.product_variant_id}`,
            price: parseFloat(item.unit_price) || 0,
            image: item.product_image || "",
            weight: item.weight,
            quantity: item.quantity || 1,
            dbId: item.id,
          }));

        set({ cart: cartItems });
      } else {
        set({ error: "Failed to fetch cart items" });
      }
    } catch (error: any) {
      console.error("Failed to initialize cart:", error);
      set({
        error: error.response?.data?.message || "Failed to load cart",
        cart: [],
      });
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (item: Omit<CartItem, "dbId">, customerId: number) => {
    const token = get().token;
    if (!customerId || !token) {
      set({ error: "User must be logged in to add to cart" });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      // Check if item already exists in cart
      const existingItem = get().cart.find((i) => i.id === item.id);

      if (existingItem) {
        // Update quantity if item exists
        await get().updateQuantity(
          item.id,
          existingItem.quantity + item.quantity,
          customerId,
        );
      } else {
        // Add new item to server
        const response = await api.post(
          "/order/add-customer-item",
          {
            customer_id: customerId,
            product_variant_id: item.id,
            item_type: "CART",
            quantity: item.quantity,
            unit_price: item.price,
            status: "A",
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (response.data.success) {
          // Add to local state with dbId
          const newItem = {
            ...item,
            dbId: response.data.data.id,
          };
          set((state) => ({
            cart: [...state.cart, newItem],
          }));
        }
      }
    } catch (error: any) {
      console.error("Failed to add to cart:", error);
      set({
        error: error.response?.data?.message || "Failed to add item to cart",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  removeFromCart: async (productVariantId: number, customerId: number) => {
    const token = get().token;
    if (!customerId || !token) {
      set({ error: "User must be logged in to remove from cart" });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      // Find item in local state to get dbId
      const itemToRemove = get().cart.find((i) => i.id === productVariantId);

      if (itemToRemove?.dbId) {
        // Delete from server using dbId
        await api.post(
          "/order/delete-customer-item",
          {
            id: itemToRemove.dbId,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        // Remove from local state
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== productVariantId),
        }));
      } else {
        // If no dbId, refetch from server first
        await get().initializeCart(customerId);
        // Try again after refetch
        await get().removeFromCart(productVariantId, customerId);
      }
    } catch (error: any) {
      console.error("Failed to remove from cart:", error);
      set({
        error:
          error.response?.data?.message || "Failed to remove item from cart",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  updateQuantity: async (
    productVariantId: number,
    quantity: number,
    customerId: number,
  ) => {
    const token = get().token;
    if (!customerId || !token) {
      set({ error: "User must be logged in to update cart" });
      return;
    }

    if (quantity < 1) {
      // If quantity is 0 or less, remove the item
      await get().removeFromCart(productVariantId, customerId);
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const item = get().cart.find((i) => i.id === productVariantId);

      if (!item) {
        set({ error: "Item not found in cart" });
        return;
      }

      if (item.dbId) {
        // Update on server
        await api.post(
          "/order/update-customer-item",
          {
            id: item.dbId,
            quantity,
            unit_price: item.price,
            status: "A",
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        // Update local state
        set((state) => ({
          cart: state.cart.map((i) =>
            i.id === productVariantId ? { ...i, quantity } : i,
          ),
        }));
      } else {
        // If no dbId, item might not exist on server yet
        const response = await api.post(
          "/order/add-customer-item",
          {
            customer_id: customerId,
            product_variant_id: productVariantId,
            item_type: "CART",
            quantity,
            unit_price: item.price,
            status: "A",
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (response.data.success) {
          // Update local state with dbId
          set((state) => ({
            cart: state.cart.map((i) =>
              i.id === productVariantId
                ? { ...i, quantity, dbId: response.data.data.id }
                : i,
            ),
          }));
        }
      }
    } catch (error: any) {
      console.error("Failed to update quantity:", error);
      set({
        error: error.response?.data?.message || "Failed to update quantity",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  clearCart: async (customerId: number) => {
    const token = get().token;
    if (!customerId || !token) {
      set({ error: "User must be logged in to clear cart" });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      // Get all cart items for this customer
      const response = await api.post(
        "/order/get-customer-item",
        { customerId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        const cartItems = response.data.data.filter(
          (item: any) => item.item_type === "CART",
        );

        // Delete each cart item from server
        for (const item of cartItems) {
          await api.post(
            "/order/delete-customer-item",
            {
              id: item.id,
            },
            { headers: { Authorization: `Bearer ${token}` } },
          );
        }

        // Clear local state
        set({ cart: [] });
      }
    } catch (error: any) {
      console.error("Failed to clear cart:", error);
      set({
        error: error.response?.data?.message || "Failed to clear cart",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  resetCart: () => {
    // Clear cart when user logs out
    set({ cart: [], error: null, isLoading: false });
  },
}));
