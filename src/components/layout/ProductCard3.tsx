"use client";

import Image from "next/image";
import { ShoppingCart, Heart, Star } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/app/store/useCart";

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  image: string;
  badge?: string;
  stock?: number;
  rating?: number;
}

export default function ProductCardThree({
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
}: ProductCardProps) {
  const { addToCart } = useCart();
  return (
    <div className="group relative rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 w-full max-w-xs mx-auto">
      {/* 🖼️ Image */}
      <div className="relative w-full h-40 sm:h-48 md:h-56 py-2">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* 🏷️ Badge */}
        {badge && (
          <span className="absolute top-2 left-2 bg-primary text-white text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full shadow-md">
            {badge}
          </span>
        )}

        {/* ❤️ & 🛒 buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="p-1 sm:p-2 bg-white rounded-full shadow hover:bg-red-500 hover:text-white transition">
            <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => addToCart({ id, name, price, image, quantity: 1 })}
            className="p-1 sm:p-2 bg-white rounded-full shadow hover:bg-primary hover:text-white transition"
          >
            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* 📦 Info */}
      <Link href={`/product/${id}`}>
        <div className="p-3 sm:p-4 space-y-1 sm:space-y-2">
          <p className="text-[9px] sm:text-xs text-gray-400 uppercase">
            {category}
          </p>
          <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-800 line-clamp-1 group-hover:text-primary transition">
            {name}
          </h3>

          {/* ⭐ Rating */}
          <div className="flex items-center gap-0.5 sm:gap-1 text-yellow-500">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 sm:w-4 sm:h-4 ${
                  i < Math.floor(rating) ? "fill-current" : "stroke-current"
                }`}
              />
            ))}
            <span className="text-[8px] sm:text-xs text-gray-500 ml-1">
              ({rating})
            </span>
          </div>

          {/* 💲 Price */}
          <div className="flex items-center gap-1 sm:gap-2">
            <p className="font-bold text-base sm:text-lg md:text-xl text-primary">
              ৳ {price.toFixed(2)}
            </p>
            {oldPrice && (
              <p className="text-[10px] sm:text-sm text-gray-400 line-through">
                ৳ {oldPrice.toFixed(2)}
              </p>
            )}
            {discount && (
              <span className="text-[9px] sm:text-xs font-semibold text-green-600">
                -{discount}%
              </span>
            )}
          </div>

          {/* 📦 Stock Status */}
          <p
            className={`text-[10px] sm:text-sm font-medium ${
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
        </div>
      </Link>
    </div>
  );
}
