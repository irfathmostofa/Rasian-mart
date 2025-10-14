"use client";
import Image from "next/image";
import { ShoppingCart, Heart, Star, ImageOff } from "lucide-react";
import { ProductCardProps } from "@/types/ProductCard";
import { formatPrice, getCategoryName, getImageUrl } from "@/components/helper";
import Link from "next/link";
import { useCart } from "@/app/store/useCart";
import { useState } from "react";

export function PremiumProductCard({
  id,
  name,
  categories,
  selling_price,
  cost_price,
  badge,
  total_stock,
  rating,
  images,
  type = "card",
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const imageUrl = getImageUrl(images);
  const categoryName = getCategoryName(categories);
  const price = formatPrice(selling_price);
  const oldPrice = cost_price ? formatPrice(cost_price) : undefined;
  const safeRating = typeof rating === "number" ? rating : 0;
  const safeStock =
    typeof total_stock === "string" ? parseInt(total_stock) : total_stock || 0;
  const { addToCart } = useCart();

  return (
    <div className="group flex flex-col justify-between rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 w-full max-w-xs mx-auto">
      {/* Image */}

      <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden flex items-center justify-center bg-gray-50">
        <Link href={`/product/${id}`}>
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
        </Link>
        {badge && (
          <span className="absolute top-3 left-3 bg-black text-white text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full shadow-md">
            {badge}
          </span>
        )}

        {/* Hover buttons */}
        <div className="absolute top-2 right-2 flex gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="p-1 sm:p-2 bg-white rounded-full shadow hover:bg-red-500 hover:text-white transition"
          >
            <Heart
              className={`w-3 h-3 sm:w-4 sm:h-4 ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </button>
          <button
            onClick={() =>
              addToCart({
                id: id,
                name: name,
                price: Number(selling_price) || 0,
                image: imageUrl,
                quantity: 1,
              })
            }
            className="p-1 sm:p-2 bg-white rounded-full shadow hover:bg-blue-500  transition"
          >
            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-gray-500 mb-1">{categoryName}</p>
        <Link href={`/product/${id}`}>
          <h3 className="truncate text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 mb-2 hover:text-blue-600 transition">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        {safeRating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                  i < Math.floor(safeRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">
              ({safeRating.toFixed(1)})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <p className="text-lg sm:text-xl font-bold text-blue-600">
            ৳ {price}
          </p>
          {oldPrice && (
            <p className="text-xs sm:text-sm text-gray-400 line-through">
              ৳ {oldPrice}
            </p>
          )}
        </div>

        {/* Stock Status */}
        {safeStock !== undefined && (
          <div className="mb-3">
            <p
              className={`text-xs font-medium ${
                safeStock > 5
                  ? "text-green-600"
                  : safeStock > 0
                  ? "text-orange-600"
                  : "text-red-600"
              }`}
            >
              {safeStock > 5
                ? "In Stock"
                : safeStock > 0
                ? `Only ${safeStock} left`
                : "Out of Stock"}
            </p>
          </div>
        )}

        {type === "card" ? (
          <button
            onClick={() =>
              addToCart({
                id: id,
                name: name,
                price: Number(selling_price) || 0,
                image: imageUrl,
                quantity: 1,
              })
            }
            className="w-full bg-black text-white py-2 rounded font-medium text-sm hover:bg-gray-800 transition"
          >
            Add to Cart
          </button>
        ) : (
          <button className="w-full bg-black text-white py-2 rounded font-medium text-sm hover:bg-gray-800 transition">
            Contact Now
          </button>
        )}
      </div>
    </div>
  );
}
