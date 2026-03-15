import { CardConfig, ProductCardProps } from "@/types/ProductCard";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatPrice, getCategoryName, getImageUrl } from "../helper";
import Link from "next/link";
import Image from "next/image";
import {
  Barcode, Check, ChevronLeft, ChevronRight, GitCompare, Heart,
  ImageOff, Minus, Package, Plus, Share2, ShoppingCart, Star,
  X, Zap, ZoomIn, Copy, CheckCheck,
} from "lucide-react";
import { buildWhatsAppUrl } from "./Shared";
import { FaWhatsapp } from "react-icons/fa";

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

// ─── Share Sheet ──────────────────────────────────────────────────────────────
function ShareSheet({
  url,
  title,
  onClose,
}: {
  url: string;
  title: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const el = document.createElement("input");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareTargets = [
    {
      label: "WhatsApp",
      color: "#25D366",
      href: `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    {
      label: "Facebook",
      color: "#1877F2",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      label: "X / Twitter",
      color: "#000000",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.857-8.156-10.643h7.078l4.264 5.641 5.578-5.641zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: "Telegram",
      color: "#26A5E4",
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="absolute inset-0 z-10 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-[1px] rounded-b-2xl sm:rounded-2xl"
      onClick={onClose}>
      <div
        className="bg-white w-full sm:w-auto sm:min-w-[320px] sm:mx-4 rounded-t-2xl sm:rounded-2xl p-5 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Share product</h3>
          <button onClick={onClose}
            className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X className="w-3 h-3 text-gray-500" />
          </button>
        </div>

        {/* Social buttons */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {shareTargets.map(t => (
            <a key={t.label} href={t.href} target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 group">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-transform group-hover:scale-105"
                style={{ background: t.color }}>
                {t.icon}
              </div>
              <span className="text-[9px] text-gray-500 font-medium">{t.label}</span>
            </a>
          ))}
        </div>

        {/* Copy link row */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
          <span className="flex-1 text-xs text-gray-500 truncate">{url}</span>
          <button onClick={handleCopy}
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all shrink-0 ${
              copied
                ? "bg-green-100 text-green-700"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
            }`}>
            {copied
              ? <><CheckCheck className="w-3 h-3" />Copied!</>
              : <><Copy className="w-3 h-3" />Copy</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function QuickViewModal({
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
  const [shareOpen, setShareOpen] = useState(false);
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

  const productUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/product/${product.slug}`
      : `/product/${product.slug}`;

  const handleShare = async () => {
    // Use native share sheet on supported mobile browsers
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url: productUrl });
        return;
      } catch {
        // user cancelled or not supported — fall through to sheet
      }
    }
    setShareOpen(true);
  };

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
      if (e.key === "Escape") {
        if (shareOpen) { setShareOpen(false); return; }
        onClose();
      }
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
  }, [isOpen, imageList.length, onClose, shareOpen]);

  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      setQuantity(1);
      setImageError(false);
      setShareOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-[2px]"
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
        {/* Share sheet overlay — sits inside the modal */}
        {shareOpen && (
          <ShareSheet
            url={productUrl}
            title={product.name}
            onClose={() => setShareOpen(false)}
          />
        )}

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
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
          <div className="sm:w-[42%] shrink-0 flex flex-col bg-gray-50 border-r border-gray-100">
            <div className="relative flex-1 min-h-55 sm:min-h-0 overflow-hidden">
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
                    onClick={() => setCurrentImageIndex((i) => Math.max(0, i - 1))}
                    disabled={currentImageIndex === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 disabled:opacity-25 transition-all shadow-sm"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((i) => Math.min(imageList.length - 1, i + 1))}
                    disabled={currentImageIndex === imageList.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 disabled:opacity-25 transition-all shadow-sm"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

            {imageList.length > 1 && (
              <div className="flex gap-1.5 p-2.5 overflow-x-auto border-t border-gray-100 shrink-0">
                {imageList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setCurrentImageIndex(idx); setImageError(false); }}
                    className={`shrink-0 w-11 h-11 rounded-lg overflow-hidden border-[1.5px] transition-all bg-white ${
                      idx === currentImageIndex
                        ? "border-primary shadow-sm"
                        : "border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100"
                    }`}
                    aria-label={`Image ${idx + 1}`}
                  >
                    <Image src={img} alt="" width={44} height={44} className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Info panel ── */}
          <div className="sm:w-[58%] flex flex-col overflow-y-auto">
            <div className="flex flex-col gap-4 p-5 flex-1">
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
                    <Barcode className="w-3 h-3 shrink-0" />
                    {product.code ?? product.id}
                  </p>
                )}
              </div>

              {cfg.show_rating && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${
                        safeRating > 0 && i < Math.floor(safeRating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-200"
                      }`} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">
                    {safeRating > 0 ? `${safeRating.toFixed(1)} rating` : "No reviews yet"}
                  </span>
                </div>
              )}

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

              <div className="border-t border-gray-100" />

              {!isOutOfStock && (
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Quantity
                  </span>
                  <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors border-r border-gray-200"
                      aria-label="Decrease">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-9 text-center text-sm font-semibold text-gray-900">{quantity}</span>
                    <button onClick={() => setQuantity((q) => safeStock > 0 ? Math.min(safeStock, q + 1) : q + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors border-l border-gray-200"
                      aria-label="Increase">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  {safeStock > 0 && safeStock <= 10 && (
                    <span className="text-xs text-amber-600">{safeStock} available</span>
                  )}
                </div>
              )}

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
                    {(cfg.primary_button === "add_to_cart" || cfg.show_add_to_cart) && (
                      <button onClick={onAddToCart} disabled={cartLoading || isAddedToCart}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-60 ${
                          isAddedToCart ? "bg-green-600 text-white" : "bg-primary text-white hover:bg-primary/90"
                        }`}>
                        {cartLoading
                          ? <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                          : isAddedToCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                        {isAddedToCart ? "Added to cart!" : cfg.add_to_cart_text}
                      </button>
                    )}
                    {cfg.show_buy_now && (
                      <button onClick={onBuyNow} disabled={cartLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 hover:border-primary hover:text-primary hover:bg-primary/3 transition-all duration-200 active:scale-[0.98] disabled:opacity-60">
                        <Zap className="w-4 h-4" />
                        {cfg.buy_now_text}
                      </button>
                    )}
                    {cfg.show_contact_whatsapp && (
                      <button
                        onClick={() => {
                          const url = buildWhatsAppUrl(cfg.whatsapp, product.name, String(product.code ?? product.id));
                          if (cfg.whatsapp.open_in_new_tab) window.open(url, "_blank");
                          else window.location.href = url;
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] hover:opacity-90"
                        style={{ background: cfg.whatsapp.button_color }}>
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
                  <button onClick={onToggleWishlist} disabled={wishlistLoading}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                      isWishlisted
                        ? "border-red-200 bg-red-50 text-red-500"
                        : "border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500 hover:bg-red-50"
                    } disabled:opacity-50`}>
                    <Heart className={`w-3.5 h-3.5 shrink-0 ${isWishlisted ? "fill-red-500" : ""}`} />
                    {isWishlisted ? "Saved" : "Save"}
                  </button>
                )}
                {cfg.show_compare && (
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:border-gray-300 transition-all">
                    <GitCompare className="w-3.5 h-3.5 shrink-0" />
                    Compare
                  </button>
                )}

                {/* ── Functional Share button ── */}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:border-gray-300 hover:text-gray-700 transition-all ml-auto"
                  aria-label="Share product"
                >
                  <Share2 className="w-3.5 h-3.5 shrink-0" />
                  Share
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 shrink-0 flex items-center justify-between bg-gray-50/60">
              <p className="text-[11px] text-gray-400">
                {cfg.show_stock && !isOutOfStock && safeStock > 10 ? "In stock · ready to ship" : " "}
              </p>
              <Link href={`/product/${product.slug}`} onClick={onClose}
                className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1">
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