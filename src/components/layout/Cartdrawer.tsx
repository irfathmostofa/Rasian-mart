"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
  X,
  ShoppingBag,
  ArrowRight,
  Lock,
} from "lucide-react";
import { useUserStore } from "@/app/store/useUserStore";
import { useCart } from "@/app/store/useCart";
import { useToastStore } from "@/app/store/useToastStore";
import { useThemeData } from "@/app/store/useThemeData";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { user } = useUserStore();
  const logistic = (useThemeData("logistics") || {}) as any;
  console.log(logistic);
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    initializeCart,
    isLoading,
  } = useCart();
  const { showToast } = useToastStore();
  const [isClient, setIsClient] = useState(false);
  const colors = (useThemeData("colors") || {}) as any;
  const primaryColor = colors?.primary || "#006747";
  useEffect(() => {
    setIsClient(true);
    if (user?.id) {
      initializeCart(user.id);
    }
  }, [user?.id, initializeCart]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = total > 1000 ? 0 : 50;
  const finalTotal = total + shippingCost;

  const handleRemoveItem = async (id: number) => {
    if (!user?.id) return;
    try {
      await removeFromCart(id, user.id);
      showToast("Item removed from cart", "success");
    } catch (error) {
      showToast("Failed to remove item", "error");
    }
  };

  const handleUpdateQuantity = async (id: number, quantity: number) => {
    if (!user?.id) return;
    if (quantity < 1) {
      await handleRemoveItem(id);
      return;
    }
    try {
      await updateQuantity(id, quantity, user.id);
    } catch (error) {
      showToast("Failed to update quantity", "error");
    }
  };

  const handleClearCart = async () => {
    if (!user?.id) return;
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      try {
        await clearCart(user.id);
        showToast("Cart cleared", "success");
      } catch (error) {
        showToast("Failed to clear cart", "error");
      }
    }
  };

  const handleIncrement = (id: number, currentQuantity: number) => {
    handleUpdateQuantity(id, currentQuantity + 1);
  };

  const handleDecrement = (id: number, currentQuantity: number) => {
    if (currentQuantity > 1) {
      handleUpdateQuantity(id, currentQuantity - 1);
    } else {
      handleRemoveItem(id);
    }
  };

  if (!isClient) return null;

  // Show login message if not authenticated
  if (!user) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 120 }}
              className="fixed right-0 top-0 h-full w-full max-w-md! bg-white shadow-2xl z-100! flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  Shopping Cart
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={22} className="text-gray-600" />
                </button>
              </div>

              {/* Login prompt */}
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mb-6">
                  <Lock size={40} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sign in to your account
                </h3>
                <p className="text-gray-600 text-sm mb-8">
                  You need to be logged in to view and manage your shopping
                  cart.
                </p>
                <div className="flex gap-3 w-full flex-col">
                  <Link
                    href="/account/login"
                    onClick={onClose}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    Login
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/account/signup"
                    onClick={onClose}
                    className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-2 border-b border-gray-200 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag size={15} className={`text-${primaryColor}`} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
                  <p className="text-xs text-gray-500">{cart.length} items</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={22} className="text-gray-600" />
              </button>
            </div>

            {/* Empty state */}
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center mb-6">
                  <ShoppingBag size={40} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-600 text-sm mb-8">
                  Start adding some products to get started!
                </p>
                <Link
                  href="/"
                  onClick={onClose}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center gap-2"
                >
                  Continue Shopping
                  <ArrowRight size={18} />
                </Link>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto">
                  {/* Loading state overlay */}
                  {isLoading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-40">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium text-gray-700">
                          Updating...
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-4 space-y-3">
                    {cart.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                      >
                        {/* Image */}
                        <div className="flex-shrink-0 relative">
                          <Image
                            src={item.image || "https://placehold.co/100"}
                            alt={item.name || "Product"}
                            width={80}
                            height={80}
                            className="rounded-lg object-cover w-20 h-20"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://placehold.co/100";
                            }}
                          />
                          {item.quantity > 1 && (
                            <div className="absolute -top-2 -right-2 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                              {item.quantity}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                              {item.name}
                            </h4>
                            <p className="text-blue-600 font-bold text-sm mt-1">
                              ৳ {item.price.toFixed(2)}
                            </p>
                          </div>

                          {/* Quantity controls */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() =>
                                handleDecrement(item.id, item.quantity)
                              }
                              disabled={isLoading}
                              className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleIncrement(item.id, item.quantity)
                              }
                              disabled={isLoading}
                              className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                              <Plus size={14} />
                            </button>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={isLoading}
                              className="ml-auto p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 shrink-0" />

                {/* Order Summary */}
                <div className="bg-gradient-to-b from-gray-50 to-white p-4 space-y-4 shrink-0">
                  {/* Pricing breakdown */}
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium text-gray-900">
                        ৳ {total.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="font-medium">
                        {shippingCost === 0 ? (
                          <span className="text-green-600 font-semibold">
                            Free
                          </span>
                        ) : (
                          <span className="text-gray-900">
                            ৳ {shippingCost.toFixed(2)}
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Shipping promo */}
                    {total < 1000 && total > 0 && (
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-900 font-medium">
                          🎉 Add ৳{(1001 - total).toFixed(2)} more for free
                          shipping
                        </p>
                      </div>
                    )}

                    {/* Total */}
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-blue-600">
                        ৳ {finalTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-2.5 pt-2">
                    <Link
                      href="/checkout"
                      onClick={onClose}
                      className={`block w-full  bg-[#222524] text-white px-4 py-3 rounded-lg  font-semibold transition-colors text-center flex items-center justify-center gap-2`}
                    >
                      Proceed to Checkout
                      <ArrowRight size={18} />
                    </Link>
                    <button
                      onClick={handleClearCart}
                      disabled={isLoading}
                      className="w-full border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm font-medium"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
