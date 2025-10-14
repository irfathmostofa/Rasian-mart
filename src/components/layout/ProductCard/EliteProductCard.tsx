"use client";
import { ShoppingCart, Heart, Star, ImageOff, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/store/useCart";
import { ProductCardProps } from "@/types/ProductCard";
import { useState } from "react";
import { formatPrice, getCategoryName, getImageUrl } from "@/components/helper";

export function EliteProductCard({
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

  const discount = oldPrice
    ? Math.round(
        ((parseFloat(oldPrice) - parseFloat(price)) / parseFloat(oldPrice)) *
          100
      )
    : 0;

  return (
    <div className="group flex flex-col justify-between rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 w-full max-w-xs mx-auto">
      {/* Image */}
      <Link href={`/product/${id}`}>
        <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden flex items-center justify-center bg-gray-50">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              width={300}
              height={300}
              className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-110"
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
            <span className="absolute top-3 left-3 bg-black text-white text-[10px] sm:text-xs font-semibold px-3 py-2 rounded-full shadow-md">
              {badge}
            </span>
          )}

          {/* Discount Badge */}
          {discount > 0 && (
            <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded shadow-md">
              -{discount}%
            </span>
          )}

          {/* Hover buttons */}
          <div className="absolute bottom-0 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300 mb-2">
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="flex-1 p-2 bg-white rounded-lg shadow hover:bg-red-50 transition flex items-center justify-center gap-1"
            >
              <Heart
                className={`w-4 h-4 ${
                  isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
                }`}
              />
              <span className="text-xs text-gray-700 hidden sm:inline">
                {isWishlisted ? "Saved" : "Save"}
              </span>
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
              className="flex-1 p-2 bg-white rounded-lg shadow hover:bg-blue-50 transition flex items-center justify-center gap-1"
            >
              <ShoppingCart className="w-4 h-4 text-gray-600" />
              <span className="text-xs text-gray-700 hidden sm:inline">
                Quick
              </span>
            </button>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-gray-500 mb-1">{categoryName}</p>
        <Link href={`/product/${id}`}>
          <h3 className="truncate text-sm trancet sm:text-base font-bold text-gray-900 line-clamp-2 mb-2 hover:text-gray-800 transition">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        {safeRating > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center">
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
            </div>
            <span className="text-xs font-semibold text-gray-700">
              {safeRating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">(Elite)</span>
          </div>
        )}

        {/* Price */}
        <div className="bg-gray-50 rounded-lg p-2.5 mb-3">
          <div className="flex items-baseline gap-2 mb-1">
            <p className="text-lg sm:text-xl font-bold text-gray-800">
              ৳ {price}
            </p>
            {oldPrice && (
              <p className="text-xs sm:text-sm text-gray-400 line-through">
                ৳ {oldPrice}
              </p>
            )}
          </div>
          {discount > 0 && (
            <p className="text-xs text-green-600 font-semibold">
              Save ৳ {(parseFloat(oldPrice!) - parseFloat(price)).toFixed(2)}
            </p>
          )}
        </div>

        {/* Stock Status */}
        {safeStock !== undefined && (
          <div className="flex items-center justify-between mb-3">
            <p
              className={`text-xs font-semibold ${
                safeStock > 5
                  ? "text-green-600"
                  : safeStock > 0
                  ? "text-orange-600"
                  : "text-red-600"
              }`}
            >
              {safeStock > 5
                ? "Premium Stock"
                : safeStock > 0
                ? `${safeStock} units left`
                : "Sold Out"}
            </p>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(safeStock, 3) }, (_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-green-500" />
              ))}
            </div>
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
