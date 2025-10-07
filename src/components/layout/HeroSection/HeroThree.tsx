// components/hero/HeroThree.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const slides = [
  {
    id: 1,
    title: "Mega Electronics Sale",
    desc: "Up to 50% off on top brands!",
    image: "https://picsum.photos/1200/500?random=31",
    link: "/",
  },
  {
    id: 2,
    title: "Fresh Groceries Everyday",
    desc: "Delivered to your door in 24h",
    image: "https://picsum.photos/1200/500?random=32",
    link: "/",
  },
  {
    id: 3,
    title: "Style Up Your Wardrobe",
    desc: "Fashion trends at unbeatable prices",
    image: "https://picsum.photos/1200/500?random=33",
    link: "/",
  },
];

export default function HeroThree() {
  return (
    <section className="relative w-full overflow-hidden rounded-2xl">
      <Carousel opts={{ loop: true }}>
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className="relative w-full h-[500px]">
                {/* 🖼️ Background Image */}
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white px-6">
                  <h1 className="text-4xl md:text-5xl font-bold">
                    {slide.title}
                  </h1>
                  <p className="mt-3 text-lg">{slide.desc}</p>
                  <Link
                    href={slide.link}
                    className="mt-6 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Arrows */}
        <CarouselPrevious className="left-4 bg-white/70 hover:bg-white" />
        <CarouselNext className="right-4 bg-white/70 hover:bg-white" />
      </Carousel>
    </section>
  );
}
