"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  ShoppingCart,
  ArrowLeft,
  ImageOff,
  AlertCircle,
  Heart,
} from "lucide-react";
import { useWishlist } from "../store/useWishlist";
import { useCart } from "../store/useCart";
import { useToastStore } from "../store/useToastStore";
import { useEffect, useState } from "react";
import { useUserStore } from "../store/useUserStore";

export default function WishlistPage() {
  const { user } = useUserStore();
  const {
    items,
    removeFromWishlist,
    clearWishlist,
    initializeWishlist,
    isLoading,
  } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToastStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (user?.id) {
      initializeWishlist(user.id);
    }
  }, [user?.id, initializeWishlist]);

  // Show login message if not authenticated
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700">
          Please Login to View Wishlist 🔒
        </h2>
        <p className="text-gray-500 mt-2 mb-6">
          You need to be logged in to access your wishlist.
        </p>
        <Link
          href="/account/login"
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition"
        >
          Login to Continue
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Loading your wishlist...</p>
      </div>
    );
  }

  if (!isClient) {
    return null; // Or a loading skeleton
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-48 h-48 bg-gradient-to-br from-pink-50 to-red-50 rounded-full flex items-center justify-center mb-6">
          <Heart className="w-20 h-20 text-red-300" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-700">
          Your Wishlist is Empty 💔
        </h2>
        <p className="text-gray-500 mt-2 mb-6">
          Add products you love to keep track of them easily.
        </p>
        <Link
          href="/"
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const handleRemoveFromWishlist = async (id: number) => {
    if (!user?.id) return;
    try {
      await removeFromWishlist(id, user.id);
      showToast("Removed from wishlist", "success");
    } catch (error) {
      showToast("Failed to remove from wishlist", "error");
    }
  };

  const handleClearWishlist = async () => {
    if (!user?.id) return;
    if (
      window.confirm("Are you sure you want to clear your entire wishlist?")
    ) {
      try {
        await clearWishlist(user.id);
        showToast("Wishlist cleared", "success");
      } catch (error) {
        showToast("Failed to clear wishlist", "error");
      }
    }
  };

  const handleAddToCart = async (item: any) => {
    if (!user?.id) {
      showToast("Please login to add to cart", "error");
      return;
    }

    try {
      await addToCart(
        {
          id: item.id,
          primary_variant_id: item.primary_variant_id,
          name: item.name,
          price: Number(item.price) || 0,
          image: item.image,
          quantity: 1,
        },
        user.id,
      );
      showToast("Added to cart 🛒", "success");
    } catch (error) {
      showToast("Failed to add to cart", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => history.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Wishlist 💖</h1>
            <p className="text-gray-500 text-sm mt-1">
              {items.length} {items.length === 1 ? "item" : "items"}
            </p>
          </div>
        </div>
        <button
          onClick={handleClearWishlist}
          className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-red-300 hover:bg-red-50 transition"
          disabled={isLoading}
        >
          <Trash2 className="w-4 h-4" /> Clear All
        </button>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition"
          >
            <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden flex items-center justify-center bg-gray-50">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={300}
                  height={300}
                  className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/400";
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <ImageOff className="w-8 h-8 sm:w-10 sm:h-10 mb-2" />
                  <p className="text-xs sm:text-sm">No Image</p>
                </div>
              )}

              <button
                onClick={() => handleRemoveFromWishlist(item.id)}
                disabled={isLoading}
                className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow hover:bg-red-100 transition disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              <Link href={`/product/${item.id}`}>
                <h3 className="font-semibold text-lg line-clamp-1 hover:text-primary transition">
                  {item.name}
                </h3>
              </Link>

              <p className="text-primary font-bold text-xl">
                ৳ {item.price.toFixed(2)}
              </p>

              <div className="pt-2">
                {item.stock > 0 ? (
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={isLoading}
                    className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </button>
                ) : (
                  <Link
                    href={`/product/${item.id}`}
                    className="w-full block text-center bg-gray-700 text-white py-2 rounded font-medium text-sm hover:bg-gray-600 transition"
                  >
                    View Details
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
