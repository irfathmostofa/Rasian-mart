"use client";

import Image from "next/image";
import { ShoppingCart, Heart, Star, ImageOff } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/app/store/useCart";

interface ProductCardProps {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  image?: string;
  badge?: string;
  stock?: number;
  rating?: number;
  type?: "card" | "contact";
}

export default function ProductCardFour({
  id,
  name,
  category,
  price,
  oldPrice,
  discount,
  image,
  badge,
  stock = 10,
  rating = 4.5,
  type = "card",
}: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <div
      className={`group flex flex-col justify-between rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 w-full max-w-xs mx-auto `}
    >
      {/* 🖼️ Image Section */}
      <Link href={`/product/${id}`}>
        <div className="w-full h-48 sm:h-56 md:h-64 overflow-hidden flex items-center justify-center bg-gray-50">
          {image ? (
            <Image
              src={image}
              alt={name}
              width={300}
              height={300}
              className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-105"
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
        <div className="flex items-center justify-between">
          <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide">
            {category}
          </p>
          <button
            className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-red-500 hover:text-white shadow-sm transition cursor-pointer"
            aria-label="Add to wishlist"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>
        <Link href={`/product/${id}`}>
          <h3 className="font-semibold text-base sm:text-lg text-gray-800 line-clamp-1 group-hover:text-primary transition">
            {name}
          </h3>
        </Link>
        {/* ⭐ Rating */}
        <div className="flex items-center gap-1 text-yellow-500">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 sm:w-4 sm:h-4 ${
                i < Math.floor(rating) ? "fill-current" : "stroke-current"
              }`}
            />
          ))}
          <span className="text-[10px] sm:text-xs text-gray-500 ml-1">
            ({rating.toFixed(1)})
          </span>
        </div>

        {/* 💲 Price */}
        <div className="flex items-center gap-2">
          <p className="font-bold text-primary text-sm sm:text-base">
            ৳ {price.toFixed(2)}
          </p>
          {oldPrice && (
            <p className="text-xs sm:text-sm text-gray-400 line-through">
              ৳ {oldPrice.toFixed(2)}
            </p>
          )}
          {discount && (
            <span className="text-[10px] sm:text-xs font-semibold text-green-600">
              -{discount}%
            </span>
          )}
        </div>
      </div>

      {/* ⚙️ Action Buttons */}
      <div className="flex items-center justify-between px-4 pb-4 pt-2">
        <p
          className={`text-xs sm:text-sm font-medium ${
            stock > 5
              ? "text-green-600"
              : stock > 0
              ? "text-orange-500"
              : "text-red-600"
          }`}
        >
          {stock > 5
            ? "In Stock"
            : stock > 0
            ? `Only ${stock} left!`
            : "Out of Stock"}
        </p>

        <div className="flex items-center gap-2">
          {type === "card" ? (
            <>
              <button
                onClick={() =>
                  addToCart({
                    id,
                    name,
                    price,
                    image: image ?? "",
                    quantity: 1,
                  })
                }
                className="p-2 rounded-full flex items-center gap-1 bg-gray-50 text-gray-800 hover:bg-primary hover:text-white shadow-sm transition  cursor-pointer text-[14px]"
                aria-label="Add to cart"
              >
                <ShoppingCart className="w-5 h-4" />
                Add to Cart
              </button>
            </>
          ) : (
            <>
              <button
                className="p-2 rounded-full bg-gray-50 text-gray-800 hover:bg-primary hover:text-white shadow-sm transition  cursor-pointer"
                aria-label="Contact now"
              >
                Contact Now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
