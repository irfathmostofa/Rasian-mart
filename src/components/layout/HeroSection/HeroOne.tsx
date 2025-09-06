// components/hero/HeroOne.tsx
"use client";

import Link from "next/link";

export default function HeroOne() {
  return (
    <section className="relative bg-gradient-to-r from-primary/90 to-primary text-white py-16 rounded-2xl">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center ">
        {/* Left content */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Your One-Stop <span className="text-yellow-300">Shopping</span>{" "}
            Destination
          </h1>
          <p className="mt-4 text-lg text-white/90">
            Shop groceries, electronics, fashion, and more with exclusive
            discounts every day.
          </p>
          <div className="mt-6 flex gap-4 justify-center md:justify-start">
            <Link
              href="/category/groceries"
              className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition"
            >
              Shop Now
            </Link>
            <Link
              href="/deals"
              className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              View Deals
            </Link>
          </div>
        </div>

        {/* Right image */}
        <div className="flex-1 mt-8 md:mt-0">
          {/* <img
            src="https://picsum.photos/600/400?random=11"
            alt="Hero Promo"
            className="rounded-xl shadow-lg"
          /> */}
        </div>
      </div>
    </section>
  );
}
