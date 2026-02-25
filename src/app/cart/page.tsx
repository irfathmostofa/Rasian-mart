"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, AlertCircle } from "lucide-react";
import { useCart } from "../store/useCart";

import { useEffect, useState } from "react";
import { useToastStore } from "../store/useToastStore";
import { useUserStore } from "../store/useUserStore";

export default function CartPage() {
  const { user } = useUserStore();
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

  useEffect(() => {
    setIsClient(true);
    if (user?.id) {
      initializeCart(user.id);
    }
  }, [user?.id, initializeCart]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Show login message if not authenticated
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-4">Please Login to View Cart 🔒</h2>
        <p className="text-gray-600 mb-6">
          You need to be logged in to access your shopping cart.
        </p>
        <Link
          href="/account/login"
          className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
        >
          Login to Continue
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isClient) {
    return null; // Or a loading skeleton
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="w-48 h-48 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-4">Your cart is empty 🛒</h2>
        <p className="text-gray-600 mb-6">
          Looks like you haven't added any products to your cart yet.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

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
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border"
            >
              <div className="flex-shrink-0">
                <Image
                  src={item.image || "https://placehold.co/400"}
                  alt={item.name || "Product image"}
                  width={100}
                  height={100}
                  className="rounded-lg object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://placehold.co/400";
                  }}
                />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                <p className="text-primary font-bold text-xl mb-3">
                  ৳ {item.price.toFixed(2)}
                </p>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDecrement(item.id, item.quantity)}
                      disabled={isLoading}
                      className="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-100 disabled:opacity-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleIncrement(item.id, item.quantity)}
                      disabled={isLoading}
                      className="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-100 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={isLoading}
                    className="text-red-500 hover:text-red-700 flex items-center gap-1 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-lg">
                  ৳ {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-xl p-6 h-fit">
          <h2 className="text-xl font-bold mb-6">Order Summary</h2>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">৳ {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-semibold">
                {total > 1000 ? "Free" : "৳ 50.00"}
              </span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">
                  ৳ {(total > 1000 ? total : total + 50).toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {total > 1000
                  ? "🎉 Free shipping applied!"
                  : "Add ৳" +
                    (1001 - total).toFixed(2) +
                    " more for free shipping"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleClearCart}
              disabled={isLoading}
              className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
            >
              Clear Cart
            </button>

            <Link
              href="/checkout"
              className="block w-full bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary/90 text-center font-semibold transition"
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/"
              className="block w-full border border-primary text-primary px-4 py-3 rounded-lg hover:bg-primary/5 text-center transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
