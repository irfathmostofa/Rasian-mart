"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductCarousel from "@/components/layout/ProductCarousel";
import Hero from "@/components/layout/HeroSection";
import { useProductStore } from "@/app/store/useProductStore";
import { PremiumProductCard } from "@/components/ProductCard/PremiumProductCard";
import { useSettings } from "./store/useSettings";
import { ProductCard } from "@/components/ProductCard";

export default function HomePage() {
  const {
    products,
    loading,
    error,
    hasNextPage,
    fetchProducts,
    loadMore,
    currentPage,
  } = useProductStore();
  const { productCardStyle } = useSettings();
  useEffect(() => {
    if (products.length === 0) {
      fetchProducts(1, 12);
    }
  }, [products.length]);
  console.log(products);
  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <Hero />

      {/* Flash Sales */}
      <section>
        <h2 className="text-3xl font-bold mb-2">🔥 Flash Sales</h2>
        <ProductCarousel />
      </section>

      {/* Product Grid */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold">🛍️ Best Deals</h2>

          {/* Optional future pagination info */}
          {currentPage > 1 && (
            <span className="text-gray-500 text-sm">Page {currentPage}</span>
          )}
        </div>

        {/* Loading State */}
        {loading && products.length === 0 ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No products available
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  cardStyle={productCardStyle}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px]"
                >
                  {loading ? (
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
          </>
        )}
      </section>

      {/* Deals of the Day */}
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
  );
}
