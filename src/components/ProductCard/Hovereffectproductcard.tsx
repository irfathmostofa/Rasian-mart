// components/ProductCard/HoverEffectProductCard.tsx
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
  Zap,
  Check,
  Eye,
  MessageCircle,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { CardConfig, ProductCardProps } from "@/types/ProductCard";
import { formatPrice, getImageUrl, getCategoryName } from "@/components/helper";
import { useCart } from "@/app/store/useCart";
import { useWishlist } from "@/app/store/useWishlist";
import { useToastStore } from "@/app/store/useToastStore";
import { useUserStore } from "@/app/store/useUserStore";
import { ASPECT, deriveCardValues, buildWhatsAppUrl } from "./Shared";
import { EnquiryModal } from "./Enquirymodal";

export function HoverEffectProductCard(
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
  const [isMobile, setIsMobile] = useState(false);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
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

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

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

  // ── Auth guard ─────────────────────────────────────────────────────────────
  const requireAuth = (action: string) => {
    if (!user) {
      showToast(`Please login to ${action}`, "error");
      router.push("/account/login");
      return false;
    }
    return true;
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Enquiry Modal */}
      {cfg.show_inquiry && (
        <EnquiryModal
          isOpen={isEnquiryOpen}
          onClose={() => setIsEnquiryOpen(false)}
          product={{ id, name, code, images, selling_price }}
        />
      )}

      <div
        className={`group relative ${aspectClass} rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300`}
        onClick={() => isMobile && router.push(`/product/${slug}`)}
      >
        {/* Full-bleed image */}
        <Link
          href={`/product/${slug}`}
          className="absolute inset-0 block"
          onClick={(e) => isMobile && e.preventDefault()}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-300 gap-1">
              <ImageOff className="w-8 h-8" />
              <p className="text-xs">No image</p>
            </div>
          )}
        </Link>

        {/* Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Top-left badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-20 pointer-events-none">
          {displayBadge && (
            <span
              className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm bg-black/30"
              style={{
                border: `1px solid ${badgeColor ?? "rgba(255,255,255,0.3)"}`,
              }}
            >
              {badgeIcon && <span className="mr-0.5">{badgeIcon}</span>}
              {displayBadge}
            </span>
          )}
          {cfg.show_sale_badge && hasDiscount && (
            <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
              SALE
            </span>
          )}
        </div>

        {/* Discount % badge */}
        {cfg.show_discount_badge && hasDiscount && (
          <span className="absolute top-2.5 right-2.5 z-20 text-[10px] font-extrabold bg-red-500 text-white px-1.5 py-0.5 rounded-md pointer-events-none">
            -{discountPct}%
          </span>
        )}

        {/* Top-right icon buttons — wishlist, quick view */}
        <div
          className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0"
          onClick={(e) => e.stopPropagation()}
        >
          {cfg.show_wishlist && (
            <button
              onClick={handleWishlist}
              disabled={wishlistLoading}
              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow flex items-center justify-center hover:bg-white hover:scale-110 transition-transform disabled:opacity-50"
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              <Heart
                className={`w-3.5 h-3.5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-700"}`}
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
              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow flex items-center justify-center hover:bg-white hover:scale-110 transition-transform"
              aria-label="Quick view"
            >
              <Eye className="w-3.5 h-3.5 text-gray-700" />
            </button>
          )}
        </div>

        {/* Out of stock overlay */}
        {isOutOfStock && cfg.show_out_of_stock_badge && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20 pointer-events-none">
            <span className="text-xs font-semibold text-white bg-black/60 backdrop-blur-sm px-4 py-1.5 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {/* Slide-up panel */}
        <div
          className={`absolute inset-x-0 bottom-0 z-20 px-3 pb-3 transition-all duration-300 ease-out ${
            isMobile
              ? "translate-y-0"
              : "translate-y-4 group-hover:translate-y-0"
          }`}
        >
          {/* Title + meta */}
          <div className="mb-2">
            {cfg.show_category && categoryName && (
              <p className="text-[9px] font-semibold uppercase tracking-widest text-white/60 mb-0.5">
                {categoryName}
              </p>
            )}
            {cfg.show_title && (
              <h3 className="text-xs sm:text-sm font-semibold text-white leading-snug line-clamp-1">
                {name}
              </h3>
            )}
            {cfg.show_rating && safeRating > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-2.5 h-2.5 ${i < Math.floor(safeRating) ? "fill-amber-400 text-amber-400" : "text-white/30"}`}
                  />
                ))}
                <span className="text-[9px] text-white/60">
                  {safeRating.toFixed(1)}
                </span>
              </div>
            )}
            {cfg.show_price && (
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-sm font-bold text-white">
                  ৳{formatPrice(selling_price)}
                </span>
                {hasDiscount && (
                  <span className="text-[10px] text-white/50 line-through">
                    ৳{formatPrice(regular_price)}
                  </span>
                )}
              </div>
            )}
            {isLowStock && cfg.show_stock && (
              <p className="text-[9px] text-amber-400 font-semibold mt-0.5">
                Only {safeStock} left
              </p>
            )}
          </div>

          {/* Action buttons */}
          {!isOutOfStock && (
            <div
              className={`flex gap-1.5 transition-all duration-300 ${isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
              onClick={(e) => e.stopPropagation()}
            >
              {cfg.show_add_to_cart && (
                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading || isAddedToCart}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold transition-all active:scale-95 disabled:opacity-60 backdrop-blur-sm ${
                    isAddedToCart
                      ? "bg-green-500 text-white"
                      : "bg-white text-gray-900 hover:bg-white/90"
                  }`}
                >
                  {cartLoading ? (
                    <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
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

              {cfg.show_buy_now && (
                <button
                  onClick={handleBuyNow}
                  disabled={cartLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary text-white text-[11px] font-semibold transition-all active:scale-95 hover:bg-primary/90 disabled:opacity-60 backdrop-blur-sm"
                >
                  <Zap className="w-3 h-3" />
                  <span className="hidden sm:inline">{cfg.buy_now_text}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
