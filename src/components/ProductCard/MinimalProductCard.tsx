"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Heart,
  ShoppingCart,
  Star,
  ImageOff,
  Eye,
  Zap,
  MessageCircle,
  GitCompare,
  Barcode,
  Check,
  Package,
  Truck,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Share2,
  Minus,
  Plus,
} from "lucide-react";
import { ProductCardProps } from "@/types/ProductCard";
import { formatPrice, getCategoryName, getImageUrl } from "@/components/helper";
import { useCart } from "@/app/store/useCart";
import { useWishlist } from "@/app/store/useWishlist";
import { useToastStore } from "@/app/store/useToastStore";
import { useUserStore } from "@/app/store/useUserStore";
import { useThemeData } from "@/app/store/useThemeData";
import { FaWhatsapp } from "react-icons/fa";
import { EnquiryModal } from "./Enquirymodal";
import { QuickViewModal } from "./QuickViewModal";

// ─── Config types ──────────────────────────────────────────────────────────────

interface WhatsAppConfig {
  number: string;
  button_color: string;
  button_text: string;
  message: string;
  message_bn: string;
  show_seller_number: boolean;
  open_in_new_tab: boolean;
}

interface CardConfig {
  layout: string;
  show_title: boolean;
  show_price: boolean;
  show_rating: boolean;
  show_add_to_cart: boolean;
  show_wishlist: boolean;
  show_compare: boolean;
  show_sale_badge: boolean;
  show_new_badge: boolean;
  quick_view: boolean;
  show_buy_now: boolean;
  show_sku: boolean;
  show_stock: boolean;
  show_category: boolean;
  image_aspect_ratio: "square" | "portrait" | "landscape";
  show_out_of_stock_badge: boolean;
  show_discount_badge: boolean;
  show_bestseller_badge: boolean;
  show_featured_badge: boolean;
  show_inquiry: boolean;
  primary_button: "add_to_cart" | "buy_now" | "whatsapp" | "inquiry";
  button_position: "bottom" | "overlay" | "hover";
  button_size: "sm" | "md" | "lg";
  button_style: "icon" | "text" | "icon_text";
  add_to_cart_text: string;
  buy_now_text: string;
  inquiry_text: string;
  whatsapp_text: string;
  whatsapp: WhatsAppConfig;
  show_contact_whatsapp: boolean;
}

// ─── Static maps ───────────────────────────────────────────────────────────────

const ASPECT: Record<string, string> = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
};

const TEXT_PAD: Record<string, string> = {
  sm: "px-2 py-1.5 text-xs",
  md: "px-3 py-2 text-sm",
  lg: "px-4 py-2.5 text-sm",
};

const ICON_PAD: Record<string, string> = {
  sm: "p-1.5",
  md: "p-2",
  lg: "p-2.5",
};

const BUTTON_SIZES = {
  sm: { icon: "w-3.5 h-3.5", container: "gap-1" },
  md: { icon: "w-4 h-4", container: "gap-1.5" },
  lg: { icon: "w-5 h-5", container: "gap-2" },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function buildWhatsAppUrl(
  cfg: WhatsAppConfig,
  productName: string,
  sku: string,
): string {
  const message = cfg.message_bn || cfg.message;
  const msg = message
    .replace("{product_name}", productName)
    .replace("{sku}", sku);
  return `https://wa.me/${cfg.number}?text=${encodeURIComponent(msg)}`;
}

// ─── Main Card Component ───────────────────────────────────────────────────────

export function MinimalProductCard({
  id,
  slug,
  primary_variant_id,
  name,
  categories,
  selling_price,
  regular_price,
  badge,
  total_stock,
  rating,
  images,
  code,
  cardStyle,
  badgeIcon,
  badgeColor,
}: ProductCardProps) {
  // ── Config ────────────────────────────────────────────────────────────────
  const raw = (useThemeData("product_card") ?? {}) as Partial<CardConfig>;
  const [isMobile, setIsMobile] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const addedToCartTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const cfg: CardConfig = {
    layout: raw.layout ?? "minimal",
    show_title: raw.show_title ?? true,
    show_price: raw.show_price ?? true,
    show_rating: raw.show_rating ?? true,
    show_add_to_cart: raw.show_add_to_cart ?? true,
    show_wishlist: raw.show_wishlist ?? true,
    show_compare: raw.show_compare ?? false,
    show_sale_badge: raw.show_sale_badge ?? true,
    show_new_badge: raw.show_new_badge ?? true,
    quick_view: raw.quick_view ?? true,
    show_buy_now: raw.show_buy_now ?? false,
    show_sku: raw.show_sku ?? false,
    show_stock: raw.show_stock ?? true,
    show_category: raw.show_category ?? true,
    image_aspect_ratio:
      (raw.image_aspect_ratio as CardConfig["image_aspect_ratio"]) ??
      "portrait",
    show_out_of_stock_badge: raw.show_out_of_stock_badge ?? true,
    show_discount_badge: raw.show_discount_badge ?? true,
    show_bestseller_badge: raw.show_bestseller_badge ?? true,
    show_featured_badge: raw.show_featured_badge ?? true,
    show_inquiry: raw.show_inquiry ?? true,
    primary_button:
      (raw.primary_button as CardConfig["primary_button"]) ?? "add_to_cart",
    button_position:
      (raw.button_position as CardConfig["button_position"]) ?? "bottom",
    button_size: (raw.button_size as CardConfig["button_size"]) ?? "md",
    button_style: (raw.button_style as CardConfig["button_style"]) ?? "icon",
    add_to_cart_text: raw.add_to_cart_text ?? "Add to Cart",
    buy_now_text: raw.buy_now_text ?? "Buy Now",
    inquiry_text: raw.inquiry_text ?? "Inquiry",
    whatsapp_text: raw.whatsapp_text ?? "Contact to Buy",
    show_contact_whatsapp: raw.show_contact_whatsapp ?? false,
    whatsapp: {
      number: raw.whatsapp?.number ?? "",
      button_color: raw.whatsapp?.button_color ?? "#25D366",
      button_text: raw.whatsapp?.button_text ?? "Contact on WhatsApp",
      message:
        raw.whatsapp?.message ??
        "Hello, I'm interested in {product_name} (SKU: {sku})",
      message_bn: raw.whatsapp?.message_bn ?? "",
      show_seller_number: raw.whatsapp?.show_seller_number ?? false,
      open_in_new_tab: raw.whatsapp?.open_in_new_tab ?? false,
    },
  };

  // ── Stores ────────────────────────────────────────────────────────────────
  const { user } = useUserStore();
  const { addToCart, isLoading: cartLoading } = useCart();
  const {
    toggleWishlist,
    isInWishlist,
    isLoading: wishlistLoading,
  } = useWishlist();
  const { showToast } = useToastStore();
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  // ── Derived ───────────────────────────────────────────────────────────────
  const imageUrl = !imageError ? getImageUrl(images) : null;
  const categoryName = getCategoryName(categories);
  const safeRating = rating != null ? parseFloat(String(rating)) || 0 : 0;
  const safeStock =
    typeof total_stock === "string"
      ? parseFloat(total_stock)
      : (total_stock ?? 0);
  const sellingPrice = Number(selling_price) || 0;
  const regularPrice = Number(regular_price) || 0;
  const isWishlisted = isInWishlist(id);
  const isOutOfStock = safeStock <= 0;
  const hasDiscount = regularPrice > 0 && regularPrice > sellingPrice;
  const discountPct = hasDiscount
    ? Math.round(((regularPrice - sellingPrice) / regularPrice) * 100)
    : 0;
  const sku = code ?? `${id}`;

  const getDisplayBadge = () => {
    if (!badge) return null;
    if (badge === "Best Seller" && !cfg.show_bestseller_badge) return null;
    if (badge === "Featured" && !cfg.show_featured_badge) return null;
    if (badge === "New" && !cfg.show_new_badge) return null;
    return badge;
  };
  const displayBadge = getDisplayBadge();

  const aspectClass = ASPECT[cfg.image_aspect_ratio] ?? ASPECT.portrait;
  const btnPad = TEXT_PAD[cfg.button_size] ?? TEXT_PAD.md;
  const iconPad = ICON_PAD[cfg.button_size] ?? ICON_PAD.md;
  const showLabel =
    cfg.button_style === "text" || cfg.button_style === "icon_text";
  const showIcon =
    cfg.button_style === "icon" || cfg.button_style === "icon_text";
  const buttonSizes = BUTTON_SIZES[cfg.button_size] ?? BUTTON_SIZES.md;
  const effectiveShowLabel =
    isMobile && cfg.button_style === "icon_text" ? false : showLabel;
  const effectiveShowIcon =
    isMobile && cfg.button_style === "text" ? false : showIcon;

  useEffect(() => {
    return () => {
      if (addedToCartTimer.current) clearTimeout(addedToCartTimer.current);
    };
  }, []);

  // ── Auth guard ────────────────────────────────────────────────────────────
  const requireAuth = (action: string): boolean => {
    if (!user) {
      showToast(`Please login to ${action}`, "error");
      router.push("/account/login");
      return false;
    }
    return true;
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAddToCart = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!cfg.show_add_to_cart) return;
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
      if (addedToCartTimer.current) clearTimeout(addedToCartTimer.current);
      addedToCartTimer.current = setTimeout(
        () => setIsAddedToCart(false),
        2000,
      );
    } catch {
      showToast("Failed to add to cart", "error");
    }
  };

  const handleBuyNow = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!cfg.show_buy_now) return;
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
      showToast("Failed to proceed to checkout", "error");
    }
  };

  const handleToggleWishlist = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!cfg.show_wishlist) return;
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

  const handleWhatsApp = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!cfg.show_contact_whatsapp) return;
    const url = buildWhatsAppUrl(cfg.whatsapp, name, sku);
    if (cfg.whatsapp.open_in_new_tab) window.open(url, "_blank");
    else window.location.href = url;
  };

  const handleQuickView = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!cfg.quick_view) return;
    setIsQuickViewOpen(true);
  };

  const handleInquiry = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!cfg.show_inquiry) return;
    setIsEnquiryOpen(true);
  };

  // ── Primary Button ────────────────────────────────────────────────────────
  const PrimaryButton = ({ stretch = false }: { stretch?: boolean }) => {
    if (
      (cfg.primary_button === "add_to_cart" && !cfg.show_add_to_cart) ||
      (cfg.primary_button === "buy_now" && !cfg.show_buy_now) ||
      (cfg.primary_button === "inquiry" && !cfg.show_inquiry) ||
      (cfg.primary_button === "whatsapp" && !cfg.show_contact_whatsapp)
    )
      return null;

    if (isOutOfStock) {
      return cfg.show_out_of_stock_badge ? (
        <div
          className={`flex items-center justify-center rounded-lg bg-gray-100 text-gray-400 text-xs font-medium cursor-not-allowed ${btnPad} ${stretch ? "w-full" : ""}`}
        >
          <Package className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
          Out of Stock
        </div>
      ) : null;
    }

    const base = `inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${btnPad} ${stretch ? "w-full" : ""}`;

    if (isAddedToCart && cfg.primary_button === "add_to_cart") {
      return (
        <button
          className={`${base} bg-green-600 text-white cursor-default`}
          disabled
        >
          <Check className={`${buttonSizes.icon} flex-shrink-0`} />
          {effectiveShowLabel && <span>Added!</span>}
        </button>
      );
    }

    switch (cfg.primary_button) {
      case "buy_now":
        return (
          <button
            onClick={handleBuyNow}
            disabled={cartLoading}
            className={`${base} bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow`}
            aria-label={cfg.buy_now_text}
          >
            {cartLoading ? (
              <span
                className={`${buttonSizes.icon} border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0`}
              />
            ) : (
              effectiveShowIcon && (
                <Zap className={`${buttonSizes.icon} flex-shrink-0`} />
              )
            )}
            {effectiveShowLabel && <span>{cfg.buy_now_text}</span>}
          </button>
        );
      case "whatsapp":
        return (
          <button
            onClick={handleWhatsApp}
            className={`${base} text-white shadow-sm hover:shadow`}
            style={{ background: cfg.whatsapp.button_color }}
            aria-label={cfg.whatsapp_text}
          >
            {effectiveShowIcon && (
              <MessageCircle className={`${buttonSizes.icon} flex-shrink-0`} />
            )}
            {effectiveShowLabel && <span>{cfg.whatsapp_text}</span>}
          </button>
        );
      case "inquiry":
        return (
          <button
            onClick={handleInquiry}
            className={`${base} bg-gray-800 text-white hover:bg-gray-700 shadow-sm hover:shadow`}
            aria-label={cfg.inquiry_text}
          >
            {effectiveShowIcon && (
              <MessageCircle className={`${buttonSizes.icon} flex-shrink-0`} />
            )}
            {effectiveShowLabel && <span>{cfg.inquiry_text}</span>}
          </button>
        );
      default:
        return (
          <button
            onClick={handleAddToCart}
            disabled={cartLoading}
            className={`${base} bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow`}
            aria-label={cfg.add_to_cart_text}
          >
            {cartLoading ? (
              <span
                className={`${buttonSizes.icon} border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0`}
              />
            ) : (
              effectiveShowIcon && (
                <ShoppingCart className={`${buttonSizes.icon} flex-shrink-0`} />
              )
            )}
            {effectiveShowLabel && <span>{cfg.add_to_cart_text}</span>}
          </button>
        );
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Quick View Modal */}

      {cfg.quick_view && (
        <QuickViewModal
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
          product={{
            id,
            slug,
            name,
            categories,
            selling_price,
            regular_price,
            rating,
            images,
            code,
            total_stock,
            badge,
            primary_variant_id,
            badgeIcon,
            badgeColor,
            cardStyle,
          }}
          cfg={cfg}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onToggleWishlist={handleToggleWishlist}
          isWishlisted={isWishlisted}
          cartLoading={cartLoading}
          wishlistLoading={wishlistLoading}
          isAddedToCart={isAddedToCart}
        />
      )}

      {/* Card */}
      <div
        className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full"
        style={
          cardStyle && typeof cardStyle === "object"
            ? (cardStyle as React.CSSProperties)
            : undefined
        }
        onMouseEnter={() => !isMobile && setHovered(true)}
        onMouseLeave={() => !isMobile && setHovered(false)}
        onClick={() => isMobile && router.push(`/product/${slug}`)}
      >
        {/* ══ IMAGE AREA ══════════════════════════════════════════════════════ */}
        <div
          className={`relative ${aspectClass} overflow-hidden bg-gray-50 flex-shrink-0`}
        >
          <Link
            href={`/product/${slug}`}
            className="block w-full h-full absolute inset-0"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-cover transition-transform duration-500 ${hovered ? "scale-105" : "scale-100"}`}
                onError={() => setImageError(true)}
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-1.5 p-4">
                <ImageOff className="w-8 h-8 sm:w-10 sm:h-10" />
                <p className="text-xs text-center">No Image</p>
              </div>
            )}
          </Link>

          {/* ── Hover icon row ── */}
          <div
            className={`absolute inset-0 transition-all duration-300 flex items-center justify-center gap-2 z-10 ${
              hovered || isMobile
                ? "opacity-100 bg-black/15"
                : "opacity-0 pointer-events-none"
            }`}
          >
            {cfg.show_wishlist && (
              <button
                onClick={handleToggleWishlist}
                disabled={wishlistLoading}
                className="w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
                aria-label={
                  isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                <Heart
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                />
              </button>
            )}

            {/* Quick View — now fully functional */}
            {cfg.quick_view && (
              <button
                onClick={handleQuickView}
                className="w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                aria-label="Quick view"
              >
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
            )}

            {cfg.show_compare && (
              <button
                onClick={() =>
                  showToast("Compare feature coming soon!", "info")
                }
                className="w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                aria-label="Compare"
              >
                <GitCompare className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
            )}
          </div>

          {/* ── Badges top-left ── */}
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex flex-col gap-1 z-20 pointer-events-none">
            {displayBadge && (
              <span
                className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-white text-[9px] sm:text-[10px] font-bold rounded-full whitespace-nowrap flex items-center gap-0.5"
                style={{
                  background: badgeColor ?? "var(--color-primary, #6366f1)",
                }}
              >
                {badgeIcon && <span className="text-[9px]">{badgeIcon}</span>}
                {displayBadge}
              </span>
            )}
            {cfg.show_sale_badge && hasDiscount && (
              <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full">
                SALE
              </span>
            )}
            {cfg.show_new_badge && !hasDiscount && !displayBadge && (
              <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 bg-emerald-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full">
                NEW
              </span>
            )}
          </div>

          {/* ── Discount % badge top-right ── */}
          {cfg.show_discount_badge && hasDiscount && (
            <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20 pointer-events-none">
              <span className="px-1 py-0.5 sm:px-1.5 sm:py-0.5 bg-red-500 text-white text-[9px] sm:text-[10px] font-extrabold rounded-md">
                -{discountPct}%
              </span>
            </div>
          )}

          {/* ── Out of stock overlay ── */}
          {isOutOfStock && cfg.show_out_of_stock_badge && (
            <div className="absolute inset-0 bg-black/35 flex items-end justify-center pb-2 sm:pb-3 z-30 pointer-events-none">
              <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-black/70 text-white text-[10px] sm:text-xs font-semibold rounded-full tracking-wide">
                Out of Stock
              </span>
            </div>
          )}

          {/* ── Low-stock indicator ── */}
          {cfg.show_stock &&
            !isOutOfStock &&
            safeStock > 0 &&
            safeStock <= 10 && (
              <div className="absolute bottom-0 left-0 right-0 px-2 pb-1.5 sm:px-3 sm:pb-2.5 z-20 pointer-events-none">
                <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                  <Truck className="w-3 h-3 text-white" />
                  <p className="text-[9px] sm:text-[10px] text-white font-medium">
                    Only {safeStock} left!
                  </p>
                </div>
              </div>
            )}

          {/* ── Button position: overlay ── */}
          {cfg.button_position === "overlay" && !isOutOfStock && (
            <div
              className={`absolute bottom-0 left-0 right-0 p-2 z-20 transition-all duration-300 ${
                hovered || isMobile
                  ? "translate-y-0 opacity-100"
                  : "translate-y-2 opacity-0 pointer-events-none"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <PrimaryButton stretch />
            </div>
          )}
        </div>
        {/* ══ end IMAGE AREA ══════════════════════════════════════════════════ */}

        {/* ══ CONTENT AREA ════════════════════════════════════════════════════ */}
        <div className="flex flex-col flex-1 p-2 sm:p-3 gap-1">
          {/* Category */}
          {cfg.show_category && categoryName && (
            <Link
              href={`/category/${categories?.[0]?.id}/${categories?.[0]?.slug}`}
              className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-widest truncate hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {categoryName}
            </Link>
          )}

          {/* Title */}
          {cfg.show_title && (
            <Link
              href={`/product/${slug}`}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 leading-snug hover:text-primary transition-colors">
                {name}
              </h3>
            </Link>
          )}

          {/* SKU */}
          {cfg.show_sku && (
            <p className="flex items-center gap-1 text-[8px] sm:text-[10px] text-gray-400">
              <Barcode className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
              <span className="truncate">{sku}</span>
            </p>
          )}

          {/* Rating */}
          {cfg.show_rating && (
            <div className="flex items-center gap-1 flex-wrap">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      safeRating > 0 && i < Math.floor(safeRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
              {safeRating > 0 ? (
                <span className="text-[8px] sm:text-[10px] text-gray-400">
                  ({safeRating.toFixed(1)})
                </span>
              ) : (
                <span className="text-[8px] sm:text-[10px] text-gray-400">
                  No reviews
                </span>
              )}
            </div>
          )}

          <div className="flex-1 min-h-[4px]" />

          {/* Price */}
          {cfg.show_price && (
            <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap mt-0.5 sm:mt-1">
              <span className="text-sm sm:text-base font-bold text-gray-900">
                ৳{formatPrice(selling_price)}
              </span>
              {hasDiscount && (
                <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                  ৳{formatPrice(regular_price)}
                </span>
              )}
            </div>
          )}

          {/* ── Button position: bottom ── */}
          {cfg.button_position === "bottom" && (
            <div
              className="flex items-center gap-1 sm:gap-1.5 mt-1 sm:mt-1.5 flex-wrap"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Add to Cart Button with text */}
              {cfg.show_add_to_cart && !isOutOfStock && (
                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  className={`flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${btnPad} ${isAddedToCart ? "bg-green-600 text-white" : "bg-primary text-white hover:bg-primary/90"} shadow-sm hover:shadow`}
                >
                  {cartLoading ? (
                    <span
                      className={`${buttonSizes.icon} border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0`}
                    />
                  ) : (
                    <>
                      {isAddedToCart ? (
                        <Check
                          className={`${buttonSizes.icon} flex-shrink-0`}
                        />
                      ) : (
                        <ShoppingCart
                          className={`${buttonSizes.icon} flex-shrink-0`}
                        />
                      )}
                      <span>
                        {isAddedToCart ? "Added!" : cfg.add_to_cart_text}
                      </span>
                    </>
                  )}
                </button>
              )}

              {/* Buy Now Button with text */}
              {cfg.show_buy_now && !isOutOfStock && (
                <button
                  onClick={handleBuyNow}
                  disabled={cartLoading}
                  className={`flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${btnPad} bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow`}
                >
                  {cartLoading ? (
                    <span
                      className={`${buttonSizes.icon} border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0`}
                    />
                  ) : (
                    <>
                      <Zap className={`${buttonSizes.icon} flex-shrink-0`} />
                      <span>{cfg.buy_now_text}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* ── Button position: hover ── */}
          {cfg.button_position === "hover" && (
            <div
              className={`mt-1 sm:mt-1.5 overflow-hidden transition-all duration-300 ${
                hovered || isMobile
                  ? "max-h-12 opacity-100"
                  : "max-h-0 opacity-0 pointer-events-none"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <PrimaryButton stretch />
            </div>
          )}
        </div>
        {/* ══ end CONTENT AREA ════════════════════════════════════════════════ */}
      </div>
    </>
  );
}
