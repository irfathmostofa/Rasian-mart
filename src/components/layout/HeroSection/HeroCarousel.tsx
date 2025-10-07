"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// Dummy hero slides
const heroSlides = [
  {
    id: 1,
    title: "Welcome to Rasian Mart",
    subtitle: "Shop smarter, faster, and easier with exclusive deals!",
    image: "https://picsum.photos/1200/500?random=11",
    link: "/",
  },
  {
    id: 2,
    title: "Fresh Products Everyday",
    subtitle:
      "From groceries to essentials – everything you need in one place.",
    image: "https://picsum.photos/1200/500?random=12",
    link: "/",
  },
  {
    id: 3,
    title: "Exclusive Discounts",
    subtitle: "Save big with our daily offers & seasonal sales.",
    image: "https://picsum.photos/1200/500?random=13",
    link: "/",
  },
];

export default function HeroCarousel() {
  return (
    <div className="relative w-full max-w-7xl mx-auto">
      <Carousel
        opts={{ loop: true }}
        plugins={[
          Autoplay({
            delay: 4000,
          }),
        ]}
        className="relative"
      >
        <CarouselContent>
          {heroSlides.map((slide) => (
            <CarouselItem key={slide.id}>
              <section className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
                {/* Background Image with Dark Overlay */}
                <motion.div
                  className="absolute inset-0"
                  initial={{ scale: 1 }}
                  animate={{ scale: 2 }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "linear",
                  }}
                >
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60"></div>
                </motion.div>

                {/* Text Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
                  <motion.h1
                    key={slide.title}
                    className="text-3xl md:text-5xl font-bold"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    {slide.title}
                  </motion.h1>

                  <motion.p
                    key={slide.subtitle}
                    className="mt-3 text-lg md:text-xl max-w-2xl"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  >
                    {slide.subtitle}
                  </motion.p>

                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                  >
                    <Link
                      href={slide.link}
                      className="mt-6 bg-primary px-6 py-3 rounded-lg text-white text-lg font-semibold hover:bg-primary/90 hover:scale-105 transition-transform duration-300 inline-block"
                    >
                      Shop Now
                    </Link>
                  </motion.div>
                </div>
              </section>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Arrows */}
        {/* <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" /> */}
      </Carousel>
    </div>
  );
}
