"use client";

import Image from "next/image";
import { ShoppingCart, Heart } from "lucide-react";

interface ProductCardProps {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  badge?: string;
}

export default function ProductCard({
  id,
  name,
  category,
  price,
  image,
  badge,
}: ProductCardProps) {
  return (
    <div className="group relative rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300">
      {/* 🖼️ Product Image */}
      <div className="relative w-full h-64">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* 🏷️ Badge */}
        {badge && (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
            {badge}
          </span>
        )}

        {/* ❤️ Wishlist + 🛒 Cart buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="p-2 bg-white/90 backdrop-blur rounded-full shadow hover:bg-primary hover:text-white transition">
            <Heart className="w-4 h-4" />
          </button>
          <button className="p-2 bg-white/90 backdrop-blur rounded-full shadow hover:bg-primary hover:text-white transition">
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 📦 Info Section */}
      <div className="p-4">
        <p className="text-sm text-gray-500">{category}</p>
        <h3 className="font-semibold text-lg text-gray-800 truncate group-hover:text-primary transition">
          {name}
        </h3>
        <p className="font-bold text-xl mt-1 text-primary">
          ${price.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
