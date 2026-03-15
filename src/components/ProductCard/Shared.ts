// components/ProductCard/shared.ts
// ─── Shared utilities used by every card layout ────────────────────────────

import { CardConfig, ProductCardProps } from "@/types/ProductCard";

export const ASPECT: Record<string, string> = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
};

/** Derive all commonly-used numeric/boolean values from raw props + config */
export function deriveCardValues(props: ProductCardProps, cfg: CardConfig) {
  const sellingPrice = Number(props.selling_price) || 0;
  const regularPrice = Number(props.regular_price) || 0;
  const safeRating =
    props.rating != null ? parseFloat(String(props.rating)) || 0 : 0;
  const safeStock =
    typeof props.total_stock === "string"
      ? parseFloat(props.total_stock)
      : (props.total_stock ?? 0);
  const isOutOfStock = safeStock <= 0;
  const hasDiscount = regularPrice > 0 && regularPrice > sellingPrice;
  const discountPct = hasDiscount
    ? Math.round(((regularPrice - sellingPrice) / regularPrice) * 100)
    : 0;
  const isLowStock = !isOutOfStock && safeStock > 0 && safeStock <= 10;

  const getDisplayBadge = () => {
    if (!props.badge) return null;
    if (props.badge === "Best Seller" && !cfg.show_bestseller_badge)
      return null;
    if (props.badge === "Featured" && !cfg.show_featured_badge) return null;
    if (props.badge === "New" && !cfg.show_new_badge) return null;
    return props.badge;
  };

  return {
    sellingPrice,
    regularPrice,
    safeRating,
    safeStock,
    isOutOfStock,
    hasDiscount,
    discountPct,
    isLowStock,
    displayBadge: getDisplayBadge(),
  };
}

export function buildWhatsAppUrl(
  cfg: CardConfig["whatsapp"],
  productName: string,
  sku: string,
): string {
  const message = cfg.message_bn || cfg.message;
  const msg = message
    .replace("{product_name}", productName)
    .replace("{sku}", sku);
  return `https://wa.me/${cfg.number}?text=${encodeURIComponent(msg)}`;
}
