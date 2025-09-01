"use client";

import Image from "next/image";
import { ShoppingCart, Heart, Star } from "lucide-react";

interface ProductCardProps {
  id: number;
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
  return (
    <div className="group relative rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* 🖼️ Image */}
      <div className="relative w-full h-64">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* 🏷️ Badge */}
        {badge && (
          <span className="absolute top-3 left-3 bg-primary text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
            {badge}
          </span>
        )}

        {/* ❤️ & 🛒 buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="p-2 bg-white rounded-full shadow hover:bg-red-500 hover:text-white transition">
            <Heart className="w-4 h-4" />
          </button>
          <button className="p-2 bg-white rounded-full shadow hover:bg-primary hover:text-white transition">
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 📦 Info */}
      <div className="p-4 space-y-2">
        <p className="text-xs text-gray-500 uppercase">{category}</p>
        <h3 className="font-semibold text-lg text-gray-800 line-clamp-1 group-hover:text-primary transition">
          {name}
        </h3>

        {/* ⭐ Rating */}
        <div className="flex items-center gap-1 text-yellow-500">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < Math.floor(rating) ? "fill-current" : "stroke-current"
              }`}
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">({rating})</span>
        </div>

        {/* 💲 Price */}
        <div className="flex items-center gap-2">
          <p className="font-bold text-xl text-primary">${price.toFixed(2)}</p>
          {oldPrice && (
            <p className="text-sm text-gray-400 line-through">
              ${oldPrice.toFixed(2)}
            </p>
          )}
          {discount && (
            <span className="text-xs font-semibold text-green-600">
              -{discount}%
            </span>
          )}
        </div>

        {/* 📦 Stock Status */}
        <p
          className={`text-sm font-medium ${
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
    </div>
  );
}
