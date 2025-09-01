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

export default function ProductCardTWO({
  id,
  name,
  category,
  price,
  image,
  badge,
}: ProductCardProps) {
  return (
    <div className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gray-50 shadow-md hover:shadow-xl transition-all duration-300">
      {/* 🖼️ Image */}
      <div className="relative w-full h-72">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* 🏷️ Badge */}
        {badge && (
          <span className="absolute top-4 left-4 bg-black/80 text-white text-xs font-semibold px-3 py-1 rounded-full tracking-wide uppercase">
            {badge}
          </span>
        )}

        {/* 🌫️ Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end">
          <div className="p-4 flex justify-between items-center">
            <button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-medium text-sm hover:bg-primary hover:text-white transition">
              <ShoppingCart className="w-4 h-4" /> Quick Add
            </button>
            <button className="p-2 bg-white rounded-full shadow hover:bg-red-500 hover:text-white transition">
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 📦 Info */}
      <div className="p-4 text-center">
        <h3 className="font-semibold text-lg text-gray-800 group-hover:text-primary transition line-clamp-1">
          {name}
        </h3>
        <p className="text-sm text-gray-500">{category}</p>
        <p className="font-bold text-xl mt-2">${price.toFixed(2)}</p>
      </div>
    </div>
  );
}
