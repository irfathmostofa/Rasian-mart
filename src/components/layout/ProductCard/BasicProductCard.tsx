"use client";
import Image from "next/image";
import { ShoppingCart, Heart, ImageOff } from "lucide-react";
import { ProductCardProps } from "@/types/ProductCard";
import { formatPrice, getCategoryName, getImageUrl } from "@/components/helper";
import { useCart } from "@/app/store/useCart";
import Link from "next/link";
export function BasicProductCard({
  id,
  name,
  categories,
  selling_price,
  badge,
  images,
  type = "card",
}: ProductCardProps) {
  const imageUrl = getImageUrl(images);
  const categoryName = getCategoryName(categories);
  const price = formatPrice(selling_price);
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden">
      {/* Image */}
      <Link href={`/product/${id}`}>
        <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden flex items-center justify-center bg-gray-50">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              width={300}
              height={300}
              className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/400";
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <ImageOff className="w-8 h-8 sm:w-10 sm:h-10 mb-2" />
              <p className="text-xs sm:text-sm">No Image</p>
            </div>
          )}

          {badge && (
            <span className="absolute top-3 left-3 bg-primary text-white text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full shadow-md">
              {badge}
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-gray-500 mb-1">{categoryName}</p>
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 mb-2 truncate">
          {name}
        </h3>
        <p className="text-lg sm:text-xl font-bold text-gray-800 mb-3">
          ৳ {price}
        </p>
        {type === "card" ? (
          <button
            onClick={() =>
              addToCart({
                id,
                name,
                price: Number(selling_price),
                image: imageUrl ?? "",
                quantity: 1,
              })
            }
            className="w-full bg-black text-white py-2 rounded font-medium text-sm hover:bg-gray-800  transition"
          >
            Add to Cart
          </button>
        ) : (
          <button className="w-full bg-green-600 text-white py-2 rounded font-medium text-sm hover:bg-green-700 transition">
            Contact Now
          </button>
        )}
      </div>
    </div>
  );
}
