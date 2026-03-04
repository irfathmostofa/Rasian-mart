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

export async function uploadImageToCloudinary(file: File): Promise<string> {
  if (!file) throw new Error("No file provided");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ims-image"); // must be unsigned preset in Cloudinary

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/dxefvhcfy/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    console.error("Cloudinary upload error:", errData);
    throw new Error(errData.error?.message || "Image upload failed");
  }

  const data = await res.json();
  return data.secure_url as string;
}

