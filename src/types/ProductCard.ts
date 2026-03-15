// In types/ProductCard.ts, ensure the interface matches:
export interface ProductCardProps {
  id: number;
  primary_variant_id: number;
  name: string;
  slug: string;
  categories?: {
    id: number;
    name: string;
    slug?: string;
    code: string;
    image: string | null;
    is_primary: boolean;
  }[];
  selling_price: string | number;
  regular_price: string | number;
  badge?: string | null;
  total_stock?: string | number;
  rating?: number | null;
  images?:
    | {
        id: number;
        url: string;
        alt_text: string;
        is_primary: boolean;
      }[]
    | null;
  code?: string;
  cardStyle?: any;
  badgeIcon?: string;
  badgeColor?: string;
}

export interface WhatsAppConfig {
  number: string;
  button_color: string;
  button_text: string;
  message: string;
  message_bn: string;
  show_seller_number: boolean;
  open_in_new_tab: boolean;
}
export interface CardConfig {
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
