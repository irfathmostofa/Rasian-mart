// store/useCouponStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/api";

// Types based on your API response
export interface Coupon {
  id: number;
  code: string;
  description: string;
  discount_type: "fixed" | "percentage";
  discount_value: string;
  min_purchase_amount: string | null;
  max_discount_amount: string | null;
  usage_limit: number | null;
  usage_count: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  applicable_to: "all" | "categories" | "products";
  created_at: string;
  updated_at: string;
}

export interface CouponValidationRequest {
  code: string;
  total_amount: number;
  product_ids?: number[];
  category_ids?: number[];
}

export interface CouponValidationResponse {
  success: boolean;
  message: string;
  data: {
    coupon: Coupon;
    discount_amount: number;
    final_amount: number;
  };
}

export interface CouponApplyRequest {
  coupon_id: number;
  order_id: number;
  user_id: number;
  discount_amount: number;
}

export interface CouponApplyResponse {
  success: boolean;
  message: string;
  data?: any;
}

interface CouponState {
  // State
  coupons: Coupon[];
  availableCoupons: Coupon[];
  appliedCoupon: Coupon | null;
  discountAmount: number;
  isLoading: boolean;
  error: string | null;
  validationMessage: string | null;

  // Actions
  fetchCoupons: () => Promise<void>;
  validateCoupon: (params: CouponValidationRequest) => Promise<boolean>;
  applyCoupon: (params: CouponApplyRequest) => Promise<boolean>;
  removeCoupon: () => void;
  clearError: () => void;
  resetCouponState: () => void;
}

export const useCouponStore = create<CouponState>()(
  persist(
    (set, get) => ({
      // Initial state
      coupons: [],
      availableCoupons: [],
      appliedCoupon: null,
      discountAmount: 0,
      isLoading: false,
      error: null,
      validationMessage: null,

      // Fetch all coupons
      fetchCoupons: async () => {
        const token = localStorage.getItem("token");

        if (!token) {
          set({ error: "No authentication token found", isLoading: false });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const res = await api.get("/coupon/get-all", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.data?.success) {
            const coupons = res.data.data || [];

            // Filter active coupons
            const now = new Date().toISOString();
            const availableCoupons = coupons.filter((coupon: Coupon) => {
              const startDate = new Date(coupon.start_date);
              const endDate = new Date(coupon.end_date);
              const currentDate = new Date(now);

              return (
                coupon.is_active &&
                currentDate >= startDate &&
                currentDate <= endDate &&
                (coupon.usage_limit === null ||
                  coupon.usage_count < coupon.usage_limit)
              );
            });

            set({
              coupons,
              availableCoupons,
              isLoading: false,
            });
          } else {
            set({
              error: res.data?.message || "Failed to fetch coupons",
              isLoading: false,
            });
          }
        } catch (err: any) {
          console.error("Failed to fetch coupons:", err);
          set({
            error: err.response?.data?.message || "Failed to fetch coupons",
            isLoading: false,
          });
        }
      },

      // Validate a coupon
      // store/useCouponStore.ts - Update the validateCoupon function

      // Validate a coupon
      validateCoupon: async (params: CouponValidationRequest) => {
        const token = localStorage.getItem("token");

        if (!token) {
          set({
            error: "No authentication token found",
            validationMessage: "Please login to apply coupon",
          });
          return false;
        }

        set({ isLoading: true, error: null, validationMessage: null });

        try {
          const res = await api.post("/coupon/validate", params, {
            headers: { Authorization: `Bearer ${token}` },
          });

          // Check the response structure - it has success, message, and data
          if (res.data?.success && res.data?.data) {
            const coupon = res.data.data.coupon;
            // Get discount amount from data.discount_amount, not root
            const discountAmount = res.data.data.discount_amount || 0;

            set({
              appliedCoupon: coupon,
              discountAmount,
              validationMessage:
                res.data.message || "Coupon applied successfully!",
              isLoading: false,
            });

            return true;
          } else {
            set({
              error: res.data?.message || "Invalid coupon code",
              appliedCoupon: null,
              discountAmount: 0,
              validationMessage: null,
              isLoading: false,
            });

            return false;
          }
        } catch (err: any) {
          console.error("Coupon validation failed:", err);
          set({
            error: err.response?.data?.message || "Failed to validate coupon",
            appliedCoupon: null,
            discountAmount: 0,
            validationMessage: null,
            isLoading: false,
          });

          return false;
        }
      },

      // Apply coupon to order
      applyCoupon: async (params: CouponApplyRequest) => {
        const token = localStorage.getItem("token");

        if (!token) {
          set({ error: "No authentication token found" });
          return false;
        }

        set({ isLoading: true, error: null });

        try {
          const res = await api.post("/coupon/apply", params, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.data?.success) {
            // // Optionally refresh coupons to update usage count
            // get().fetchCoupons();

            set({
              isLoading: false,
              validationMessage:
                res.data.message || "Coupon applied to order successfully!",
            });

            return true;
          } else {
            set({
              error: res.data?.message || "Failed to apply coupon",
              isLoading: false,
            });

            return false;
          }
        } catch (err: any) {
          console.error("Failed to apply coupon:", err);
          set({
            error: err.response?.data?.message || "Failed to apply coupon",
            isLoading: false,
          });

          return false;
        }
      },

      // Remove applied coupon
      removeCoupon: () => {
        set({
          appliedCoupon: null,
          discountAmount: 0,
          validationMessage: "Coupon removed",
          error: null,
        });

        // Clear the message after 3 seconds
        setTimeout(() => {
          set({ validationMessage: null });
        }, 3000);
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Reset coupon state
      resetCouponState: () => {
        set({
          appliedCoupon: null,
          discountAmount: 0,
          error: null,
          validationMessage: null,
        });
      },
    }),
    {
      name: "coupon-storage", // unique name for localStorage
      partialize: (state) => ({
        // Only persist these fields
        appliedCoupon: state.appliedCoupon,
        discountAmount: state.discountAmount,
      }),
    },
  ),
);

// Optional: Create a selector hook for better performance
export const useCoupon = () => {
  const coupons = useCouponStore((state) => state.coupons);
  const availableCoupons = useCouponStore((state) => state.availableCoupons);
  const appliedCoupon = useCouponStore((state) => state.appliedCoupon);
  const discountAmount = useCouponStore((state) => state.discountAmount);
  const isLoading = useCouponStore((state) => state.isLoading);
  const error = useCouponStore((state) => state.error);
  const validationMessage = useCouponStore((state) => state.validationMessage);

  const fetchCoupons = useCouponStore((state) => state.fetchCoupons);
  const validateCoupon = useCouponStore((state) => state.validateCoupon);
  const applyCoupon = useCouponStore((state) => state.applyCoupon);
  const removeCoupon = useCouponStore((state) => state.removeCoupon);
  const clearError = useCouponStore((state) => state.clearError);
  const resetCouponState = useCouponStore((state) => state.resetCouponState);

  return {
    coupons,
    availableCoupons,
    appliedCoupon,
    discountAmount,
    isLoading,
    error,
    validationMessage,
    fetchCoupons,
    validateCoupon,
    applyCoupon,
    removeCoupon,
    clearError,
    resetCouponState,
  };
};
