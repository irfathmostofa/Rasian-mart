// app/components/ProductCard/VibrantProductCard.tsx
"use client";

import Image from "next/image";
import {
  Heart,
  ShoppingCart,
  Star,
  ImageOff,
  Zap,
  TrendingUp,
} from "lucide-react";
import { ProductCardProps } from "@/types/ProductCard";
import { formatPrice, getCategoryName, getImageUrl } from "@/components/helper";
import Link from "next/link";
import { useCart } from "@/app/store/useCart";
import { useWishlist } from "@/app/store/useWishlist";
import { useToastStore } from "@/app/store/useToastStore";
import { useUserStore } from "@/app/store/useUserStore";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Vibrant Product Card - Bold, energetic design with vibrant colors
 * Optimized for engagement and conversion
 */
export function VibrantProductCard({
  id,
  primary_variant_id,
  name,
  categories,
  selling_price,
  regular_price,
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
  const oldPrice = regular_price ? formatPrice(regular_price) : undefined;
  const discount = oldPrice
    ? Math.round(
        ((parseFloat(oldPrice) - parseFloat(price)) / parseFloat(oldPrice)) *
          100,
      )
    : 0;
  const safeRating = typeof rating === "number" ? rating : 0;
  const safeStock =
    typeof total_stock === "string" ? parseInt(total_stock) : total_stock || 0;
  const { showToast } = useToastStore();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast("Please login to add items to cart", "error");
      router.push("/account/login");
      return;
    }

    try {
      await addToCart(
        {
          id,
          primary_variant_id,
          name,
          price: Number(selling_price) || 0,
          image: imageUrl,
          quantity: 1,
        },
        user.id,
      );
      showToast("Added to cart 🎉", "success");
    } catch (error) {
      showToast("Failed to add to cart", "error");
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast("Please login to manage wishlist", "error");
      router.push("/account/login");
      return;
    }

    try {
      const added = await toggleWishlist(
        {
          id,
          primary_variant_id,
          name,
          price: Number(selling_price) || 0,
          image: imageUrl,
          stock: safeStock,
        },
        user.id,
      );
      showToast(
        added ? "Added to wishlist 💖" : "Removed from wishlist",
        "success",
      );
    } catch (error) {
      showToast("Failed to update wishlist", "error");
    }
  };

  const handleQuickBuy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast("Please login to buy products", "error");
      router.push("/account/login");
      return;
    }

    try {
      await addToCart(
        {
          id,
          primary_variant_id,
          name,
          price: Number(selling_price) || 0,
          image: imageUrl,
          quantity: 1,
        },
        user.id,
      );
      router.push("/checkout");
    } catch (error) {
      showToast("Failed to add to cart", "error");
    }
  };

  return (
    <article
      className="group relative h-full bg-gradient-to-br from-white to-gray-50 rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 border-2 border-transparent hover:border-violet-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-transparent to-cyan-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <Link href={`/product/${id}`} className="block h-full relative">
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-violet-100 to-cyan-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={`object-cover transition-all duration-700 ${
                isHovered ? "scale-110 rotate-1" : "scale-100 rotate-0"
              }`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  "https://placehold.co/600/a78bfa/ffffff?text=No+Image";
              }}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <ImageOff
                className="w-16 h-16 sm:w-20 sm:h-20 text-violet-300 mb-3"
                strokeWidth={1.5}
              />
              <p className="text-sm text-violet-400 font-medium">
                No Image Available
              </p>
            </div>
          )}

          {/* Top Badges */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-wrap gap-2 z-10 max-w-[calc(100%-6rem)]">
            {badge && (
              <span className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
                <Zap className="w-3 h-3 fill-white" />
                {badge}
              </span>
            )}
            {discount > 0 && (
              <span className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
                🔥 {discount}% OFF
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            className={`absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2.5 sm:p-3 rounded-full shadow-xl transition-all duration-300 hover:scale-125 active:scale-95 disabled:opacity-50 ${
              isWishlisted
                ? "bg-gradient-to-br from-pink-500 to-red-500"
                : "bg-white/95 backdrop-blur-sm hover:bg-white"
            }`}
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            <Heart
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-all ${
                isWishlisted
                  ? "fill-white text-white scale-110"
                  : "text-gray-700"
              }`}
              strokeWidth={2.5}
            />
          </button>

          {/* Quick Actions Overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-center p-4 sm:p-6 transition-all duration-500 ${
              isHovered
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <div className="w-full flex gap-2 sm:gap-3">
              <button
                onClick={handleAddToCart}
                disabled={cartLoading || safeStock === 0}
                className="flex-1 py-2.5 sm:py-3 bg-white/95 backdrop-blur-sm text-gray-900 rounded-xl font-bold text-sm sm:text-base hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Add Cart</span>
              </button>
              <button
                onClick={handleQuickBuy}
                disabled={cartLoading || safeStock === 0}
                className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold text-sm sm:text-base hover:from-violet-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          {/* Low Stock Alert */}
          {safeStock > 0 && safeStock <= 15 && (
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center justify-between text-xs sm:text-sm font-bold">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  Selling Fast!
                </span>
                <span>{safeStock} left</span>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-5 relative">
          {/* Category */}
          <div className="inline-block px-3 py-1 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full mb-3">
            {categoryName}
          </div>

          {/* Product Name */}
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-snug group-hover:text-violet-600 transition-colors">
            {name}
          </h3>

          {/* Rating */}
          {safeRating > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(safeRating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                    strokeWidth={0}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-900">
                {safeRating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-400">• 2.4k reviews</span>
            </div>
          )}

          {/* Price Section */}
          <div className="mb-4">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                ৳{price}
              </span>
              {oldPrice && (
                <span className="text-base sm:text-lg text-gray-400 line-through font-medium">
                  ৳{oldPrice}
                </span>
              )}
            </div>
            {discount > 0 && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-xs sm:text-sm text-green-700 font-bold">
                  Save ৳
                  {(parseFloat(oldPrice || "0") - parseFloat(price)).toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Stock Status */}
          {safeStock > 0 ? (
            <div className="text-xs sm:text-sm font-semibold text-green-600 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              In Stock ({safeStock} available)
            </div>
          ) : (
            <div className="text-xs sm:text-sm font-semibold text-red-600 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              Out of Stock
            </div>
          )}

          {/* Mobile Add to Cart */}
          {safeStock > 0 && (
            <button
              onClick={handleAddToCart}
              disabled={cartLoading}
              className="sm:hidden w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold text-base hover:from-violet-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
            >
              {cartLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          )}
        </div>
      </Link>

      {/* Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
    </article>
  );
}
