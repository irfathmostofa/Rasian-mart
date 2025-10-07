// components/hero/HeroTwo.tsx
"use client";

import Link from "next/link";

export default function HeroTwo() {
  return (
    <section className="container mx-auto px-6 py-16 grid md:grid-cols-2 gap-8 items-center">
      {/* Left */}
      <div>
        <h1 className="text-5xl font-bold text-gray-900">
          Discover Top <span className="text-primary">Deals</span> Today
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Save big on fashion, electronics, and home essentials. Don’t miss out
          on limited-time offers!
        </p>
        <Link
          href="/"
          className="mt-6 inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90"
        >
          Explore Deals
        </Link>
      </div>

      {/* Right product preview */}
      <div className="grid grid-cols-2 gap-4">
        <img
          src="https://picsum.photos/400/400?random=21"
          alt="Deal 1"
          className="rounded-lg shadow-md"
        />
        <img
          src="https://picsum.photos/400/400?random=22"
          alt="Deal 2"
          className="rounded-lg shadow-md"
        />
        <img
          src="https://picsum.photos/400/400?random=23"
          alt="Deal 3"
          className="rounded-lg shadow-md"
        />
        <img
          src="https://picsum.photos/400/400?random=24"
          alt="Deal 4"
          className="rounded-lg shadow-md"
        />
      </div>
    </section>
  );
}
