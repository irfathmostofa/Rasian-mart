// types/sections.ts
export interface Banner {
  image: string;
  title: string;
  title_bn?: string;
  subtitle: string;
  subtitle_bn?: string;
  button_text: string;
  button_text_bn?: string;
  link: string;
  size: "full" | "half" | "third" | "quarter";
  text_position: "left" | "center" | "right";
  text_color: string;
  overlay_opacity: number;
  button_color: string;
}

export interface Brand {
  name: string;
  name_bn?: string;
  logo: string;
  link: string;
}

export interface Section {
  id: string;
  type:
    | "category_grid"
    | "featured_products"
    | "banner"
    | "featured_brands"
    | "recent_products"
    | "best_sellers";
  title: string;
  title_bn?: string;
  status: boolean;
  layout?: "grid" | "slider";
  columns?: number;
  grid_columns?: number;
  categoryids?: number[];
  banner_image?: string;
  banners?: Banner[];
  brands?: Brand[];
  show_images?: boolean;
  bg_color?: string;
  text_color?: string;
  padding?: string;
  margin?: string;
  border_radius?: string;
  products_count?: number;
  days?: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  images?: { url: string }[];
  [key: string]: any;
}
