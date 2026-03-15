// components/ProductCard/SimpleProductCard.tsx
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
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { CardConfig, ProductCardProps } from "@/types/ProductCard";
import { formatPrice, getImageUrl, getCategoryName } from "@/components/helper";
import { useCart } from "@/app/store/useCart";
import { useWishlist } from "@/app/store/useWishlist";
import { useToastStore } from "@/app/store/useToastStore";
import { useUserStore } from "@/app/store/useUserStore";
import { ASPECT, deriveCardValues, buildWhatsAppUrl } from "./Shared";

/**
 * SIMPLE layout — stripped back, info-first, grid-friendly.
 * No hover overlays. Everything visible at a glance.
 * Great for dense catalogues and search results.
 */
export function SimpleProductCard(
  props: ProductCardProps & { cfg: CardConfig },
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
    <div className="group relative bg-white border border-gray-100 rounded-lg overflow-hidden hover:border-gray-200 hover:shadow-md transition-all duration-200 flex flex-col h-full">
      {/* Image */}
      <Link
        href={`/product/${slug}`}
        className={`relative ${aspectClass} block bg-gray-50 shrink-0 overflow-hidden`}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-1">
            <ImageOff className="w-8 h-8" />
            <p className="text-xs">No image</p>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none z-10">
          {displayBadge && (
            <span
              className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded-sm"
              style={{
                background: badgeColor ?? "var(--color-primary, #6366f1)",
              }}
            >
              {badgeIcon && <span className="mr-0.5">{badgeIcon}</span>}
              {displayBadge}
            </span>
          )}
          {cfg.show_sale_badge && hasDiscount && (
            <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-sm">
              SALE
            </span>
          )}
        </div>
        {cfg.show_discount_badge && hasDiscount && (
          <span className="absolute top-2 right-2 text-[9px] font-extrabold bg-red-500 text-white px-1 py-0.5 rounded-sm z-10">
            -{discountPct}%
          </span>
        )}
        {isOutOfStock && cfg.show_out_of_stock_badge && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-20 pointer-events-none">
            <span className="text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-col flex-1 p-2.5 gap-1.5">
        {cfg.show_category && categoryName && (
          <p className="text-[9px] uppercase tracking-widest text-gray-400 truncate">
            {categoryName}
          </p>
        )}
        {cfg.show_title && (
          <Link href={`/product/${slug}`}>
            <h3 className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2 leading-snug hover:text-primary transition-colors">
              {name}
            </h3>
          </Link>
        )}
        {cfg.show_rating && (
          <div className="flex items-center gap-1">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${safeRating > 0 && i < Math.floor(safeRating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                />
              ))}
            </div>
            <span className="text-[9px] text-gray-400">
              {safeRating > 0 ? safeRating.toFixed(1) : "—"}
            </span>
          </div>
        )}
        {isLowStock && cfg.show_stock && (
          <p className="text-[9px] font-semibold text-amber-600">
            Only {safeStock} left
          </p>
        )}
        <div className="flex-1" />
        {cfg.show_price && (
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm font-bold text-gray-900">
              ৳{formatPrice(selling_price)}
            </span>
            {hasDiscount && (
              <span className="text-[10px] text-gray-400 line-through">
                ৳{formatPrice(regular_price)}
              </span>
            )}
          </div>
        )}

        {/* Actions row */}
        <div
          className="flex items-center gap-1.5 mt-1"
          onClick={(e) => e.stopPropagation()}
        >
          {!isOutOfStock && cfg.show_add_to_cart && (
            <button
              onClick={handleAddToCart}
              disabled={cartLoading || isAddedToCart}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 ${isAddedToCart ? "bg-green-600 text-white" : "bg-primary text-white hover:bg-primary/90"}`}
            >
              {cartLoading ? (
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isAddedToCart ? (
                <Check className="w-3 h-3" />
              ) : (
                <ShoppingCart className="w-3 h-3" />
              )}
              <span className="hidden sm:inline">
                {isAddedToCart ? "Added!" : cfg.add_to_cart_text}
              </span>
            </button>
          )}
          {isOutOfStock && cfg.show_out_of_stock_badge && (
            <div className="flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-xs font-medium bg-gray-100 text-gray-400 cursor-not-allowed">
              <Package className="w-3 h-3" /> Out of stock
            </div>
          )}
          {cfg.show_buy_now &&
            !isOutOfStock &&
            cfg.primary_button === "add_to_cart" && (
              <button
                onClick={handleBuyNow}
                disabled={cartLoading}
                title={cfg.buy_now_text}
                className="shrink-0 p-2 rounded-md border border-gray-200 text-gray-500 hover:border-primary hover:text-primary transition-all"
              >
                <Zap className="w-3 h-3" />
              </button>
            )}
          {cfg.show_contact_whatsapp && !isOutOfStock && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const url = buildWhatsAppUrl(cfg.whatsapp, name, sku);
                cfg.whatsapp.open_in_new_tab
                  ? window.open(url, "_blank")
                  : (window.location.href = url);
              }}
              title="WhatsApp"
              className="shrink-0 p-2 rounded-md text-white transition-opacity hover:opacity-85"
              style={{ background: cfg.whatsapp.button_color }}
            >
              <FaWhatsapp className="w-3 h-3" />
            </button>
          )}
          {cfg.show_wishlist && (
            <button
              onClick={handleWishlist}
              disabled={wishlistLoading}
              title={isWishlisted ? "Remove from wishlist" : "Save"}
              className={`shrink-0 p-2 rounded-md border transition-all ${isWishlisted ? "border-red-200 bg-red-50 text-red-500" : "border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500"} disabled:opacity-50`}
            >
              <Heart
                className={`w-3 h-3 ${isWishlisted ? "fill-red-500" : ""}`}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
