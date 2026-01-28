// app/components/ProductCard/HorizontalProductCard.tsx
"use client";

import Image from "next/image";
import { Heart, ShoppingCart, Star, ImageOff, ArrowRight } from "lucide-react";
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
 * Horizontal Product Card - Optimized for list views
 * Perfect for mobile-first browsing with horizontal layout
 */
export function HorizontalProductCard({
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
  const [isPressed, setIsPressed] = useState(false);

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
    <Link
      href={`/product/${id}`}
      className="block"
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
    >
      <article
        className={`relative bg-white rounded-2xl overflow-hidden transition-all duration-300 border border-gray-200 hover:shadow-lg active:scale-[0.98] ${
          isPressed ? "shadow-lg scale-[0.98]" : ""
        }`}
      >
        <div className="flex gap-3 sm:gap-4 p-3 sm:p-4">
          {/* Image Section */}
          <div className="relative flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                fill
                sizes="(max-width: 640px) 96px, 128px"
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://placehold.co/200/e5e7eb/9ca3af?text=No+Image";
                }}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <ImageOff className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
              </div>
            )}

            {/* Badge */}
            {badge && (
              <div className="absolute top-1.5 left-1.5">
                <span className="px-2 py-0.5 bg-black/90 text-white text-[10px] sm:text-xs font-bold rounded">
                  {badge}
                </span>
              </div>
            )}

            {/* Discount Badge */}
            {discount > 0 && (
              <div className="absolute top-1.5 right-1.5">
                <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">
                  -{discount}%
                </span>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              {/* Category */}
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate">
                {categoryName}
              </p>

              {/* Product Name */}
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1.5 line-clamp-2 leading-tight">
                {name}
              </h3>

              {/* Rating */}
              {safeRating > 0 && (
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(safeRating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-gray-200 text-gray-200"
                        }`}
                        strokeWidth={0}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    {safeRating.toFixed(1)}
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-lg sm:text-xl font-bold text-gray-900">
                  ৳{price}
                </span>
                {oldPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    ৳{oldPrice}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-1.5">
                {safeStock > 0 ? (
                  <>
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-xs font-medium text-green-600">
                      {safeStock <= 10 ? `Only ${safeStock} left` : "In Stock"}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    <span className="text-xs font-medium text-red-600">
                      Out of Stock
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions Column */}
          <div className="flex flex-col justify-between items-end gap-2">
            {/* Wishlist */}
            <button
              onClick={handleToggleWishlist}
              disabled={wishlistLoading}
              className={`p-2 rounded-full transition-all hover:scale-110 active:scale-95 disabled:opacity-50 ${
                isWishlisted
                  ? "bg-red-50 text-red-500"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              <Heart
                className={`w-4 h-4 ${isWishlisted ? "fill-red-500" : ""}`}
                strokeWidth={2}
              />
            </button>

            {/* Add to Cart Button */}
            {safeStock > 0 && (
              <button
                onClick={handleAddToCart}
                disabled={cartLoading}
                className="p-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 active:bg-black transition-all hover:scale-110 active:scale-95 disabled:opacity-50 shadow-md"
                aria-label="Add to cart"
              >
                {cartLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ShoppingCart className="w-4 h-4" strokeWidth={2} />
                )}
              </button>
            )}

            {/* View Details Arrow */}
            <div className="mt-auto">
              <ArrowRight className="w-5 h-5 text-gray-400" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Stock Progress Bar for Low Stock */}
        {safeStock > 0 && safeStock <= 10 && (
          <div className="px-3 pb-3 sm:px-4 sm:pb-4">
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-500"
                style={{ width: `${100 - (safeStock / 10) * 100}%` }}
              />
            </div>
          </div>
        )}
      </article>
    </Link>
  );
}
