// components/profile/WishList.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingCart, Heart, ImageOff, Loader2 } from "lucide-react";
import { useCart } from "@/app/store/useCart";
import { useToastStore } from "@/app/store/useToastStore";
import { useWishlist } from "@/app/store/useWishlist";
import { useUserStore } from "@/app/store/useUserStore";
import { useEffect } from "react";

export default function Wishlist() {
  const { items, isLoading, removeFromWishlist, initializeWishlist } =
    useWishlist();
  console.log(items);
  const { addToCart } = useCart();
  const { showToast } = useToastStore();
  const { user } = useUserStore();

  // Re-initialise if items are empty when this tab becomes visible
  // (e.g. user navigated directly to /profile?tab=wishlist)
  useEffect(() => {
    if (user?.id && items.length === 0 && !isLoading) {
      initializeWishlist(user.id);
    }
  }, [user?.id]);

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
        weight: "0",
      },
      user.id,
    );
    showToast("Added to cart 🛒", "success");
  };

  const handleRemove = (itemId: number) => {
    if (!user) return;
    removeFromWishlist(itemId, user.id);
    showToast("Removed from wishlist", "info");
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-gray-500">Loading your wishlist…</p>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-red-300" />
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Your wishlist is empty
        </h2>
        <p className="text-gray-500 text-sm max-w-xs mb-6">
          Save items you love to your wishlist and find them here anytime.
        </p>
        <Link
          href="/"
          className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  // ── Grid ──────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">
          {items.length} {items.length === 1 ? "item" : "items"} saved
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            {/* Image */}
            <div className="relative w-full aspect-4/3 overflow-hidden bg-gray-50">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://placehold.co/400";
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                  <ImageOff className="w-8 h-8 mb-1" />
                  <p className="text-xs">No image</p>
                </div>
              )}

              {/* Remove button */}
              <button
                onClick={() => handleRemove(item.id)}
                className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow flex items-center justify-center hover:bg-red-50 transition-colors"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
              </button>

              {/* Out of stock badge */}
              {item.stock <= 0 && (
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Out of stock
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3.5 space-y-2">
              <Link href={`/product/${item.id}`}>
                <h3 className="font-medium text-sm text-gray-800 line-clamp-2 hover:text-primary transition-colors leading-snug">
                  {item.name}
                </h3>
              </Link>

              <p className="text-primary font-bold text-base">
                ৳{Number(item.price).toLocaleString()}
              </p>

              {item.stock > 0 ? (
                <button
                  onClick={() => handleAddToCart(item)}
                  className="w-full bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              ) : (
                <Link
                  href={`/product/${item.id}`}
                  className="w-full block text-center bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
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
