// components/ProductCard/ModernProductCard.tsx
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
  Eye,
  ArrowRight,
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
 * MODERN layout — bold, design-forward card.
 * Large price, clean type hierarchy, primary-color accent strip,
 * icon-only action row that feels more like an app than a shop.
 * Great for electronics, tech, premium goods.
 */
export function ModernProductCard(
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
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-100 hover:border-primary/20">
      {/* Primary color accent strip */}
      <div className="h-0.5 w-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Image */}
      <div
        className={`relative ${aspectClass} shrink-0 bg-gray-50 overflow-hidden`}
      >
        <Link href={`/product/${slug}`} className="absolute inset-0 block">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover group-hover:scale-[1.06] transition-transform duration-500 ease-out"
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
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {displayBadge && (
            <span
              className="text-[9px] font-black uppercase tracking-wider text-white px-2 py-0.5 rounded-sm"
              style={{
                background: badgeColor ?? "var(--color-primary, #6366f1)",
              }}
            >
              {badgeIcon && <span className="mr-0.5">{badgeIcon}</span>}
              {displayBadge}
            </span>
          )}
          {cfg.show_sale_badge && hasDiscount && (
            <span className="text-[9px] font-black uppercase tracking-wider bg-red-500 text-white px-2 py-0.5 rounded-sm">
              SALE
            </span>
          )}
        </div>
        {cfg.show_discount_badge && hasDiscount && (
          <div className="absolute top-0 right-0 z-10">
            <div className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-bl-lg">
              -{discountPct}%
            </div>
          </div>
        )}

        {/* Floating icon row — top right on hover */}
        <div
          className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-20 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {cfg.show_wishlist && (
            <button
              onClick={handleWishlist}
              disabled={wishlistLoading}
              className={`w-8 h-8 rounded-xl shadow-md flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50 ${isWishlisted ? "bg-red-500 text-white" : "bg-white text-gray-600 hover:text-red-500"}`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${isWishlisted ? "fill-white" : ""}`}
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
              className="w-8 h-8 bg-white rounded-xl shadow-md flex items-center justify-center hover:scale-105 transition-all text-gray-600 hover:text-primary"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Out of stock */}
        {isOutOfStock && cfg.show_out_of_stock_badge && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-20 pointer-events-none">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider bg-white/90 px-3 py-1 rounded-lg border border-gray-200">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        {cfg.show_category && categoryName && (
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary/70 truncate">
            {categoryName}
          </p>
        )}
        {cfg.show_title && (
          <Link
            href={`/product/${slug}`}
            className="group/title flex items-start justify-between gap-1"
          >
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover/title:text-primary transition-colors">
              {name}
            </h3>
            <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover/title:text-primary shrink-0 mt-0.5 transition-colors" />
          </Link>
        )}
        {cfg.show_rating && (
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-2.5 h-2.5 ${safeRating > 0 && i < Math.floor(safeRating) ? "fill-amber-400 text-amber-400" : "fill-gray-100 text-gray-100"}`}
                />
              ))}
            </div>
            <span className="text-[9px] font-semibold text-gray-400">
              {safeRating > 0 ? safeRating.toFixed(1) : "No reviews"}
            </span>
          </div>
        )}
        {isLowStock && cfg.show_stock && (
          <div className="flex items-center gap-1">
            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{ width: `${(safeStock / 10) * 100}%` }}
              />
            </div>
            <span className="text-[9px] font-semibold text-amber-600 shrink-0">
              Only {safeStock} left
            </span>
          </div>
        )}

        <div className="flex-1" />

        {/* Price */}
        {cfg.show_price && (
          <div className="flex items-end gap-1.5 flex-wrap">
            <span className="text-base sm:text-lg font-black text-gray-900 leading-none">
              ৳{formatPrice(selling_price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through leading-none mb-0.5">
                ৳{formatPrice(regular_price)}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div
          className="flex items-center gap-1.5 mt-1"
          onClick={(e) => e.stopPropagation()}
        >
          {isOutOfStock ? (
            cfg.show_out_of_stock_badge && (
              <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-100 text-gray-400 text-xs font-semibold cursor-not-allowed">
                <Package className="w-3.5 h-3.5" /> Sold Out
              </div>
            )
          ) : (
            <>
              {cfg.show_add_to_cart && (
                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading || isAddedToCart}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-60 ${isAddedToCart ? "bg-green-500 text-white" : "bg-primary text-white hover:bg-primary/90 shadow-sm shadow-primary/30"}`}
                >
                  {cartLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  ) : isAddedToCart ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <ShoppingCart className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">
                    {isAddedToCart ? "Added!" : cfg.add_to_cart_text}
                  </span>
                </button>
              )}
              {cfg.show_buy_now && (
                <button
                  onClick={handleBuyNow}
                  disabled={cartLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-gray-100 text-gray-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-50 font-bold text-xs"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{cfg.buy_now_text}</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
