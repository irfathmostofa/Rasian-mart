// components/ProductCard/index.tsx
"use client";

import { useThemeData } from "@/app/store/useThemeData";
import { CardConfig, ProductCardProps } from "@/types/ProductCard";
import { useState } from "react";

import { QuickViewModal } from "./QuickViewModal";
import { SimpleProductCard } from "./Simpleproductcard";
import { MinimalProductCard } from "./MinimalProductCard";
import { DetailedProductCard } from "./Detailedproductcard";
import { HoverEffectProductCard } from "./Hovereffectproductcard";
import { ModernProductCard } from "./Modernproductcard";

// ─── Default config (merged with server response) ─────────────────────────────
function buildCfg(raw: Partial<CardConfig>): CardConfig {
  return {
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
}

// ─── Layout registry ──────────────────────────────────────────────────────────
// To add a new layout: import the component above and add one line here.
type CardComponent = React.ComponentType<
  ProductCardProps & { cfg: CardConfig; onQuickView?: () => void }
>;

// MinimalProductCard manages its own config internally via useThemeData.
// This wrapper satisfies the CardComponent signature without changing the original.
const MinimalProductCardWrapper: CardComponent = (props) => (
  <MinimalProductCard {...props} />
);

const CARD_REGISTRY: Record<string, CardComponent> = {
  simple: SimpleProductCard,
  minimal: MinimalProductCardWrapper,
  default: MinimalProductCardWrapper,
  detailed: DetailedProductCard,
  "hover-effect": HoverEffectProductCard,
  modern: ModernProductCard,
};

// ─── Main export ──────────────────────────────────────────────────────────────
export function ProductCard(
  props: ProductCardProps & { cardStyle?: React.CSSProperties },
) {
  const raw = (useThemeData("product_card") ?? {}) as Partial<CardConfig>;
  const cfg = buildCfg(raw);
  const layout = cfg.layout ?? "minimal";

  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const LayoutCard = CARD_REGISTRY[layout] ?? MinimalProductCardWrapper;

  return (
    <>
      {cfg.quick_view && (
        <QuickViewModal
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
          product={props}
          cfg={cfg}
          onAddToCart={() => {}}
          onBuyNow={() => {}}
          onToggleWishlist={() => {}}
          isWishlisted={false}
          cartLoading={false}
          wishlistLoading={false}
          isAddedToCart={false}
        />
      )}

      <LayoutCard
        {...props}
        cfg={cfg}
        onQuickView={
          cfg.quick_view ? () => setIsQuickViewOpen(true) : undefined
        }
      />
    </>
  );
}

// ─── Named re-exports for direct use ─────────────────────────────────────────
export { SimpleProductCard } from "./Simpleproductcard";
export { DetailedProductCard } from "./Detailedproductcard";
export { HoverEffectProductCard } from "./Hovereffectproductcard";
export { ModernProductCard } from "./Modernproductcard";
export { MinimalProductCard } from "./MinimalProductCard";
