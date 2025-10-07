"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import ProductCardThree from "@/components/layout/ProductCard3";
import ProductCarousel from "@/components/layout/ProductCarousel";
import HeroSection from "@/components/layout/HeroSection";
import HeroCarousel from "@/components/layout/HeroSection/HeroCarousel";
import { demoProducts } from "@/components/dummyData/demoProducts";
import Hero from "@/components/layout/HeroSection";
import ProductCardFour from "@/components/layout/ProductCard/ProductCardFour";

export default function HomePage() {
  const [visibleProducts, setVisibleProducts] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const loadMoreProducts = () => {
    setIsLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setVisibleProducts((prev) => prev + 10);
      setIsLoading(false);
    }, 300);
  };

  const hasMoreProducts = visibleProducts < demoProducts.length;

  return (
    <div className="space-y-10">
      {/* Hero Banner */}
      <Hero />
      {/* <HeroCarousel /> */}

      {/* 🏷️ Categories */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[
            { name: "Groceries", slug: "groceries" },
            { name: "Electronics", slug: "electronics" },
            { name: "Fashion", slug: "fashion" },
            { name: "Home & Living", slug: "home" },
            { name: "Beauty", slug: "beauty" },
            { name: "Sports", slug: "sports" },
          ].map((cat, i) => (
            <Link
              key={cat.slug}
              href={`/category/${i + 1}/${cat.slug}`}
              className="group relative block rounded-xl overflow-hidden shadow hover:shadow-lg transition"
            >
              <Image
                src={`https://picsum.photos/400/300?random=${i + 2}`}
                alt={cat.name}
                width={400}
                height={300}
                className="h-32 w-full object-cover group-hover:scale-105 transition"
                priority={i < 2} // Prioritize loading first 2 images
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-lg font-semibold">
                {cat.name}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="">
        <h2 className="text-3xl font-bold mb-2">🔥 Flash Sales</h2>
        <ProductCarousel />
      </section>

      <section className="">
        <h2 className="text-3xl font-bold mb-4">🛍️ Best Deals</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
          {demoProducts.slice(0, visibleProducts).map((product) => (
            <ProductCardFour
              id={product.id}
              key={product.id}
              name={product.name}
              category={product.category}
              price={product.price}
              oldPrice={product.oldPrice}
              discount={product.discount}
              image={`https://picsum.photos/400/400?random=${product.id + 10}`}
              badge={product.badge}
              stock={product.stock}
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

        {!hasMoreProducts && demoProducts.length > 0 && (
          <div className="text-center mt-6 text-gray-500">
            All products loaded
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
                href="/category/electronics"
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
                href="/category/fashion"
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
