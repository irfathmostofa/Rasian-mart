// app/components/ProductCard/ElegantProductCard.tsx
"use client";

import Image from "next/image";
import { Heart, ShoppingCart, Star, ImageOff, Sparkles } from "lucide-react";
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
 * Elegant Product Card - Refined minimal design with sophisticated interactions
 * Mobile-first responsive design with smooth animations
 */
export function ElegantProductCard({
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
  const [imageLoaded, setImageLoaded] = useState(false);

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
      showToast("Added to cart", "success");
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
        added ? "Added to wishlist" : "Removed from wishlist",
        "success",
      );
    } catch (error) {
      showToast("Failed to update wishlist", "error");
    }
  };

  return (
    <Link href={`/product/${id}`} className="group block h-full">
      <article className="relative h-full bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-gray-200/50 border border-gray-100">
        {/* Image Section */}
        <div className="relative aspect-[3/4] sm:aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt={name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className={`object-cover transition-all duration-700 ${
                  imageLoaded ? "scale-100 opacity-100" : "scale-95 opacity-0"
                } group-hover:scale-105`}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://placehold.co/600x800/f3f4f6/9ca3af?text=No+Image";
                }}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 to-gray-300" />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <ImageOff
                className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-2"
                strokeWidth={1.5}
              />
              <p className="text-sm text-gray-400 font-light">No Image</p>
            </div>
          )}

          {/* Badges */}
          {(badge || discount > 0) && (
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-2 z-10">
              {badge && (
                <span className="px-3 py-1 bg-black/90 backdrop-blur-sm text-white text-xs font-medium tracking-wide rounded-full">
                  {badge}
                </span>
              )}
              {discount > 0 && (
                <span className="px-3 py-1 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                  -{discount}%
                </span>
              )}
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2.5 sm:p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50"
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            <Heart
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
              strokeWidth={2}
            />
          </button>

          {/* Stock Indicator */}
          {safeStock <= 10 && safeStock > 0 && (
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg p-2.5 shadow-lg">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-amber-600">
                    Almost gone
                  </span>
                  <span className="text-xs font-bold text-gray-900">
                    {safeStock} left
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-red-500 rounded-full transition-all duration-500"
                    style={{ width: `${100 - (safeStock / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-5">
          {/* Category */}
          <p className="text-xs sm:text-sm text-gray-500 font-light tracking-wider mb-2">
            {categoryName}
          </p>

          {/* Product Name */}
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-gray-700 transition-colors">
            {name}
          </h3>

          {/* Rating */}
          {safeRating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                      i < Math.floor(safeRating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                    strokeWidth={0}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {safeRating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Price Section */}
          <div className="mb-4">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                ৳{price}
              </span>
              {oldPrice && (
                <span className="text-base sm:text-lg text-gray-400 line-through font-light">
                  ৳{oldPrice}
                </span>
              )}
            </div>
            {discount > 0 && (
              <p className="text-sm text-green-600 font-medium">
                You save ৳
                {(parseFloat(oldPrice || "0") - parseFloat(price)).toFixed(2)}
              </p>
            )}
          </div>

          {/* Action Button */}
          {safeStock > 0 ? (
            <button
              onClick={handleAddToCart}
              disabled={cartLoading}
              className="w-full py-3 sm:py-3.5 bg-gray-900 text-white rounded-xl font-medium text-sm sm:text-base hover:bg-gray-800 active:bg-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl group/btn"
            >
              {cartLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover/btn:scale-110" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          ) : (
            <div className="w-full py-3 sm:py-3.5 bg-gray-100 text-gray-500 rounded-xl font-medium text-sm sm:text-base text-center">
              Out of Stock
            </div>
          )}
        </div>

        {/* Hover Border Effect */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-gray-900/10 rounded-2xl pointer-events-none transition-colors duration-500" />
      </article>
    </Link>
  );
}
