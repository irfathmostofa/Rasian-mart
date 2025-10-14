export const getImageUrl = (
  images?:
    | { id: number; url: string; alt_text: string; is_primary: boolean }[]
    | null
): string => {
  if (!images || images.length === 0) return "";
  const primary = images.find((img) => img.is_primary);
  return primary?.url || images[0]?.url || "";
};

// Helper to get category name
export const getCategoryName = (
  categories?: {
    id: number;
    name: string;
    slug?: string;
    code: string;
    image: string | null;
    is_primary: boolean;
  }[]
): string => {
  if (!categories || categories.length === 0) return "Uncategorized";
  const primary = categories.find((cat) => cat.is_primary);
  return primary?.name || categories[0]?.name || "Uncategorized";
};

// Helper to convert price
export const formatPrice = (price: string | number): string => {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return isNaN(num) ? "0.00" : num.toFixed(2);
};
