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
