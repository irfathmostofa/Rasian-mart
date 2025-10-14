"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import ProductCarousel from "@/components/layout/ProductCarousel";
import Hero from "@/components/layout/HeroSection";
import ProductCardFour from "@/components/layout/ProductCard/ProductCardFour";
import { useProductStore } from "@/app/store/useProductStore";
import { useTemplateStore } from "./store/useTamplate";
import { BasicProductCard } from "@/components/layout/ProductCard/BasicProductCard";
import { MediumProductCard } from "@/components/layout/ProductCard/MediumProductCard";
import { PremiumProductCard } from "@/components/layout/ProductCard/PremiumProductCard";
import { EliteProductCard } from "@/components/layout/ProductCard/EliteProductCard";

export default function HomePage() {
  const [visibleProducts, setVisibleProducts] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const { products, loading, error, fetchProducts } = useProductStore();
  const { Template, fetchTemplate } = useTemplateStore();
  console.log(products);
  // ✅ Fetch once on mount
  useEffect(() => {
    if (products.length === 0) fetchProducts();
    fetchTemplate();
  }, [fetchProducts, products.length]);

  const loadMoreProducts = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVisibleProducts((prev) => prev + 10);
      setIsLoading(false);
    }, 300);
  };

  const hasMoreProducts = visibleProducts < products.length;

  return (
    <div className="space-y-10">
      {/* 🏠 Hero Section */}
      <Hero />

      {/* 🔥 Flash Sales */}
      <section>
        <h2 className="text-3xl font-bold mb-2">🔥 Flash Sales</h2>
        <ProductCarousel />
      </section>

      {/* 🛍️ Product Grid */}
      <section className="">
        <h2 className="text-3xl font-bold mb-4">🛍️ Best Deals</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
          {products.slice(0, visibleProducts).map((product) => (
            <PremiumProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              categories={product.categories}
              selling_price={product.selling_price}
              cost_price={product.cost_price}
              images={product.images}
              badge={product.badge}
              total_stock={product.total_stock}
              rating={product.rating}
            />
          ))}
        </div>

        {hasMoreProducts && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMoreProducts}
              disabled={isLoading}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px]"
              aria-label="Load more products"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Loading...
                </>
              ) : (
                "Load More"
              )}
            </button>
          </div>
        )}
      </section>

      {/* 🔥 Deals of the Day */}
      <section>
        <h2 className="text-2xl font-bold mb-6">🔥 Deals of the Day</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative rounded-xl overflow-hidden shadow">
            <Image
              src="https://picsum.photos/600/300?random=20"
              alt="50% Off Electronics Deal"
              width={600}
              height={300}
              className="object-cover w-full h-48 md:h-64"
              priority={false}
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-4">
              <h3 className="text-2xl font-bold">50% Off Electronics</h3>
              <Link
                href="/category/3/electronics"
                className="mt-3 bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Shop Now
              </Link>
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden shadow">
            <Image
              src="https://picsum.photos/600/300?random=21"
              alt="Buy 1 Get 1 Free Fashion Deal"
              width={600}
              height={300}
              className="object-cover w-full h-48 md:h-64"
              priority={false}
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-4">
              <h3 className="text-2xl font-bold">Buy 1 Get 1 Free - Fashion</h3>
              <Link
                href="/category/1/fashion"
                className="mt-3 bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Grab Deal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
    // <TemplateRenderer />
  );
}
