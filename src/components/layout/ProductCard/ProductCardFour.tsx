"use client";

import Image from "next/image";
import { ShoppingCart, Heart, Star, ImageOff, Tag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/app/store/useCart";

interface ProductCardProps {
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

export default function ProductCardFour({
  id,
  name,
  categories = [],
  selling_price,
  cost_price,
  badge,
  total_stock = 0,
  rating,
  images,
  type = "card",
}: ProductCardProps) {
  const { addToCart } = useCart();

  // 🖼️ Primary or fallback image
  const imageUrl =
    images?.find((img) => img.is_primary)?.url || images?.[0]?.url || null;

  // 🏷️ Category chips (show all)
  const categoryChips = categories.length
    ? [
        <span
          key={categories.at(-1)?.id}
          className="text-[10px] sm:text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full border border-gray-200"
        >
          {categories.at(-1)?.name}
        </span>,
      ]
    : [
        <span
          key="uncategorized"
          className="text-[10px] sm:text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full border border-gray-200"
        >
          Uncategorized
        </span>,
      ];

  // 💰 Safe conversions
  const safePrice = Number(selling_price) || 0;
  const safeOldPrice = Number(cost_price) || 0;
  const safeStock = Number(total_stock) || 0;
  const safeRating = Number(rating) || 0;

  return (
    <div className="group flex flex-col justify-between rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 w-full max-w-xs mx-auto">
      {/* 🖼️ Image Section */}
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

      {/* 📦 Info */}
      <div className="p-4 space-y-2 sm:space-y-3">
        {/* 🏷️ Category Chips */}
        <div className="flex flex-wrap items-center gap-1 mb-1">
          <Tag className="w-3 h-3 text-gray-400" />
          {categoryChips}
        </div>

        <Link href={`/product/${id}`}>
          <h3 className="font-semibold text-base sm:text-lg text-gray-800 line-clamp-1 group-hover:text-primary transition">
            {name}
          </h3>
        </Link>

        {/* ⭐ Rating */}
        {safeRating > 0 && (
          <div className="flex items-center gap-1 text-yellow-500">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 sm:w-4 sm:h-4 ${
                  i < Math.floor(safeRating) ? "fill-current" : "stroke-current"
                }`}
              />
            ))}
            <span className="text-[10px] sm:text-xs text-gray-500 ml-1">
              ({safeRating.toFixed(1)})
            </span>
          </div>
        )}

        {/* 💲 Price */}
        <div className="flex items-center gap-2">
          <p className="font-bold text-primary text-sm sm:text-base">
            ৳ {safePrice.toFixed(2)}
          </p>
          {safeOldPrice > safePrice && (
            <p className="text-xs sm:text-sm text-gray-400 line-through">
              ৳ {safeOldPrice.toFixed(2)}
            </p>
          )}
        </div>
      </div>

      {/* ⚙️ Action Buttons */}
      <div className="flex items-center justify-between px-4 pb-4 pt-2">
        <p
          className={`text-xs sm:text-sm font-medium ${
            safeStock > 5
              ? "text-green-600"
              : safeStock > 0
              ? "text-orange-500"
              : "text-red-600"
          }`}
        >
          {safeStock > 5
            ? "In Stock"
            : safeStock > 0
            ? `Only ${safeStock} left!`
            : "Out of Stock"}
        </p>

        <div className="flex items-center gap-2">
          {type === "card" ? (
            <button
              onClick={() =>
                addToCart({
                  id,
                  name,
                  price: safePrice,
                  image: imageUrl ?? "",
                  quantity: 1,
                })
              }
              className="p-2 rounded-full flex items-center gap-1 bg-gray-50 text-gray-800 hover:bg-primary hover:text-white shadow-sm transition cursor-pointer text-[14px]"
              aria-label="Add to cart"
            >
              <ShoppingCart className="w-5 h-4" />
              Add to Cart
            </button>
          ) : (
            <button
              className="p-2 rounded-full bg-gray-50 text-gray-800 hover:bg-primary hover:text-white shadow-sm transition cursor-pointer"
              aria-label="Contact now"
            >
              Contact Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
