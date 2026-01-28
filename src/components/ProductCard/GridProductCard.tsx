// app/components/ProductCard/GridProductCard.tsx
"use client";

import Image from "next/image";
import {
  Heart,
  ShoppingCart,
  Star,
  ImageOff,
  ChevronRight,
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

export function GridProductCard({
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
          id: id,
          primary_variant_id: primary_variant_id,
          name: name,
          price: Number(selling_price) || 0,
          image: imageUrl,
          stock: safeStock,
        },
        user.id,
      );
      showToast(
        `${added ? "Added to" : "Removed from"} wishlist`,
        added ? "success" : "info",
      );
    } catch (error) {
      showToast("Failed to update wishlist", "error");
    }
  };

  return (
    <div
      className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${id}`} className="block h-full">
        <div className="flex flex-col md:flex-row h-full">
          {/* Image Container */}
          <div className="relative md:w-2/5 h-48 md:h-auto overflow-hidden bg-gray-50 flex-shrink-0">
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
              {badge && (
                <span className="px-2 py-1 bg-primary text-white text-xs font-bold rounded">
                  {badge}
                </span>
              )}
              {discount > 0 && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                  {discount}% OFF
                </span>
              )}
            </div>

            <button
              onClick={handleToggleWishlist}
              disabled={wishlistLoading}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/90 shadow-sm hover:bg-white transition-colors disabled:opacity-50"
            >
              <Heart
                className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`}
              />
            </button>

            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://placehold.co/600x400/e5e7eb/6b7280?text=No+Image";
                }}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <ImageOff className="w-12 h-12 mb-2" />
                <p className="text-sm">No Image</p>
              </div>
            )}

            {/* Quick Actions - Mobile */}
            {safeStock > 0 && (
              <button
                onClick={handleAddToCart}
                disabled={cartLoading}
                className="md:hidden absolute bottom-3 right-3 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-transform hover:scale-105 disabled:opacity-50"
              >
                {cartLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {/* Content Container */}
          <div className="flex-grow p-4 flex flex-col justify-between">
            <div>
              {/* Category */}
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                {categoryName}
              </p>

              {/* Title */}
              <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                {name}
              </h3>

              {/* Rating */}
              {safeRating > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${star <= Math.floor(safeRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-900 ml-1">
                      {safeRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">• 24 reviews</span>
                </div>
              )}

              {/* Price */}
              <div className="mb-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ৳{price}
                  </span>
                  {oldPrice && (
                    <span className="text-lg text-gray-400 line-through">
                      ৳{oldPrice}
                    </span>
                  )}
                </div>
                {discount > 0 && (
                  <p className="text-sm text-green-600 font-medium mt-1">
                    Save ৳
                    {(parseFloat(oldPrice || "0") - parseFloat(price)).toFixed(
                      2,
                    )}
                  </p>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-medium ${safeStock > 20 ? "text-green-600" : safeStock > 0 ? "text-amber-600" : "text-red-600"}`}
                  >
                    {safeStock > 20
                      ? "In Stock"
                      : safeStock > 0
                        ? `${safeStock} left in stock`
                        : "Out of Stock"}
                  </span>
                  {safeStock > 0 && safeStock <= 20 && (
                    <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-amber-500"
                        style={{ width: `${100 - (safeStock / 20) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Link
                href={`/product/${id}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:border-primary hover:bg-primary/5 hover:text-primary transition-all duration-200 group/link"
              >
                View Details
                <ChevronRight className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" />
              </Link>

              {safeStock > 0 && (
                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {cartLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Buy Now Overlay - Desktop Only */}
        {safeStock > 0 && (
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
              isHovered
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (user) {
                handleAddToCart(e);
                router.push("/checkout");
              } else {
                showToast("Please login to buy products", "error");
                router.push("/account/login");
              }
            }}
          >
            <button
              disabled={cartLoading}
              className="px-8 py-3 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-50"
            >
              {cartLoading ? "Processing..." : "Buy Now"}
            </button>
          </div>
        )}
      </Link>
    </div>
  );
}
