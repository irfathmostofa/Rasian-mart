// app/components/ProductCard/CompactProductCard.tsx
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
import { useState } from "react";

export function CompactProductCard({
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
          id: id,
          primary_variant_id: primary_variant_id,
          name: name,
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
    <Link
      href={`/product/${id}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 h-full flex flex-col">
        {/* Badge and Wishlist */}
        <div className="absolute top-2 left-2 right-2 z-10 flex justify-between">
          <div className="flex flex-col gap-1">
            {badge && (
              <span className="px-2 py-1 bg-primary text-white text-xs font-semibold rounded-full inline-flex w-fit">
                {badge}
              </span>
            )}
            {discount > 0 && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full inline-flex w-fit">
                {discount}% OFF
              </span>
            )}
          </div>

          <button
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            className={`p-1.5 rounded-full shadow-sm transition-all ${isWishlisted ? "bg-red-50 text-red-500" : "bg-white/90 text-gray-500 hover:text-red-500"} disabled:opacity-50`}
          >
            <Heart
              className={`w-4 h-4 ${isWishlisted ? "fill-red-500" : ""}`}
            />
          </button>
        </div>

        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-50 flex-shrink-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  "https://placehold.co/400x400/e5e7eb/6b7280?text=No+Image";
              }}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <ImageOff className="w-8 h-8 mb-2" />
              <p className="text-xs">No Image</p>
            </div>
          )}

          {/* Add to Cart Button - Mobile Only */}
          {safeStock > 0 && (
            <button
              onClick={handleAddToCart}
              disabled={cartLoading}
              className="md:hidden absolute bottom-2 right-2 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-transform hover:scale-105 disabled:opacity-50"
            >
              {cartLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-3 flex-grow flex flex-col">
          {/* Category */}
          <p className="text-xs text-gray-500 truncate mb-1">{categoryName}</p>

          {/* Title */}
          <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 text-sm leading-tight hover:text-primary transition-colors">
            {name}
          </h3>

          {/* Rating */}
          {safeRating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${star <= Math.floor(safeRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-1">
                ({safeRating.toFixed(1)})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="mt-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold text-gray-900">৳{price}</span>
              {oldPrice && (
                <span className="text-sm text-gray-400 line-through">
                  ৳{oldPrice}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center justify-between">
              <p
                className={`text-xs font-medium ${safeStock > 10 ? "text-green-600" : safeStock > 0 ? "text-amber-600" : "text-red-600"}`}
              >
                {safeStock > 10
                  ? "In Stock"
                  : safeStock > 0
                    ? `${safeStock} left`
                    : "Out of Stock"}
              </p>

              {/* Add to Cart - Desktop */}
              {safeStock > 0 && (
                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  className="hidden md:flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {cartLoading ? (
                    <>
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-3 h-3" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Buy Now Button - Only on hover */}
        {safeStock > 0 && (
          <div
            className={`px-3 pb-3 transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}
          >
            <button
              onClick={handleQuickBuy}
              disabled={cartLoading}
              className="w-full py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>
        )}
      </div>
    </Link>
  );
}
