// app/components/ProductCard/DenseProductCard.tsx
"use client";

import Image from "next/image";
import { Heart, ShoppingCart, Star, ImageOff } from "lucide-react";
import { ProductCardProps } from "@/types/ProductCard";
import { formatPrice, getCategoryName, getImageUrl } from "@/components/helper";
import Link from "next/link";
import { useCart } from "@/app/store/useCart";
import { useWishlist } from "@/app/store/useWishlist";
import { useToastStore } from "@/app/store/useToastStore";
import { useUserStore } from "@/app/store/useUserStore";
import { useRouter } from "next/navigation";

/**
 * Dense Product Card - Compact design for displaying many products
 * Space-efficient with essential information only
 */
export function DenseProductCard({
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
      <article className="relative h-full bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md border border-gray-200 hover:border-gray-300">
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  "https://placehold.co/400/f3f4f6/9ca3af?text=No+Image";
              }}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <ImageOff
                className="w-10 h-10 text-gray-300 mb-1"
                strokeWidth={1.5}
              />
              <p className="text-xs text-gray-400">No Image</p>
            </div>
          )}

          {/* Compact Badges */}
          {(badge || discount > 0) && (
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {badge && (
                <span className="px-2 py-0.5 bg-black text-white text-[10px] font-semibold rounded">
                  {badge}
                </span>
              )}
              {discount > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">
                  -{discount}%
                </span>
              )}
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            className="absolute top-2 right-2 p-1.5 bg-white/95 rounded-full shadow-md hover:shadow-lg transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
              strokeWidth={2}
            />
          </button>

          {/* Add to Cart - Hover */}
          {safeStock > 0 && (
            <button
              onClick={handleAddToCart}
              disabled={cartLoading}
              className="absolute bottom-2 right-2 p-1.5 bg-gray-900 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
              aria-label="Add to cart"
            >
              {cartLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ShoppingCart className="w-3.5 h-3.5" strokeWidth={2} />
              )}
            </button>
          )}
        </div>

        {/* Content Section */}
        <div className="p-2.5 sm:p-3">
          {/* Category */}
          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1 truncate">
            {categoryName}
          </p>

          {/* Product Name */}
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 leading-tight mb-2 min-h-[2.5rem] sm:min-h-[2.8rem] group-hover:text-gray-700 transition-colors">
            {name}
          </h3>

          {/* Rating */}
          {safeRating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-2.5 h-2.5 ${
                      i < Math.floor(safeRating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                    strokeWidth={0}
                  />
                ))}
              </div>
              <span className="text-[10px] font-medium text-gray-600">
                {safeRating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Price Section */}
          <div className="mb-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-gray-900">
                ৳{price}
              </span>
              {oldPrice && (
                <span className="text-xs text-gray-400 line-through">
                  ৳{oldPrice}
                </span>
              )}
            </div>
          </div>

          {/* Stock & Action */}
          <div className="flex items-center justify-between gap-2">
            {/* Stock Status */}
            {safeStock > 0 ? (
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span className="text-[10px] font-medium text-green-600">
                  {safeStock <= 10 ? `${safeStock} left` : "In Stock"}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                <span className="text-[10px] font-medium text-red-600">
                  Out
                </span>
              </div>
            )}

            {/* Mobile Add to Cart */}
            {safeStock > 0 && (
              <button
                onClick={handleAddToCart}
                disabled={cartLoading}
                className="sm:hidden p-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50"
                aria-label="Add to cart"
              >
                {cartLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ShoppingCart className="w-3.5 h-3.5" strokeWidth={2} />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Low Stock Indicator */}
        {safeStock > 0 && safeStock <= 5 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-red-500" />
        )}
      </article>
    </Link>
  );
}
