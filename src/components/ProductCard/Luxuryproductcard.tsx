// app/components/ProductCard/LuxuryProductCard.tsx
"use client";

import Image from "next/image";
import { Heart, ShoppingCart, Star, ImageOff, Award } from "lucide-react";
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
 * Luxury Product Card - Premium, elegant design
 * Gold accents, sophisticated animations, high-end aesthetic
 */
export function LuxuryProductCard({
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
      className="group block h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <article className="relative h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl overflow-hidden transition-all duration-700 hover:shadow-2xl hover:shadow-amber-500/20 border border-amber-500/20 hover:border-amber-500/40">
        {/* Decorative Corner Accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-tr-full pointer-events-none" />

        {/* Image Section */}
        <div className="relative aspect-[3/4] overflow-hidden">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 pointer-events-none" />

          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={`object-cover transition-all duration-700 ${
                isHovered
                  ? "scale-110 brightness-110"
                  : "scale-100 brightness-100"
              }`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  "https://placehold.co/600x800/1e293b/d97706?text=Luxury+Product";
              }}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
              <ImageOff
                className="w-16 h-16 text-amber-500/30 mb-3"
                strokeWidth={1}
              />
              <p className="text-sm text-amber-500/50 font-light">No Image</p>
            </div>
          )}

          {/* Premium Badge */}
          {badge && (
            <div className="absolute top-4 left-4 z-20">
              <div className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center gap-1.5 shadow-lg shadow-amber-500/50">
                <Award
                  className="w-3.5 h-3.5 text-slate-900"
                  strokeWidth={2.5}
                />
                <span className="text-xs font-bold text-slate-900 tracking-wide">
                  {badge}
                </span>
              </div>
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            className={`absolute top-4 right-4 z-20 p-2.5 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 ${
              isWishlisted
                ? "bg-amber-500 shadow-lg shadow-amber-500/50"
                : "bg-white/10 hover:bg-white/20"
            }`}
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            <Heart
              className={`w-5 h-5 ${
                isWishlisted ? "fill-white text-white" : "text-white"
              }`}
              strokeWidth={2}
            />
          </button>

          {/* Exclusive Stock Badge */}
          {safeStock > 0 && safeStock <= 5 && (
            <div className="absolute bottom-4 left-4 right-4 z-20">
              <div className="bg-slate-900/90 backdrop-blur-sm border border-amber-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-amber-400">
                    Exclusive Stock
                  </span>
                  <span className="text-xs font-bold text-white">
                    {safeStock} remaining
                  </span>
                </div>
                <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"
                    style={{ width: `${(safeStock / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="relative p-5 sm:p-6 z-10">
          {/* Category with Gold Underline */}
          <div className="mb-3">
            <p className="text-xs text-amber-400 uppercase tracking-[0.2em] font-medium mb-1">
              {categoryName}
            </p>
            <div className="w-12 h-px bg-gradient-to-r from-amber-500 to-transparent" />
          </div>

          {/* Product Name */}
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3 line-clamp-2 leading-tight">
            {name}
          </h3>

          {/* Rating with Gold Stars */}
          {safeRating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(safeRating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-slate-700 text-slate-700"
                    }`}
                    strokeWidth={0}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-amber-400">
                {safeRating.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400">Excellent</span>
            </div>
          )}

          {/* Price Section */}
          <div className="mb-5">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                ৳{price}
              </span>
              {oldPrice && (
                <span className="text-lg text-slate-500 line-through font-light">
                  ৳{oldPrice}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-light">
              Tax included • Free luxury packaging
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {safeStock > 0 ? (
              <>
                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-900 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 active:scale-95"
                >
                  {cartLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" strokeWidth={2.5} />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="flex-1 py-3.5 bg-slate-700/50 text-slate-400 rounded-xl font-semibold text-sm text-center border border-slate-600">
                Currently Unavailable
              </div>
            )}
          </div>

          {/* Luxury Features */}
          <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              Authentic
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              Warranty
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              Premium
            </span>
          </div>
        </div>

        {/* Animated Border Glow on Hover */}
        <div
          className={`absolute inset-0 border-2 border-transparent rounded-3xl transition-all duration-700 pointer-events-none ${
            isHovered ? "shadow-[inset_0_0_30px_rgba(245,158,11,0.2)]" : ""
          }`}
        />
      </article>
    </Link>
  );
}
