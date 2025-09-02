"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingCart, Heart, Star, Truck, RefreshCw } from "lucide-react";

export default function ProductDetailsPage() {
  // Dummy product (later: fetch via params)
  const product = {
    id: 1,
    name: "Smart Watch Pro",
    category: "Electronics",
    description:
      "The Smart Watch Pro is your ultimate companion for fitness, notifications, and daily productivity. Featuring a sleek design, water resistance, and up to 7 days of battery life.",
    price: 199,
    oldPrice: 299,
    discount: 30,
    stock: 12,
    rating: 4.7,
    sizes: ["S", "M", "L", "XL"],
    colors: ["black", "blue", "red"],
    images: [
      "https://picsum.photos/600/600?random=201",
      "https://picsum.photos/600/600?random=202",
      "https://picsum.photos/600/600?random=203",
    ],
  };

  // States
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* 🖼️ Product Images */}
      <div className="space-y-4">
        <div className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-md">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex gap-4">
          {product.images.map((img, i) => (
            <div
              key={i}
              className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-200 cursor-pointer hover:ring-2 hover:ring-primary transition"
            >
              <Image
                src={img}
                alt={`Thumbnail ${i}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 📦 Product Info */}
      <div>
        <p className="text-sm text-gray-500 uppercase">{product.category}</p>
        <h1 className="text-3xl font-bold mt-2">{product.name}</h1>

        {/* ⭐ Rating */}
        <div className="flex items-center gap-1 mt-2 text-yellow-500">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < Math.floor(product.rating)
                  ? "fill-current"
                  : "stroke-current"
              }`}
            />
          ))}
          <span className="text-sm text-gray-500 ml-2">
            {product.rating} / 5.0
          </span>
        </div>

        {/* 💲 Price */}
        <div className="flex items-center gap-3 mt-4">
          <p className="text-3xl font-bold text-primary">${product.price}</p>
          <p className="text-lg text-gray-400 line-through">
            ${product.oldPrice}
          </p>
          <span className="text-sm font-semibold text-green-600">
            Save {product.discount}%
          </span>
        </div>

        {/* 📦 Stock */}
        <p
          className={`mt-2 font-medium ${
            product.stock > 5
              ? "text-green-600"
              : product.stock > 0
              ? "text-orange-500"
              : "text-red-600"
          }`}
        >
          {product.stock > 5
            ? "In Stock"
            : product.stock > 0
            ? `Only ${product.stock} left!`
            : "Out of Stock"}
        </p>

        {/* 🎨 Variations */}
        <div className="mt-6 space-y-4">
          {/* Size */}
          <div>
            <h3 className="font-medium mb-2">Size</h3>
            <div className="flex gap-3">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border rounded-lg font-medium transition ${
                    selectedSize === size
                      ? "bg-primary text-white border-primary"
                      : "hover:border-primary"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <h3 className="font-medium mb-2">Color</h3>
            <div className="flex gap-3">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full border-2 transition ${
                    selectedColor === color
                      ? "border-primary ring-2 ring-primary"
                      : "border-gray-300 hover:border-primary"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <h3 className="font-medium mb-2">Quantity</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1 border rounded-lg hover:bg-gray-100"
              >
                -
              </button>
              <span className="font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-1 border rounded-lg hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* 📝 Description */}
        <p className="mt-6 text-gray-700 leading-relaxed">
          {product.description}
        </p>

        {/* ➕ Actions */}
        <div className="mt-8 flex gap-4">
          <button
            disabled={!selectedSize || !selectedColor}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
              !selectedSize || !selectedColor
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary/90"
            }`}
          >
            <ShoppingCart className="w-5 h-5" /> Add to Cart
          </button>
          <button className="flex items-center gap-2 border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition">
            <Heart className="w-5 h-5" /> Wishlist
          </button>
        </div>

        {/* 🚚 Extra Info */}
        <div className="mt-10 grid grid-cols-2 gap-6 text-sm">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-primary" />
            <p>Free Delivery on orders above $50</p>
          </div>
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-primary" />
            <p>Easy 7-Day Returns Policy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
