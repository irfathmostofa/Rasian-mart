// components/ProductCard/DetailedProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  Heart,
  ShoppingCart,
  Star,
  ImageOff,
  Package,
  Zap,
  Check,
  Barcode,
  Truck,
  Eye,
  GitCompare,
  Share2,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { CardConfig, ProductCardProps } from "@/types/ProductCard";
import { formatPrice, getImageUrl, getCategoryName } from "@/components/helper";
import { useCart } from "@/app/store/useCart";
import { useWishlist } from "@/app/store/useWishlist";
import { useToastStore } from "@/app/store/useToastStore";
import { useUserStore } from "@/app/store/useUserStore";
import { ASPECT, deriveCardValues, buildWhatsAppUrl } from "./Shared";

export function DetailedProductCard(
  props: ProductCardProps & { cfg: CardConfig; onQuickView?: () => void },
) {
  const {
    cfg,
    slug,
    name,
    selling_price,
    regular_price,
    images,
    categories,
    code,
    id,
    primary_variant_id,
    badge,
    badgeIcon,
    badgeColor,
    total_stock,
    rating,
    onQuickView,
  } = props;

  const [imageError, setImageError] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const { user } = useUserStore();
  const { addToCart, isLoading: cartLoading } = useCart();
  const {
    toggleWishlist,
    isInWishlist,
    isLoading: wishlistLoading,
  } = useWishlist();
  const { showToast } = useToastStore();

  const imageUrl = !imageError ? getImageUrl(images) : null;
  const categoryName = getCategoryName(categories);
  const sku = code ?? `${id}`;
  const isWishlisted = isInWishlist(id);
  const {
    sellingPrice,
    regularPrice,
    safeRating,
    safeStock,
    isOutOfStock,
    hasDiscount,
    discountPct,
    isLowStock,
    displayBadge,
  } = deriveCardValues(props, cfg);
  const aspectClass = ASPECT[cfg.image_aspect_ratio] ?? ASPECT.portrait;

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const requireAuth = (action: string) => {
    if (!user) {
      showToast(`Please login to ${action}`, "error");
      router.push("/account/login");
      return false;
    }
    return true;
  };

  const handleAddToCart = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!requireAuth("add items to cart")) return;
    try {
      await addToCart(
        {
          id,
          primary_variant_id,
          name,
          price: sellingPrice,
          image: imageUrl || "",
          quantity: 1,
          weight: "0",
        },
        user!.id,
      );
      setIsAddedToCart(true);
      showToast("Added to cart 🛒", "success");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setIsAddedToCart(false), 2000);
    } catch {
      showToast("Failed to add to cart", "error");
    }
  };

  const handleBuyNow = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!requireAuth("buy now")) return;
    try {
      await addToCart(
        {
          id,
          primary_variant_id,
          name,
          price: sellingPrice,
          image: imageUrl || "",
          quantity: 1,
          weight: "0",
        },
        user!.id,
      );
      router.push("/checkout");
    } catch {
      showToast("Failed to proceed", "error");
    }
  };

  const handleWishlist = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!requireAuth("manage wishlist")) return;
    try {
      const added = await toggleWishlist(
        {
          id,
          primary_variant_id,
          name,
          price: sellingPrice,
          image: imageUrl || "",
          slug,
          stock: safeStock,
        },
        user!.id,
      );
      showToast(
        added ? "Added to wishlist ❤️" : "Removed from wishlist",
        "success",
      );
    } catch {
      showToast("Failed to update wishlist", "error");
    }
  };

  return (
    <div className="group relative bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 flex flex-col h-full">
      {/* Image */}
      <div
        className={`relative ${aspectClass} shrink-0 bg-gray-50 overflow-hidden`}
      >
        <Link href={`/product/${slug}`} className="block absolute inset-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-1">
              <ImageOff className="w-8 h-8" />
              <p className="text-xs">No image</p>
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
          {displayBadge && (
            <span
              className="text-[9px] font-bold text-white px-2 py-0.5 rounded-full"
              style={{
                background: badgeColor ?? "var(--color-primary, #6366f1)",
              }}
            >
              {badgeIcon && <span className="mr-0.5">{badgeIcon}</span>}
              {displayBadge}
            </span>
          )}
          {cfg.show_sale_badge && hasDiscount && (
            <span className="text-[9px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
              SALE
            </span>
          )}
        </div>
        {cfg.show_discount_badge && hasDiscount && (
          <span className="absolute top-2 right-2 z-10 text-[10px] font-extrabold bg-red-500 text-white px-1.5 py-0.5 rounded-md">
            -{discountPct}%
          </span>
        )}
        {isOutOfStock && cfg.show_out_of_stock_badge && (
          <div className="absolute inset-0 bg-white/55 flex items-center justify-center z-20 pointer-events-none">
            <span className="text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {/* Hover quick actions */}
        <div
          className={`absolute inset-0 bg-black/10 flex items-center justify-center gap-2 z-10 transition-all duration-300 ${isOutOfStock ? "hidden" : "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"}`}
        >
          {cfg.show_wishlist && (
            <button
              onClick={handleWishlist}
              disabled={wishlistLoading}
              className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
            >
              <Heart
                className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`}
              />
            </button>
          )}
          {cfg.quick_view && onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView();
              }}
              className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform"
            >
              <Eye className="w-4 h-4 text-gray-600" />
            </button>
          )}
          {cfg.show_compare && (
            <button
              onClick={() => showToast("Compare coming soon!", "info")}
              className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform"
            >
              <GitCompare className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>

        {/* Low stock strip */}
        {isLowStock && cfg.show_stock && (
          <div className="absolute bottom-0 inset-x-0 bg-amber-500/90 flex items-center justify-center gap-1 py-1 pointer-events-none z-10">
            <Truck className="w-3 h-3 text-white" />
            <span className="text-[9px] font-semibold text-white">
              Only {safeStock} left!
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-3 gap-1.5">
        {cfg.show_category && categoryName && (
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-gray-400 truncate">
            {categoryName}
          </p>
        )}
        {cfg.show_title && (
          <Link href={`/product/${slug}`}>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 leading-snug hover:text-primary transition-colors">
              {name}
            </h3>
          </Link>
        )}
        {cfg.show_sku && (
          <p className="flex items-center gap-1 text-[9px] text-gray-400">
            <Barcode className="w-3 h-3" />
            {sku}
          </p>
        )}
        {cfg.show_rating && (
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${safeRating > 0 && i < Math.floor(safeRating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                />
              ))}
            </div>
            <span className="text-[9px] text-gray-400">
              {safeRating > 0 ? `${safeRating.toFixed(1)}` : "No reviews"}
            </span>
          </div>
        )}

        <div className="flex-1" />

        {cfg.show_price && (
          <div className="flex items-baseline gap-1.5 flex-wrap mt-1">
            <span className="text-base font-bold text-gray-900">
              ৳{formatPrice(selling_price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xs text-gray-400 line-through">
                  ৳{formatPrice(regular_price)}
                </span>
                <span className="text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">
                  Save ৳{formatPrice(regularPrice - sellingPrice)}
                </span>
              </>
            )}
          </div>
        )}

        {/* Primary button */}
        <div
          className="mt-2 flex flex-col gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {isOutOfStock ? (
            cfg.show_out_of_stock_badge && (
              <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gray-100 text-gray-400 text-xs font-medium cursor-not-allowed">
                <Package className="w-3.5 h-3.5" /> Out of stock
              </div>
            )
          ) : (
            <>
              {cfg.show_add_to_cart && (
                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading || isAddedToCart}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] disabled:opacity-60 ${isAddedToCart ? "bg-green-600 text-white" : "bg-primary text-white hover:bg-primary/90"}`}
                >
                  {cartLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  ) : isAddedToCart ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <ShoppingCart className="w-3.5 h-3.5" />
                  )}
                  {isAddedToCart ? "Added to cart!" : cfg.add_to_cart_text}
                </button>
              )}
              {cfg.show_buy_now && (
                <button
                  onClick={handleBuyNow}
                  disabled={cartLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-700 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  <Zap className="w-3.5 h-3.5" />
                  {cfg.buy_now_text}
                </button>
              )}
            </>
          )}
        </div>

        {/* Secondary actions */}
        <div
          className="flex items-center gap-1.5 pt-1 border-t border-gray-50"
          onClick={(e) => e.stopPropagation()}
        >
          {cfg.show_wishlist && (
            <button
              onClick={handleWishlist}
              disabled={wishlistLoading}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md border text-[10px] font-medium transition-all ${isWishlisted ? "border-red-200 bg-red-50 text-red-500" : "border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500"} disabled:opacity-50`}
            >
              <Heart
                className={`w-3 h-3 ${isWishlisted ? "fill-red-500" : ""}`}
              />
              {isWishlisted ? "Saved" : "Save"}
            </button>
          )}
          {cfg.show_compare && (
            <button
              onClick={() => showToast("Compare coming soon!", "info")}
              className="flex items-center gap-1 px-2 py-1.5 rounded-md border border-gray-200 text-gray-500 text-[10px] font-medium hover:border-gray-300 transition-all"
            >
              <GitCompare className="w-3 h-3" /> Compare
            </button>
          )}
          <button className="flex items-center gap-1 px-2 py-1.5 rounded-md border border-gray-200 text-gray-500 text-[10px] font-medium hover:border-gray-300 transition-all ml-auto">
            <Share2 className="w-3 h-3" /> Share
          </button>
        </div>
      </div>
    </div>
  );
}
