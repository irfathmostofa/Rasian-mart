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

// ─── Quick View Modal ─────────────────────────────────────────────────────────

interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductCardProps;
  cfg: CardConfig;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onToggleWishlist: () => void;
  isWishlisted: boolean;
  cartLoading: boolean;
  wishlistLoading: boolean;
  isAddedToCart: boolean;
}

function QuickViewModal({
  isOpen,
  onClose,
  product,
  cfg,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
  cartLoading,
  wishlistLoading,
  isAddedToCart,
}: QuickViewModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const sellingPrice = Number(product.selling_price) || 0;
  const regularPrice = Number(product.regular_price) || 0;
  const safeRating =
    product.rating != null ? parseFloat(String(product.rating)) || 0 : 0;
  const safeStock =
    typeof product.total_stock === "string"
      ? parseFloat(product.total_stock)
      : (product.total_stock ?? 0);
  const hasDiscount = regularPrice > 0 && regularPrice > sellingPrice;
  const discountPct = hasDiscount
    ? Math.round(((regularPrice - sellingPrice) / regularPrice) * 100)
    : 0;
  const isOutOfStock = safeStock <= 0;
  const categoryName = getCategoryName(product.categories);

  const imageList: string[] = (() => {
    if (!product.images || !Array.isArray(product.images)) {
      const single = getImageUrl(product.images);
      return single ? [single] : [];
    }
    const sorted = [...product.images].sort((a, b) =>
      a.is_primary === b.is_primary ? 0 : a.is_primary ? -1 : 1,
    );
    return sorted.map((img) => img.url).filter(Boolean);
  })();

  const currentImage = imageList[currentImageIndex] || null;

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft")
        setCurrentImageIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight")
        setCurrentImageIndex((i) => Math.min(imageList.length - 1, i + 1));
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isOpen, imageList.length, onClose]);

  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      setQuantity(1);
      setImageError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-[2px]"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view: ${product.name}`}
    >
      <div
        ref={modalRef}
        className="relative bg-white w-full sm:rounded-2xl sm:max-w-3xl max-h-[95vh] sm:max-h-[88vh] overflow-hidden flex flex-col rounded-t-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            {hasDiscount && (
              <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
                -{discountPct}% OFF
              </span>
            )}
            {!isOutOfStock && safeStock > 0 && safeStock <= 10 && (
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Only {safeStock} left
              </span>
            )}
            {isOutOfStock && (
              <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                Out of stock
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              href={`/product/${product.slug}`}
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-gray-500 hover:text-primary hover:bg-gray-50 transition-all border border-gray-200"
            >
              <ZoomIn className="w-3 h-3" />
              Full page
            </Link>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden min-h-0">
          {/* ── Left: Image panel ── */}
          <div className="sm:w-[42%] flex-shrink-0 flex flex-col bg-gray-50 border-r border-gray-100">
            {/* Main image */}
            <div className="relative flex-1 min-h-[220px] sm:min-h-0 overflow-hidden">
              {currentImage && !imageError ? (
                <Image
                  src={currentImage}
                  alt={`${product.name} — view ${currentImageIndex + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 42vw"
                  className="object-contain p-4 transition-opacity duration-200"
                  onError={() => setImageError(true)}
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-2">
                  <ImageOff className="w-10 h-10" />
                  <p className="text-xs text-gray-400">No image</p>
                </div>
              )}

              {imageList.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((i) => Math.max(0, i - 1))
                    }
                    disabled={currentImageIndex === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 disabled:opacity-25 transition-all shadow-sm"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((i) =>
                        Math.min(imageList.length - 1, i + 1),
                      )
                    }
                    disabled={currentImageIndex === imageList.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 disabled:opacity-25 transition-all shadow-sm"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {imageList.length > 1 && (
              <div className="flex gap-1.5 p-2.5 overflow-x-auto border-t border-gray-100 flex-shrink-0">
                {imageList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentImageIndex(idx);
                      setImageError(false);
                    }}
                    className={`flex-shrink-0 w-11 h-11 rounded-lg overflow-hidden border-[1.5px] transition-all bg-white ${
                      idx === currentImageIndex
                        ? "border-primary shadow-sm"
                        : "border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100"
                    }`}
                    aria-label={`Image ${idx + 1}`}
                  >
                    <Image
                      src={img}
                      alt=""
                      width={44}
                      height={44}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Info panel ── */}
          <div className="sm:w-[58%] flex flex-col overflow-y-auto">
            <div className="flex flex-col gap-4 p-5 flex-1">
              {/* Category + Title */}
              <div className="space-y-1">
                {cfg.show_category && categoryName && (
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                    {categoryName}
                  </p>
                )}
                {cfg.show_title && (
                  <h2 className="text-base sm:text-[17px] font-semibold text-gray-900 leading-snug">
                    {product.name}
                  </h2>
                )}
                {cfg.show_sku && (
                  <p className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                    <Barcode className="w-3 h-3 flex-shrink-0" />
                    {product.code ?? product.id}
                  </p>
                )}
              </div>

              {/* Rating */}
              {cfg.show_rating && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          safeRating > 0 && i < Math.floor(safeRating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">
                    {safeRating > 0
                      ? `${safeRating.toFixed(1)} rating`
                      : "No reviews yet"}
                  </span>
                </div>
              )}

              {/* Price block */}
              {cfg.show_price && (
                <div className="flex items-end gap-2.5 flex-wrap">
                  <span className="text-2xl font-bold text-gray-900 leading-none">
                    ৳{formatPrice(product.selling_price)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-sm text-gray-400 line-through leading-none mb-0.5">
                        ৳{formatPrice(product.regular_price)}
                      </span>
                      <span className="text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full leading-none mb-0.5">
                        Save ৳{formatPrice(regularPrice - sellingPrice)}
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Quantity */}
              {!isOutOfStock && (
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Quantity
                  </span>
                  <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors border-r border-gray-200"
                      aria-label="Decrease"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-9 text-center text-sm font-semibold text-gray-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity((q) =>
                          safeStock > 0 ? Math.min(safeStock, q + 1) : q + 1,
                        )
                      }
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors border-l border-gray-200"
                      aria-label="Increase"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  {safeStock > 0 && safeStock <= 10 && (
                    <span className="text-xs text-amber-600">
                      {safeStock} available
                    </span>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex sm:flex-col gap-2">
                {isOutOfStock ? (
                  cfg.show_out_of_stock_badge && (
                    <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed select-none">
                      <Package className="w-4 h-4" />
                      Out of stock
                    </div>
                  )
                ) : (
                  <>
                    {(cfg.primary_button === "add_to_cart" ||
                      cfg.show_add_to_cart) && (
                      <button
                        onClick={onAddToCart}
                        disabled={cartLoading || isAddedToCart}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-60 ${
                          isAddedToCart
                            ? "bg-green-600 text-white"
                            : "bg-primary text-white hover:bg-primary/90"
                        }`}
                      >
                        {cartLoading ? (
                          <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        ) : isAddedToCart ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <ShoppingCart className="w-4 h-4" />
                        )}
                        {isAddedToCart
                          ? "Added to cart!"
                          : cfg.add_to_cart_text}
                      </button>
                    )}

                    {cfg.show_buy_now && (
                      <button
                        onClick={onBuyNow}
                        disabled={cartLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 hover:border-primary hover:text-primary hover:bg-primary/[0.03] transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
                      >
                        <Zap className="w-4 h-4" />
                        {cfg.buy_now_text}
                      </button>
                    )}

                    {cfg.show_contact_whatsapp && (
                      <button
                        onClick={() => {
                          const url = buildWhatsAppUrl(
                            cfg.whatsapp,
                            product.name,
                            String(product.code ?? product.id),
                          );
                          if (cfg.whatsapp.open_in_new_tab)
                            window.open(url, "_blank");
                          else window.location.href = url;
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] hover:opacity-90"
                        style={{ background: cfg.whatsapp.button_color }}
                      >
                        <FaWhatsapp className="w-4 h-4" />
                        {cfg.whatsapp_text}
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Secondary row */}
              <div className="flex items-center gap-2">
                {cfg.show_wishlist && (
                  <button
                    onClick={onToggleWishlist}
                    disabled={wishlistLoading}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                      isWishlisted
                        ? "border-red-200 bg-red-50 text-red-500"
                        : "border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500 hover:bg-red-50"
                    } disabled:opacity-50`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 flex-shrink-0 ${isWishlisted ? "fill-red-500" : ""}`}
                    />
                    {isWishlisted ? "Saved" : "Save"}
                  </button>
                )}

                {cfg.show_compare && (
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:border-gray-300 transition-all">
                    <GitCompare className="w-3.5 h-3.5 flex-shrink-0" />
                    Compare
                  </button>
                )}

                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:border-gray-300 transition-all ml-auto">
                  <Share2 className="w-3.5 h-3.5 flex-shrink-0" />
                  Share
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 flex-shrink-0 flex items-center justify-between bg-gray-50/60">
              <p className="text-[11px] text-gray-400">
                {cfg.show_stock && !isOutOfStock && safeStock > 10
                  ? "In stock · ready to ship"
                  : " "}
              </p>
              <Link
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
              >
                View full details
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
    showToast("Inquiry coming soon!", "info");
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
              className="flex items-center gap-1 sm:gap-1.5 mt-1 sm:mt-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              {(cfg.show_add_to_cart ||
                cfg.primary_button === "buy_now" ||
                cfg.primary_button === "whatsapp" ||
                cfg.primary_button === "inquiry") && (
                <div className="flex-1 min-w-0">
                  <PrimaryButton stretch />
                </div>
              )}

              {cfg.show_buy_now &&
                cfg.primary_button === "add_to_cart" &&
                !isOutOfStock && (
                  <button
                    onClick={handleBuyNow}
                    disabled={cartLoading}
                    title={cfg.buy_now_text}
                    className={`flex-shrink-0 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all ${iconPad} disabled:opacity-50`}
                  >
                    <Zap className={buttonSizes.icon} />
                  </button>
                )}

              {cfg.show_wishlist && (
                <button
                  onClick={handleToggleWishlist}
                  disabled={wishlistLoading}
                  title={
                    isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                  }
                  className={`flex-shrink-0 flex items-center justify-center rounded-lg border transition-all ${iconPad} ${
                    isWishlisted
                      ? "border-red-200 bg-red-50 text-red-500"
                      : "border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500 hover:bg-red-50"
                  } disabled:opacity-50`}
                >
                  <Heart
                    className={`${buttonSizes.icon} ${isWishlisted ? "fill-red-500" : ""}`}
                  />
                </button>
              )}

              {cfg.show_contact_whatsapp && !isOutOfStock && (
                <button
                  onClick={handleWhatsApp}
                  title={cfg.whatsapp.button_text}
                  className={`flex-shrink-0 flex items-center justify-center rounded-lg text-white transition-opacity hover:opacity-85 ${iconPad}`}
                  style={{ background: cfg.whatsapp.button_color }}
                >
                  <FaWhatsapp className={buttonSizes.icon} />
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
