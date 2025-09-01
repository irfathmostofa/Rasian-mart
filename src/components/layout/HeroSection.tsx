"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
      {/* Hero Image */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1 }}
        animate={{ scale: 1.05 }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
        }}
      >
        <Image
          src="https://picsum.photos/1200/400?random=1"
          alt="Hero Banner"
          fill
          priority
          className="object-cover"
        />
      </motion.div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50 flex flex-col items-center justify-center text-center text-white px-4">
        {/* Sliding Text */}
        <motion.h1
          className="text-4xl md:text-5xl font-bold"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          Welcome to Rasian Mart
        </motion.h1>

        <motion.p
          className="mt-3 text-lg md:text-xl"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        >
          Shop smarter, faster, and easier with exclusive deals!
        </motion.p>

        {/* Sliding Button */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
        >
          <Link
            href="/category/deals"
            className="mt-6 bg-primary px-6 py-3 rounded-lg text-white text-lg font-semibold hover:bg-primary/90 hover:scale-105 transition-transform duration-300 inline-block"
          >
            Shop Now
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
