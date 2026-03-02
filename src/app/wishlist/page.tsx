"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingCart, ArrowLeft, ImageOff } from "lucide-react";
import { useCart } from "@/app/store/useCart";
import { useToastStore } from "@/app/store/useToastStore";
import { useWishlist } from "@/app/store/useWishlist";
import { useUserStore } from "@/app/store/useUserStore"; // Import user store

export default function Wishlist() {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToastStore();
  const { user } = useUserStore(); // Get user

  const handleAddToCart = (item: any) => {
    if (!user) {
      showToast("Please login to add items to cart", "error");
      return;
    }

    addToCart(
      {
        id: item.id,
        primary_variant_id: item.primary_variant_id,
        name: item.name,
        price: Number(item.price) || 0,
        image: item.image,
        quantity: 1,
        weight: "0", // You might want to get actual weight from somewhere
      },
      user.id,
    );
    showToast("Added to cart 🛒", "success");
  };

  const handleRemoveFromWishlist = (itemId: number) => {
    if (!user) return;
    removeFromWishlist(itemId, user.id);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-semibold text-gray-700">
          Your Wishlist is Empty 💔
        </h2>
        <p className="text-gray-500 mt-2">
          Add products you love to keep track of them easily.
        </p>
        <Link
          href="/"
          className="mt-6 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-800">My Wishlist 💖</h1>
        </div>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow hover:bg-red-100 transition"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              <Link href={`/product/${item.id}`}>
                <h3 className="font-semibold text-lg line-clamp-1">
                  {item.name}
                </h3>
              </Link>

              <p className="text-primary font-bold text-xl">৳ {item.price}</p>

              {item.stock > 0 ? (
                <button
                  onClick={() => handleAddToCart(item)}
                  className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2 mt-3"
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
        ))}
      </div>
    </div>
  );
}
