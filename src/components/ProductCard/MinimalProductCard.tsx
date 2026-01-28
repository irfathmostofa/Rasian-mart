// app/components/ProductCard/MinimalProductCard.tsx
"use client";

import Image from "next/image";
import { Heart, ShoppingCart, Star, ImageOff, Eye, Plus } from "lucide-react";
import { ProductCardProps } from "@/types/ProductCard";
import { formatPrice, getCategoryName, getImageUrl } from "@/components/helper";
import Link from "next/link";
import { useCart } from "@/app/store/useCart";
import { useWishlist } from "@/app/store/useWishlist";
import { useToastStore } from "@/app/store/useToastStore";
import { useUserStore } from "@/app/store/useUserStore";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function MinimalProductCard({
  id,
  primary_variant_id,
  name,
  categories,
  selling_price,
  regular_price,
  cost_price,
  badge,
  total_stock,
  rating,
  images,
}: ProductCardProps) {
  const { user } = useUserStore();
  const { addToCart, isLoading: cartLoading } = useCart();
  const {
    toggleWishlist,
    isInWishlist,
    isLoading: wishlistLoading,
  } = useWishlist();
  const isWishlisted = isInWishlist(id);
  const imageUrl = getImageUrl(images);
  const categoryName = getCategoryName(categories);
  const price = formatPrice(selling_price);
  const safeRating = typeof rating === "number" ? rating : 0;
  const safeStock =
    typeof total_stock === "string" ? parseInt(total_stock) : total_stock || 0;
  const { showToast } = useToastStore();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      showToast("Please login to add items to cart", "error");
      router.push("/account/login");
      return;
    }

    try {
      await addToCart(
        {
          id: id,
          primary_variant_id: primary_variant_id,
          name: name,
          price: Number(selling_price) || 0,
          image: imageUrl,
          quantity: 1,
        },
        user.id,
      );
      showToast("Added to cart 🛒", "success");
    } catch (error) {
      showToast("Failed to add to cart", "error");
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      showToast("Please login to manage wishlist", "error");
      router.push("/account/login");
      return;
    }

    try {
      const added = await toggleWishlist(
        {
          id: id,
          primary_variant_id: primary_variant_id,
          name: name,
          price: Number(selling_price) || 0,
          image: imageUrl,
          stock: safeStock,
        },
        user.id,
      );
      showToast(`${added ? "Added" : "Removed"} to wishlist ❤️`, "success");
    } catch (error) {
      showToast("Failed to update wishlist", "error");
    }
  };

  const handleQuickView = () => {
    // You can implement a quick view modal here
    showToast("Quick view feature coming soon!", "info");
  };

  return (
    <div
      className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge */}
      {badge && (
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2 py-1 bg-primary text-white text-xs font-semibold rounded-full">
            {badge}
          </span>
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Link href={`/product/${id}`}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-cover transition-transform duration-500 ${
                isHovered ? "scale-110" : "scale-100"
              }`}
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/400";
              }}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <ImageOff className="w-12 h-12 mb-2" />
              <p className="text-sm">No Image</p>
            </div>
          )}
        </Link>

        {/* Quick Actions Overlay */}
        <div
          className={`absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center gap-3 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-transform transform hover:scale-110 disabled:opacity-50"
          >
            <Heart
              className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-700"}`}
            />
          </button>

          {safeStock > 0 && (
            <button
              onClick={handleAddToCart}
              disabled={cartLoading}
              className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-transform transform hover:scale-110 disabled:opacity-50"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
            </button>
          )}

          <button
            onClick={handleQuickView}
            className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-transform transform hover:scale-110"
          >
            <Eye className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Stock Indicator */}
        {safeStock <= 10 && safeStock > 0 && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-500"
                style={{ width: `${(safeStock / 10) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">Only {safeStock} left</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          {categoryName}
        </p>

        {/* Title */}
        <Link href={`/product/${id}`}>
          <h3 className="font-medium text-gray-900 line-clamp-1 mb-2 hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        {safeRating > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(safeRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">
              ({safeRating.toFixed(1)})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-gray-900">৳{price}</span>
            {regular_price && (
              <span className="text-sm text-gray-400 line-through ml-2">
                ৳{formatPrice(regular_price)}
              </span>
            )}
          </div>

          {/* Add to Cart Button (always visible on mobile) */}
          <button
            onClick={handleAddToCart}
            disabled={cartLoading || safeStock === 0}
            className={`p-2 rounded-full transition-all duration-200 ${
              safeStock > 0
                ? "bg-primary text-white hover:bg-primary/90"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            } ${isHovered ? "scale-110" : "scale-100"} md:hidden lg:block`}
          >
            {cartLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : safeStock > 0 ? (
              <Plus className="w-5 h-5" />
            ) : (
              <span className="text-xs">Sold Out</span>
            )}
          </button>
        </div>

        {/* Stock Status */}
        {safeStock === 0 && (
          <div className="mt-3 p-2 bg-red-50 rounded-lg">
            <p className="text-xs text-red-600 text-center font-medium">
              Out of Stock
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
