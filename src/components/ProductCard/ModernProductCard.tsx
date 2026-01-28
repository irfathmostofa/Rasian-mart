// app/components/ProductCard/ModernProductCard.tsx
"use client";

import Image from "next/image";
import {
  Heart,
  ShoppingCart,
  Star,
  ImageOff,
  Zap,
  Shield,
  Truck,
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

export function ModernProductCard({
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

  const handleQuickBuy = async () => {
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
      showToast("Added to cart 🛒", "success");
      router.push("/checkout");
    } catch (error) {
      showToast("Failed to add to cart", "error");
    }
  };

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge and Discount */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {badge && (
          <span className="px-3 py-1 bg-black text-white text-xs font-bold rounded-full shadow-lg">
            {badge}
          </span>
        )}
        {discount > 0 && (
          <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
            {discount}% OFF
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleToggleWishlist}
        disabled={wishlistLoading}
        className={`absolute top-4 right-4 z-10 p-2 rounded-full shadow-lg transition-all duration-300 ${
          isWishlisted
            ? "bg-red-500 text-white"
            : "bg-white/80 backdrop-blur-sm hover:bg-white"
        } ${isHovered ? "scale-110" : "scale-100"} disabled:opacity-50`}
      >
        <Heart className={`w-5 h-5 ${isWishlisted ? "fill-white" : ""}`} />
      </button>

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/product/${id}`} className="block h-full">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-cover transition-all duration-700 ${
                isHovered
                  ? "scale-105 brightness-110"
                  : "scale-100 brightness-100"
              }`}
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/400";
              }}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <ImageOff className="w-16 h-16 text-gray-400 mb-3" />
              <p className="text-gray-500 font-medium">No Image Available</p>
            </div>
          )}
        </Link>

        {/* Quick Actions Overlay */}
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 transition-all duration-500 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={cartLoading || safeStock === 0}
              className="flex-1 bg-white text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {cartLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </>
              )}
            </button>

            <button
              onClick={handleQuickBuy}
              disabled={cartLoading || safeStock === 0}
              className="flex-1 bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Buy Now
            </button>
          </div>
        </div>

        {/* Stock Indicator */}
        {safeStock < 20 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
              <p className="text-xs font-semibold text-gray-900">
                {safeStock > 0 ? `${safeStock} left in stock` : "Sold Out"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">
          {categoryName}
        </p>

        {/* Title */}
        <Link href={`/product/${id}`}>
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-3 hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>

        {/* Rating and Reviews */}
        {safeRating > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
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
              <span className="text-sm font-semibold text-gray-900">
                {safeRating.toFixed(1)}
              </span>
            </div>
            <span className="text-sm text-gray-500">•</span>
            <span className="text-sm text-gray-500">123 reviews</span>
          </div>
        )}

        {/* Price Section */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold text-gray-900">৳{price}</span>
            {oldPrice && (
              <span className="text-lg text-gray-400 line-through">
                ৳{oldPrice}
              </span>
            )}
          </div>
          {discount > 0 && (
            <p className="text-sm text-green-600 font-semibold">
              Save ৳
              {(parseFloat(oldPrice || "0") - parseFloat(price)).toFixed(2)}
            </p>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Shield className="w-4 h-4 text-green-500" />
            <span>1 Year Warranty</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Truck className="w-4 h-4 text-blue-500" />
            <span>Free Delivery</span>
          </div>
        </div>

        {/* Stock Progress Bar */}
        {safeStock > 0 && safeStock <= 20 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Selling fast!</span>
              <span>{safeStock} left</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-1000"
                style={{ width: `${100 - (safeStock / 20) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* View Details Button */}
        <Link
          href={`/product/${id}`}
          className="block w-full text-center border-2 border-gray-300 text-gray-700 py-2 rounded-xl font-semibold hover:border-primary hover:bg-primary/5 hover:text-primary transition-all duration-300"
        >
          View Details
        </Link>
      </div>

      {/* Hover Effect Border */}
      <div
        className={`absolute inset-0 border-2 border-primary rounded-2xl transition-all duration-500 pointer-events-none ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
