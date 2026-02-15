"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  ChevronDown,
  X,
  Tag,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Clock,
} from "lucide-react";
import { useThemeData } from "@/app/store/useThemeData";

// Icon mapping for dynamic icons
const IconMap: Record<string, React.ElementType> = {
  cart: ShoppingCart,
  wishlist: Heart,
  account: User,
  tag: Tag,
  phone: Phone,
  mail: Mail,
  map: MapPin,
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
  clock: Clock,
  menu: Menu,
  bars: Menu,
  search: Search,
  volume: Volume2,
};

// Type definitions
interface ContentItem {
  text: string;
  text_bn?: string;
  link?: string;
  icon?: string;
  variant?: string;
  status?: boolean;
}

interface ContentSection {
  type?: string;
  status?: boolean;
  items?: ContentItem[];
  layout?: string;
}

interface HeaderContent {
  left?: ContentSection;
  center?: ContentSection;
  right?: ContentSection;
  search?: {
    status?: boolean;
    placeholder?: string;
  };
  action_buttons?: Record<
    string,
    {
      status?: boolean;
      icon?: string;
    }
  >;
  menu?: {
    items?: Array<{
      label: string;
      link: string;
    }>;
  };
}

interface HeaderData {
  status?: boolean;
  header_top?: {
    status?: boolean;
    layout?: string;
    content?: HeaderContent;
  };
  header_main?: {
    content?: HeaderContent;
  };
  header_bottom?: {
    type?: string;
    menu_id?: string;
    mobile_menu?: {
      toggle_icon?: string;
    };
  };
}

interface Colors {
  primary?: string;
  secondary?: string;
  text?: string;
  background?: string;
  border?: string;
  header_top_bg?: string;
  header_top_text?: string;
  header_bg?: string;
  nav_bg?: string;
  input_bg?: string;
  text_light?: string;
}

export default function HeaderTwo() {
  // Get all header data at once with proper typing
  const headerData = (useThemeData("header_section") || {}) as HeaderData;
  const colors = (useThemeData("colors") || {}) as Colors;
  const typography = (useThemeData("typography") || {}) as Record<
    string,
    string
  >;

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Extract header sections
  const { header_top, header_main, header_bottom } = headerData;

  // If header is disabled completely
  if (headerData?.status === false) return null;

  // Default colors with fallbacks
  const primaryColor = colors?.primary || "#006747";
  const secondaryColor = colors?.secondary || "#DA291C";
  const textColor = colors?.text || "#1F2937";
  const backgroundColor = colors?.background || "#ffffff";
  const borderColor = colors?.border || "#e5e7eb";
  const headerTopBg = colors?.header_top_bg || `${primaryColor}10` || "#f8f9fa";
  const headerTopText = colors?.header_top_text || textColor;
  const headerBg = colors?.header_bg || backgroundColor;
  const navBg = colors?.nav_bg || backgroundColor;
  const inputBg = colors?.input_bg || "#ffffff";
  const textLight = colors?.text_light || "#9ca3af";

  return (
    <header
      className="w-full"
      style={{
        fontFamily: typography?.font_family || "sans-serif",
      }}
    >
      {/* Header Top - Conditional Rendering based on status */}
      {header_top?.status && (
        <div
          className="border-b"
          style={{
            backgroundColor: headerTopBg,
            color: headerTopText,
            borderColor: borderColor,
          }}
        >
          <div className="container mx-auto px-4">
            <div
              className={`grid ${header_top.layout || "grid-cols-3"} items-center min-h-[40px] text-sm`}
            >
              {/* Left Section */}
              {header_top.content?.left?.status !== false && (
                <div className="flex items-center">
                  {renderHeaderContent(header_top.content?.left, {
                    primary: primaryColor,
                    text: headerTopText,
                  })}
                </div>
              )}

              {/* Center Section */}
              {header_top.content?.center?.status !== false && (
                <div className="flex items-center justify-center">
                  {renderHeaderContent(header_top.content?.center, {
                    primary: primaryColor,
                    text: headerTopText,
                  })}
                </div>
              )}

              {/* Right Section */}
              {header_top.content?.right?.status !== false && (
                <div className="flex items-center justify-end">
                  {renderHeaderContent(header_top.content?.right, {
                    primary: primaryColor,
                    text: headerTopText,
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header Main */}
      {header_main && (
        <div
          className="py-4"
          style={{
            backgroundColor: headerBg,
            color: textColor,
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between gap-4">
              {/* Logo Area */}
              <div className="flex items-center gap-4">
                <button
                  className="lg:hidden"
                  onClick={() => setMobileMenuOpen(true)}
                  style={{ color: primaryColor }}
                >
                  <Menu size={24} />
                </button>
                <a
                  href="/"
                  className="text-2xl font-bold"
                  style={{ color: primaryColor }}
                >
                  {(useThemeData("general") as any)?.site_title || "BizHut"}
                </a>
              </div>

              {/* Search Bar */}
              {header_main.content?.search?.status !== false && (
                <div className="flex-1 max-w-2xl mx-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={
                        header_main.content?.search?.placeholder ||
                        "Search products..."
                      }
                      className="w-full px-4 py-2 pl-10 pr-12 rounded-lg border focus:outline-none focus:ring-2"
                      style={{
                        borderColor: borderColor,
                        backgroundColor: inputBg,
                        color: textColor,
                      }}
                    />
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      size={18}
                      style={{ color: textLight }}
                    />
                    <button
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 rounded-md text-sm font-medium text-white"
                      style={{
                        backgroundColor: primaryColor,
                      }}
                      onClick={() => {
                        // Handle search
                        console.log("Searching for:", searchQuery);
                        window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                      }}
                    >
                      Search
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {header_main.content?.action_buttons && (
                <div className="flex items-center gap-3">
                  {Object.entries(header_main.content.action_buttons).map(
                    ([key, config]: [string, any]) => {
                      if (config?.status === false) return null;

                      const Icon =
                        IconMap[config?.icon || "cart"] || ShoppingCart;

                      return (
                        <a
                          key={key}
                          href={`/${key}`}
                          className="relative p-2 hover:opacity-80 transition-opacity"
                          style={{ color: primaryColor }}
                        >
                          <Icon size={22} />
                          {key === "cart" && (
                            <span
                              className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center text-white"
                              style={{
                                backgroundColor: secondaryColor,
                              }}
                            >
                              0
                            </span>
                          )}
                        </a>
                      );
                    },
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header Bottom - Navigation */}
      {header_bottom?.type && (
        <div
          className="border-t"
          style={{
            backgroundColor: navBg,
            borderColor: borderColor,
          }}
        >
          <div className="container mx-auto px-4">
            <nav className="hidden lg:flex items-center gap-6 h-12">
              {header_bottom.type === "categories" && (
                <>
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-md font-medium"
                    style={{
                      backgroundColor: `${primaryColor}10`,
                      color: primaryColor,
                    }}
                  >
                    <Menu size={18} />
                    <span>All Categories</span>
                    <ChevronDown size={16} />
                  </button>
                  {/* Dynamic menu items from header_main */}
                  {header_main?.content?.menu?.items?.map(
                    (item: any, index: number) => (
                      <a
                        key={index}
                        href={item.link}
                        className="hover:opacity-80 transition-opacity"
                        style={{ color: textColor }}
                      >
                        {item.label}
                      </a>
                    ),
                  )}
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween" }}
            className="fixed inset-0 z-50 lg:hidden"
            style={{ backgroundColor: backgroundColor }}
          >
            <div className="flex flex-col h-full">
              <div
                className="flex items-center justify-between p-4 border-b"
                style={{ borderColor: borderColor }}
              >
                <span
                  className="text-lg font-semibold"
                  style={{ color: textColor }}
                >
                  Menu
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ color: textColor }}
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                {/* Mobile menu items */}
                {header_main?.content?.menu?.items?.map(
                  (item: any, index: number) => (
                    <a
                      key={index}
                      href={item.link}
                      className="block py-3 border-b"
                      style={{
                        borderColor: borderColor,
                        color: textColor,
                      }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  ),
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// Helper function to render different content types
function renderHeaderContent(
  content: any,
  colors: { primary: string; text: string },
) {
  if (!content) return null;

  switch (content.type) {
    case "news_ticker":
      return <NewsTicker items={content.items || []} colors={colors} />;

    case "buttons":
      return (
        <div className="flex items-center gap-3">
          {content.items?.map((item: any, index: number) => {
            const Icon = IconMap[item.icon];
            const isTextVariant = item.variant === "text";

            return (
              <a
                key={index}
                href={item.link || "#"}
                className={`flex items-center gap-1 hover:opacity-80 transition-opacity ${
                  isTextVariant ? "text-sm" : "px-3 py-1 rounded-md text-white"
                }`}
                style={{
                  color: isTextVariant ? colors.primary : undefined,
                  backgroundColor: !isTextVariant
                    ? colors.primary
                    : "transparent",
                }}
              >
                {Icon && <Icon size={14} />}
                <span>{item.text}</span>
              </a>
            );
          })}
        </div>
      );

    case "text":
      return (
        <div className="flex items-center gap-3">
          {content.items?.map((item: any, index: number) => {
            const Icon = IconMap[item.icon];
            return (
              <a
                key={index}
                href={item.link || "#"}
                className="flex items-center gap-1 text-sm hover:opacity-80"
                style={{ color: colors.text }}
              >
                {Icon && <Icon size={14} style={{ color: colors.primary }} />}
                <span>{item.text}</span>
              </a>
            );
          })}
        </div>
      );

    default:
      return null;
  }
}

// Dedicated NewsTicker component
function NewsTicker({
  items,
  colors,
}: {
  items: any[];
  colors: { primary: string; text: string };
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || !items?.length) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [paused, items]);

  if (!items?.length) return null;

  const currentItem = items[index];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative w-full flex items-center overflow-hidden"
    >
      <div className="flex items-center gap-2">
        <Volume2 size={16} style={{ color: colors.primary }} />
        <div className="overflow-hidden h-6 flex items-center min-w-[250px] sm:min-w-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm whitespace-nowrap"
              style={{ color: colors.text }}
            >
              {currentItem?.text}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
