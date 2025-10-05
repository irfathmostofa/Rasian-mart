"use client";

import { useParams } from "next/navigation";
import { useCart } from "@/app/store/useCart";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { demoProducts, reviews } from "@/components/dummyData/demoProducts";
import ProductCardThree from "@/components/layout/ProductCard3";
import PreviewImage from "@/components/ui/PreviewImage";
import ImageMagnifier from "@/components/ui/ImageMagnifier";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const product = demoProducts.find((p) => p.id === Number(id));

  // If product is found, create a new object with images
  const productWithImages = product
    ? {
        ...product,
        images: [
          "https://res.cloudinary.com/dxefvhcfy/image/upload/v1758792729/l6a5sbfnwfzlm91ej7f4.png",
          "https://res.cloudinary.com/dxefvhcfy/image/upload/v1758694561/rumckudx3zfgdbzx8rwv.png",
          "https://res.cloudinary.com/dxefvhcfy/image/upload/v1758690380/iejtviwvgzbk1k5nen5o.png",
          "https://res.cloudinary.com/dxefvhcfy/image/upload/v1758690282/zs6ydqeawwgolfr1cuvk.png",
          "https://res.cloudinary.com/dxefvhcfy/image/upload/v1758690519/xg89abvkozu7pjphsr9j.png",
        ],
      }
    : null;

  const { addToCart } = useCart();

  // ⚡ State
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!productWithImages) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h2 className="text-xl font-semibold text-red-500">
          Product not found
        </h2>
        <Link href="/" className="text-primary underline">
          Go Back Home
        </Link>
      </div>
    );
  }

  // 🔗 Related products (limit 5)
  const related = demoProducts
    .filter(
      (p) =>
        p.category === productWithImages.category &&
        p.id !== productWithImages.id
    )
    .slice(0, 5);

  return (
    <div className="container mx-auto py-10 space-y-16">
      {/* ================= Main Product ================= */}
      <div className="grid md:grid-cols-2 gap-10">
        {/* 🖼️ Product Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-md">
            <ImageMagnifier
              src={productWithImages.images[selectedImage]}
              alt={productWithImages.name}
              magnifierHeight={200}
              magnifierWidth={200}
              zoomLevel={2.5}
            />
          </div>

          {/* Thumbnail Gallery */}
          <div className="grid grid-cols-5 gap-2">
            {productWithImages.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative h-20 rounded-md overflow-hidden border-2 ${
                  selectedImage === index
                    ? "border-primary"
                    : "border-transparent"
                } transition-all`}
              >
                <Image
                  src={image}
                  alt={`${productWithImages.name} view ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* 📦 Product Info */}
        <div className="space-y-3">
          <p className="text-sm text-gray-500 uppercase">
            {productWithImages.category}
          </p>
          <h1 className="text-3xl font-bold mt-2">{productWithImages.name}</h1>

          {/* ⭐ Rating */}
          <div className="flex items-center gap-1 mt-2 text-yellow-500">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(productWithImages.rating)
                    ? "fill-current"
                    : "stroke-current"
                }`}
              />
            ))}
            <span className="text-sm text-gray-500 ml-2">
              {productWithImages.rating} / 5.0
            </span>
          </div>

          {/* 💲 Price */}
          <div className="flex items-center gap-3">
            <p className="text-2xl font-bold text-primary">
              ৳ {productWithImages.price}
            </p>
            {productWithImages.oldPrice && (
              <p className="text-gray-400 line-through">
                ৳ {productWithImages.oldPrice}
              </p>
            )}
            {productWithImages.discount && (
              <span className="text-green-600 font-semibold">
                -{productWithImages.discount}%
              </span>
            )}
            {/* 📦 Stock */}
            <p
              className={`font-medium ${
                productWithImages.stock > 5
                  ? "text-green-600"
                  : productWithImages.stock > 0
                  ? "text-orange-500"
                  : "text-red-600"
              }`}
            >
              {productWithImages.stock > 5
                ? "In Stock"
                : productWithImages.stock > 0
                ? `Only ${productWithImages.stock} left!`
                : "Out of Stock"}
            </p>
          </div>

          {/* 🎨 Variations */}
          <div className="space-y-4 ">
            {/* Size */}
            <div>
              <h3 className="font-medium mb-2">Size</h3>
              <div className="flex gap-2">
                {["S", "M", "L", "XL"].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-lg ${
                      selectedSize === size
                        ? "bg-primary text-white"
                        : "hover:bg-gray-100"
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
              <div className="flex gap-2">
                {["Red", "Blue", "Black"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded-lg ${
                      selectedColor === color
                        ? "bg-primary text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {color}
                  </button>
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

          {/* 🛒 Action Buttons */}
          <div className="flex sm:flex-row gap-3 sm:gap-4 mt-4">
            <button
              onClick={() =>
                addToCart({
                  id: productWithImages.id,
                  name: productWithImages.name,
                  price: productWithImages.price,
                  image: productWithImages.image,
                  quantity,
                })
              }
              disabled={productWithImages.stock === 0}
              className="bg-primary text-white px-3 py-3 md:px-6 md:py-3 rounded-lg hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </button>
            <button className="border px-3 py-3 md:px-6 md:py-3 rounded-lg hover:bg-gray-100 flex items-center justify-center gap-2 w-full sm:w-auto">
              <Heart className="w-5 h-5" /> Add to Wishlist
            </button>
          </div>

          {/* 📖 Description */}
        </div>
      </div>
      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-2">Description</h3>
        <p className="text-gray-600 leading-relaxed">
          {productWithImages.description || "No description available."}
        </p>
      </div>

      {/* 📋 Extra Info */}
      <div className="mt-4">
        <h3 className="font-semibold text-lg mb-2">Additional Info</h3>
        <ul className="text-gray-600 list-disc list-inside space-y-1">
          <li>100% Original Products</li>
          <li>Pay on delivery might be available</li>
          <li>Easy 7 days returns and exchanges</li>
          <li>Free delivery on orders above ৳500</li>
        </ul>
      </div>
      {/* ================= Product Reviews ================= */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>

        {/* ⭐ Overall Rating Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold text-primary">
              {productWithImages.rating.toFixed(1)}
            </div>
            <div className="flex items-center text-yellow-500">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(productWithImages.rating)
                      ? "fill-current"
                      : "stroke-current"
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-500 text-sm ml-1">
              (based on 24 reviews)
            </span>
          </div>
        </div>

        {/* 💬 Reviews List */}
        <div className="space-y-6 ">
          {/* Example Review */}
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-800">
                    {review.customerName}
                  </p>
                  <div className="flex items-center text-yellow-500">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? "fill-current" : "stroke-current"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">
                      {review.rating}/5
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {review.createdAt}
                </span>
              </div>

              {/* Title + Comment */}
              <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {review.comment}
              </p>

              {/* Review Images */}
              {review.imageUrls.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {review.imageUrls.map((img, idx) => (
                    <div
                      key={idx}
                      className="w-20 h-20 rounded-md overflow-hidden border"
                    >
                      <PreviewImage
                        src={img}
                        alt={`review-${review.id}-${idx}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Helpful Button */}
              <div className="mt-3">
                <button className="text-xs text-gray-500 hover:text-primary transition">
                  👍 Helpful ({review.helpful})
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= Related Products ================= */}
      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4">
            {related.map((p) => (
              <ProductCardThree
                id={p.id}
                key={p.id}
                name={p.name}
                category={p.category}
                price={p.price}
                oldPrice={p.oldPrice}
                discount={p.discount}
                image={`https://picsum.photos/400/400?random=${p.id + 10}`}
                badge={p.badge}
                stock={p.stock}
                rating={p.rating}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
