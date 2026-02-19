"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Tag, Bell, Megaphone, Sparkles } from "lucide-react";

// Icon mapping for news ticker icons
const iconMap: Record<string, any> = {
  tag: Tag,
  bell: Bell,
  megaphone: Megaphone,
  sparkles: Sparkles,
  volume: Volume2,
  default: Volume2,
};

interface LiveNewsTickerProps {
  data: {
    items?: Array<{
      text: string;
      text_bn?: string;
      link?: string;
      icon?: string;
    }>;
    status?: boolean;
    type?: string;
  };
  colors?: any;
  locale?: "en" | "bn";
}

export default function LiveNewsTicker({
  data,
  colors,
  locale = "en",
}: LiveNewsTickerProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Get items from data
  const items = data?.items || [];

  // If no items or status false, don't render
  if (!items.length || data?.status === false) {
    return null;
  }

  useEffect(() => {
    if (paused || items.length === 0) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 2500); // every 2.5 seconds

    return () => clearInterval(timer);
  }, [paused, items.length]);

  // Get current item
  const currentItem = items[index];
  if (!currentItem) return null;

  // Get appropriate text based on locale
  const displayText =
    locale === "bn" && currentItem.text_bn
      ? currentItem.text_bn
      : currentItem.text;

  // Get icon component
  const IconComponent = currentItem.icon
    ? iconMap[currentItem.icon.toLowerCase()] || iconMap.default
    : iconMap.default;

  // Determine text color from theme or default
  const textColor = colors?.text;

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative w-full flex items-center justify-start overflow-hidden px-1"
    >
      <div className="flex items-center gap-2">
        {/* Icon with theme color */}
        {/* {currentItem.icon && (
          <IconComponent
            size={16}
            style={{ textColor }}
            className="flex-shrink-0"
          />
        )} */}

        {/* News ticker content */}
        <div className="overflow-hidden h-6 flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className="text-sm font-medium whitespace-nowrap"
              style={{ color: textColor }}
            >
              {currentItem.link ? (
                <a
                  href={currentItem.link}
                  className="hover:underline transition-all"
                  style={{ color: textColor }}
                >
                  {displayText}
                </a>
              ) : (
                displayText
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Optional: Show dot indicators for multiple items */}
        {items.length > 1 && (
          <div className="flex items-center gap-1 ml-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === index ? "w-3" : ""
                }`}
                style={{
                  backgroundColor:
                    i === index
                      ? colors?.primary || textColor
                      : `${colors?.primary}40` || `${textColor}40`,
                }}
                aria-label={`Go to item ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
