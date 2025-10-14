"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";

const newsList = [
  "🎉 Mega Sale: Up to 50% OFF on all products!",
  "🚚 Free Shipping on orders over $99!",
  "💎 New Collection just dropped – shop now!",
  "🔥 Limited Stock! Grab your favorites before they're gone.",
  "🎁 Sign up today and get 10% off your first order!",
];

export default function LiveNewsTicker() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % newsList.length);
    }, 2500); // every 2.5 seconds
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative w-full  text-white flex items-center justify-center overflow-hidden shadow-sm"
    >
      <div className="flex items-center gap-2 ">
        <div className="overflow-hidden h-6 flex items-center min-w-[300px] sm:min-w-[400px] md:min-w-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ y: -30, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.9 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
                bounce: 0.1,
              }}
              className="text-sm font-medium whitespace-nowrap text-center"
            >
              {newsList[index]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
