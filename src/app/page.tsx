import Image from "next/image";
import Link from "next/link";
import { Flashlight, ShoppingCart } from "lucide-react";
import ProductCard from "@/components/layout/ProductCard";
import ProductCardTWO from "@/components/layout/ProductCard2";
import ProductCardThree from "@/components/layout/ProductCard3";
import ProductCarousel from "@/components/layout/ProductCarousel";
import HeroSection from "@/components/layout/HeroSection";

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* 🎯 Hero Banner */}
      <HeroSection />

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
              href={`/category/${cat.slug}`}
              className="group relative block rounded-xl overflow-hidden shadow hover:shadow-lg transition"
            >
              <Image
                src={`https://picsum.photos/400/300?random=${i + 2}`}
                alt={cat.name}
                width={400}
                height={300}
                className="h-32 w-full object-cover group-hover:scale-105 transition"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-lg font-semibold">
                {cat.name}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-3xl font-bold mb-4">🔥 Flash Sales</h2>
        <ProductCarousel />
      </section>
      <section className="mt-10">
        <h2 className="text-3xl font-bold mb-4">🛍️ Best Deals</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((id) => (
            <ProductCardThree
              id={1}
              key={id}
              name={`Product ${id}`}
              category={id % 2 === 0 ? "Electronics" : "Gadgets"}
              price={Math.floor(Math.random() * 100) + 100}
              oldPrice={Math.floor(Math.random() * 100) + 150}
              discount={Math.floor(Math.random() * 30) + 10}
              image={`https://picsum.photos/400/400?random=${id + 10}`}
              badge={id % 2 === 0 ? "New" : "Sale"}
              stock={3}
              rating={Math.floor(Math.random() * 3) + 2.5}
            />
          ))}
        </div>
      </section>

      {/* 🔥 Deals of the Day */}
      <section>
        <h2 className="text-2xl font-bold mb-6">🔥 Deals of the Day</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative rounded-xl overflow-hidden shadow">
            <Image
              src="https://picsum.photos/600/300?random=20"
              alt="Deal 1"
              width={600}
              height={300}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-4">
              <h3 className="text-2xl font-bold">50% Off Electronics</h3>
              <Link
                href="/category/electronics"
                className="mt-3 bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-200"
              >
                Shop Now
              </Link>
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden shadow">
            <Image
              src="https://picsum.photos/600/300?random=21"
              alt="Deal 2"
              width={600}
              height={300}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-4">
              <h3 className="text-2xl font-bold">Buy 1 Get 1 Free - Fashion</h3>
              <Link
                href="/category/fashion"
                className="mt-3 bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-200"
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
