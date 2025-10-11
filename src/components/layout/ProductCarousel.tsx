"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star, Tag } from "lucide-react";
import { useCart } from "@/app/store/useCart";
import { useProductStore } from "@/app/store/useProductStore";
import { useEffect } from "react";

interface Product {
  id: number;
  code: string;
  name: string;
  description: string;
  cost_price: number;
  selling_price: number;
  status: string;
  uom_name: string;
  categories: Array<{
    id: number;
    name: string;
    slug?: string;
    code: string;
    image: string | null;
    is_primary: boolean;
  }>;
  images: Array<{
    id: number;
    url: string;
    alt_text: string;
    is_primary: boolean;
  }> | null;
  total_stock: number;
  badge: string | null;
  rating: number | null;
  review_count: number | null;
  total_sales: number;
}

// Product Card Component
function ProductCardCarousel({ product }: { product: Product }) {
  const { addToCart } = useCart();

  const getImageUrl = () => {
    if (!product.images || product.images.length === 0)
      return "https://placehold.co/400";
    return (
      product.images.find((img) => img.is_primary)?.url ||
      product.images[0]?.url
    );
  };

  const imageUrl = getImageUrl();
  const rating = product.rating || 0;

  // Categories as chips

  const categoryChips = product.categories?.length
    ? [
        <span
          key={product.categories.at(-1)?.id}
          className="text-[10px] sm:text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full border border-gray-200"
        >
          {product.categories.at(-1)?.name}
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

  return (
    <div className="group relative rounded-xl overflow-hidden bg-white shadow-md transition-all duration-300 border border-gray-100 w-full max-w-xs mx-auto">
      {/* Image */}
      <div className="relative w-full h-40 sm:h-48 md:h-48">
        <Image
          src={imageUrl}
          alt={product.name}
          height={400}
          width={300}
          className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-105"
          onError={(e) => (e.currentTarget.src = "https://placehold.co/400")}
        />

        {/* Badge */}
        {product.badge && (
          <span className="absolute top-2 left-2 bg-primary text-white text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full shadow-md">
            {product.badge}
          </span>
        )}

        {/* Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="p-1 sm:p-2 bg-white rounded-full shadow hover:bg-red-500 hover:text-white transition">
            <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() =>
              addToCart({
                id: product.id,
                name: product.name,
                price: Number(product.selling_price) || 0,
                image: imageUrl,
                quantity: 1,
              })
            }
            className="p-1 sm:p-2 bg-white rounded-full shadow hover:bg-primary hover:text-white transition"
          >
            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Info */}
      <Link href={`/product/${product.id}`}>
        <div className="p-3 sm:p-4 space-y-1 sm:space-y-2">
          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-1 mb-1">
            <Tag className="w-3 h-3 text-gray-400" />
            {categoryChips}
          </div>

          <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-800 line-clamp-1 group-hover:text-primary transition">
            {product.name}
          </h3>

          {/* Rating */}
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
              ({product.review_count || 0})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-1 sm:gap-2">
            <p className="font-bold text-base sm:text-sm md:text-sm text-primary">
              ৳ {product.selling_price}
            </p>
            {product.cost_price &&
              product.cost_price !== product.selling_price && (
                <p className="text-[10px] sm:text-sm text-gray-400 line-through">
                  ৳ {product.cost_price}
                </p>
              )}
          </div>

          {/* Stock */}
          <div className="flex items-center justify-between">
            <p
              className={`text-[10px] sm:text-sm font-medium ${
                product.total_stock > 5
                  ? "text-green-600"
                  : product.total_stock > 0
                  ? "text-orange-500"
                  : "text-red-600"
              }`}
            >
              {product.total_stock > 5
                ? "In Stock"
                : product.total_stock > 0
                ? `Only ${product.total_stock} left!`
                : "Out of Stock"}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ProductCarousel Component
export default function ProductCarousel() {
  const { products, loading, error, fetchProducts } = useProductStore();

  // Fetch once on mount
  useEffect(() => {
    if (products.length === 0) fetchProducts();
  }, [fetchProducts, products.length]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{error || "No products available"}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full mx-auto py-6">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 2000,
          }),
        ]}
        className="relative"
      >
        {/* Hide arrows on mobile, show on md+ */}
        <div className="hidden md:flex absolute top-1/2 left-0 -translate-y-1/2 z-10">
          <CarouselPrevious />
        </div>
        <div className="hidden md:flex absolute top-1/2 right-0 -translate-y-1/2 z-10">
          <CarouselNext />
        </div>

        <CarouselContent className="flex flex-nowrap mb-2">
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="basis-1/2 sm:basis-1/3 md:basis-1/5"
            >
              <ProductCardCarousel product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
