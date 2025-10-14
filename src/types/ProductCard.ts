export interface ProductCardProps {
  id: number;
  name: string;
  categories?: {
    id: number;
    name: string;
    slug?: string;
    code: string;
    image: string | null;
    is_primary: boolean;
  }[];
  selling_price: string | number;
  cost_price?: string | number;
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
  type?: "card" | "contact";
}
