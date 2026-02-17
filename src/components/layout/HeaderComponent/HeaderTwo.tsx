"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { useCart } from "@/app/store/useCart";
import { useWishlist } from "@/app/store/useWishlist";
import { useUserStore } from "@/app/store/useUserStore";
import { useProductStore } from "@/app/store/useProductStore";
import CategoryNav from "./navigation/CategoryNav";
import LiveNewsTicker from "./LiveNewsTicker";

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
    suggestion_api?: string;
    min_chars?: number;
  };
  logo?: {
    src?: string;
    height?: number;
    width?: number;
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
    status?: string;
    sticky?: string;
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
  footer_bg?: string;
  footer_text?: string;
}

export default function HeaderTwo() {
  const router = useRouter();

  // Theme data
  const headerData = (useThemeData("header_section") || {}) as HeaderData;
  const colors = (useThemeData("colors") || {}) as Colors;
  const typography = (useThemeData("typography") || {}) as Record<
    string,
    string
  >;

  // Store data
  const { cart, isLoading: cartLoading } = useCart();
  const { items, isLoading: wishlistLoading } = useWishlist();
  const { user, clearSession } = useUserStore();
  const { products, fetchProducts } = useProductStore();
  const { user: authUser } = useUserStore();

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Extract header sections
  const { header_top, header_main, header_bottom } = headerData;

  // Calculate total cart items
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Fetch products for search suggestions
  useEffect(() => {
    fetchProducts();
  }, []);

  // Initialize cart and wishlist when user logs in
  useEffect(() => {
    if (authUser?.id) {
      useCart.getState().initializeCart(authUser.id);
      useWishlist.getState().initializeWishlist(authUser.id);
    }
  }, [authUser]);

  // If header is disabled completely
  if (headerData?.status === false) return null;

  // Default colors with fallbacks
  const primaryColor = colors?.primary || "#006747";
  const secondaryColor = colors?.secondary || "#DA291C";
  const textColor = colors?.text;
  const backgroundColor = colors?.background || "#ffffff";
  const borderColor = colors?.border || "#e5e7eb";
  const headerTopBg = colors?.header_top_bg || `${primaryColor}`;
  const headerTopText = colors?.header_top_text || textColor;
  const headerBg = colors?.header_bg || backgroundColor;
  const navBg = colors?.nav_bg;
  const inputBg = colors?.input_bg || "#ffffff";
  const textLight = colors?.text_light || "#9ca3af";
  const footerbg = colors?.footer_bg;
  const footertxt = colors?.footer_text;

  // Search functionality
  const minChars = header_main?.content?.search?.min_chars || 3;
  const filteredProducts = useMemo(() => {
    if (searchQuery.length < minChars) return [];
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, products, minChars]);

  const handleSearch = () => {
    if (searchQuery.trim().length < 2) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    setFocused(false);
    setMobileSearch(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleLogout = () => {
    clearSession();
    useCart.getState().resetCart();
    useWishlist.getState().resetWishlist();
    setMobileMenuOpen(false);
  };

  return (
    <header
      className="w-full sticky top-0 z-50 shadow"
      style={{
        fontFamily: typography?.font_family || "sans-serif",
        backgroundColor: backgroundColor,
      }}
    >
      {/* Header Top - Conditional Rendering based on status */}
      {header_top?.status && (
        <div
          className="border-b"
          style={{
            backgroundColor: footerbg,
            color: headerTopText,
            borderColor: borderColor,
          }}
        >
          <div className="container mx-auto px-4">
            <div
              className={`grid ${header_top.layout || "grid-cols-3"} items-center min-h-[40px] text-sm`}
            >
              {/* Left Section */}
              <div className="flex items-center">
                {header_top.content?.left?.status !== false && (
                  <>
                    {header_top.content?.left?.type === "news_ticker" ? (
                      <LiveNewsTicker
                        data={header_top.content?.left}
                        colors={{ primary: primaryColor, text: footertxt }}
                      />
                    ) : (
                      renderHeaderContent(header_top.content?.left, {
                        primary: primaryColor,
                        text: footertxt,
                      })
                    )}
                  </>
                )}
              </div>

              {/* Center Section */}
              <div className="flex items-center justify-center">
                {header_top.content?.center?.status !== false && (
                  <>
                    {renderHeaderContent(header_top.content?.center, {
                      primary: primaryColor,
                      text: footertxt,
                    })}
                  </>
                )}
              </div>

              {/* Right Section - User Actions */}
              <div className="flex items-center justify-end gap-4">
                {/* Desktop Links */}
                <nav className="hidden sm:flex items-center gap-4 whitespace-nowrap">
                  <Link href="/help" style={{ color: footertxt }}>
                    Help
                  </Link>
                  <Link href="/track-order" style={{ color: footertxt }}>
                    Track Order
                  </Link>
                  {user || authUser ? (
                    <Link
                      href="/profile"
                      className="flex items-center gap-1 font-medium"
                      style={{ color: footertxt }}
                    >
                      <User size={14} />
                      {user?.full_name || authUser?.full_name}
                    </Link>
                  ) : (
                    <>
                      <Link href="/account/login" style={{ color: footertxt }}>
                        Login
                      </Link>
                      <Link href="/account/signup" style={{ color: footertxt }}>
                        Signup
                      </Link>
                    </>
                  )}
                </nav>

                {/* Render other right content if exists */}
                {header_top.content?.right?.status !== false &&
                  header_top.content?.right?.type !== "buttons" &&
                  renderHeaderContent(header_top.content?.right, {
                    primary: primaryColor,
                    text: footertxt,
                  })}
              </div>
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
              <div className="flex items-center gap-2">
                <button
                  className="lg:hidden p-2 rounded hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(true)}
                  style={{ color: primaryColor }}
                >
                  <Menu size={24} />
                </button>{" "}
                <Link
                  href="/"
                  className="text-2xl font-bold"
                  style={{ color: primaryColor }}
                >
                  {/* Fixed: Added optional chaining and null checks for logo */}
                  {header_main?.content?.logo?.src ? (
                    <img
                      src={header_main.content.logo.src}
                      alt={
                        (useThemeData("general") as any)?.site_title || "Logo"
                      }
                      width={header_main.content.logo.width || 150}
                      height={header_main.content.logo.height || 50}
                    />
                  ) : (
                    <span>
                      {(useThemeData("general") as any)?.site_title || "Store"}
                    </span>
                  )}
                </Link>
              </div>

              {/* Desktop Search with Suggestions */}
              {header_main.content?.search?.status !== false && (
                <div className="hidden md:flex flex-1 mx-6 max-w-2xl relative">
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => setTimeout(() => setFocused(false), 200)}
                    placeholder={
                      header_main.content?.search?.placeholder ||
                      "Search for products, brands, categories..."
                    }
                    className="flex-1 rounded-l-full border px-4 py-2 text-sm focus:ring-2 outline-none"
                    style={{
                      borderColor: borderColor,
                      backgroundColor: inputBg,
                      color: textLight,
                    }}
                  />
                  <button
                    onClick={handleSearch}
                    className="text-white px-4 rounded-r-full hover:opacity-90 transition-opacity"
                    style={{
                      backgroundColor: primaryColor,
                    }}
                  >
                    <Search className="w-4 h-4" />
                  </button>

                  {/* Search Suggestions */}
                  {focused && searchQuery.length >= minChars && (
                    <div
                      className="absolute top-12 left-0 w-full border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50"
                      style={{
                        backgroundColor: backgroundColor,
                        borderColor: borderColor,
                      }}
                    >
                      {filteredProducts.length === 0 ? (
                        <div className="flex items-center justify-center gap-3 p-6">
                          <div
                            className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                            style={{
                              borderColor: primaryColor,
                              borderTopColor: "transparent",
                            }}
                          />
                          <span
                            className="text-sm"
                            style={{ color: textColor }}
                          >
                            Searching...
                          </span>
                        </div>
                      ) : (
                        <>
                          {filteredProducts.slice(0, 5).map((product) => {
                            const imgSrc =
                              product.images?.[0]?.url || "/placeholder.png";
                            return (
                              <div
                                key={product.id}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  router.push(`/product/${product.slug}`);
                                  setFocused(false);
                                  setSearchQuery("");
                                }}
                                className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                                style={{
                                  borderBottom: `1px solid ${borderColor}`,
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = `${primaryColor}10`;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "transparent";
                                }}
                              >
                                <img
                                  src={imgSrc}
                                  alt={product.name}
                                  className="w-12 h-12 rounded object-cover border"
                                  style={{ borderColor: borderColor }}
                                />
                                <div className="flex-1">
                                  <p
                                    className="text-sm font-medium truncate"
                                    style={{ color: primaryColor }}
                                  >
                                    {product.name}
                                  </p>
                                </div>
                              </div>
                            );
                          })}

                          {/* View all results */}
                          {filteredProducts.length > 0 && (
                            <div
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={handleSearch}
                              className="px-4 py-3 text-sm cursor-pointer text-center transition-colors"
                              style={{
                                color: primaryColor,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = `${primaryColor}10`;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                              }}
                            >
                              View all {filteredProducts.length} results for "
                              {searchQuery}"
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Right Icons */}
              <div className="flex items-center gap-3">
                {/* Mobile Search Trigger */}
                <button
                  className="md:hidden p-2 rounded hover:bg-gray-100"
                  onClick={() => setMobileSearch(true)}
                  style={{ color: textColor }}
                >
                  <Search size={20} />
                </button>

                {/* Action Buttons from theme */}
                {header_main.content?.action_buttons && (
                  <>
                    {Object.entries(header_main.content.action_buttons).map(
                      ([key, config]: [string, any]) => {
                        if (config?.status === false) return null;

                        const Icon =
                          IconMap[config?.icon || "cart"] || ShoppingCart;

                        if (key === "cart") {
                          return (
                            <Link
                              key={key}
                              href="/cart"
                              className="relative p-2 hover:opacity-80 transition-opacity"
                              style={{ color: primaryColor }}
                            >
                              <Icon size={22} />
                              {(cartLoading || wishlistLoading) && (
                                <span
                                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center text-white animate-pulse"
                                  style={{
                                    backgroundColor: textLight,
                                  }}
                                >
                                  ...
                                </span>
                              )}
                              {!cartLoading && totalItems > 0 && (
                                <span
                                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center text-white"
                                  style={{
                                    backgroundColor: secondaryColor,
                                  }}
                                >
                                  {totalItems}
                                </span>
                              )}
                            </Link>
                          );
                        }

                        if (key === "wishlist") {
                          return (
                            <Link
                              key={key}
                              href="/wishlist"
                              className="relative p-2 hover:opacity-80 transition-opacity"
                              style={{ color: primaryColor }}
                            >
                              <Icon size={22} />
                              {!wishlistLoading && items.length > 0 && (
                                <span
                                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center text-white"
                                  style={{
                                    backgroundColor: secondaryColor,
                                  }}
                                >
                                  {items.length}
                                </span>
                              )}
                            </Link>
                          );
                        }

                        return (
                          <Link
                            key={key}
                            href={`/${key}`}
                            className="relative p-2 hover:opacity-80 transition-opacity"
                            style={{ color: primaryColor }}
                          >
                            <Icon size={22} />
                          </Link>
                        );
                      },
                    )}
                  </>
                )}

                {/* Fallback icons if no action_buttons configured */}
                {!header_main.content?.action_buttons && (
                  <>
                    <Link
                      href="/wishlist"
                      className="relative p-2"
                      style={{ color: primaryColor }}
                    >
                      <Heart size={22} />
                      {!wishlistLoading && items.length > 0 && (
                        <span
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center text-white"
                          style={{ backgroundColor: secondaryColor }}
                        >
                          {items.length}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/cart"
                      className="relative p-2"
                      style={{ color: primaryColor }}
                    >
                      <ShoppingCart size={22} />
                      {!cartLoading && totalItems > 0 && (
                        <span
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center text-white"
                          style={{ backgroundColor: secondaryColor }}
                        >
                          {totalItems}
                        </span>
                      )}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Bottom - Navigation */}
      {header_bottom?.status && (
        <div
          className="border-t"
          style={{
            backgroundColor: navBg,
            borderColor: borderColor,
          }}
        >
          <div className="container mx-auto px-4">
            <div className="hidden lg:block">
              <CategoryNav />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Search */}
      <AnimatePresence>
        {mobileSearch && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            className="fixed inset-0 z-50 p-4"
            style={{ backgroundColor: backgroundColor }}
          >
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setMobileSearch(false)}
                style={{ color: textColor }}
              >
                <X size={24} />
              </button>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search products..."
                className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 outline-none"
                style={{
                  borderColor: borderColor,
                  backgroundColor: inputBg,
                  color: textColor,
                }}
                autoFocus
              />
            </div>
            <div className="p-4">
              {filteredProducts.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    router.push(`/product/${product.id}`);
                    setMobileSearch(false);
                  }}
                  className="flex items-center gap-3 py-2 border-b cursor-pointer"
                  style={{ borderColor: borderColor }}
                >
                  <img
                    src={product.images?.[0]?.url || "/placeholder.png"}
                    alt={product.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <p style={{ color: textColor }}>{product.name}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed top-0 right-0 w-80 h-full z-50 shadow-lg overflow-y-auto"
              style={{ backgroundColor: backgroundColor }}
            >
              <div
                className="flex justify-between items-center px-4 py-4 border-b"
                style={{ borderColor: borderColor }}
              >
                <span
                  className="text-lg font-semibold"
                  style={{ color: textColor }}
                >
                  {user || authUser ? "Welcome" : "Menu"}
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ color: textColor }}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-4 space-y-6">
                {/* Mobile Category Navigation */}
                <CategoryNav mobile />

                {/* Mobile Menu Links */}
                <div className="flex flex-col gap-3">
                  <Link
                    href="/track-order"
                    style={{ color: textColor }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Track Order
                  </Link>
                  {user || authUser ? (
                    <>
                      <Link
                        href="/profile"
                        style={{ color: primaryColor }}
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-medium"
                      >
                        {user?.full_name || authUser?.full_name}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="text-left cursor-pointer"
                        style={{ color: secondaryColor }}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/account/login"
                        style={{ color: textColor }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        href="/account/signup"
                        style={{ color: textColor }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Signup
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

// Helper function to render different content types
function renderHeaderContent(
  content: any,
  colors: { primary: any; text: any },
) {
  if (!content) return null;

  switch (content.type) {
    case "buttons":
      return (
        <div className="flex items-center gap-3">
          {content.items?.map((item: any, index: number) => {
            const Icon = IconMap[item.icon];
            const isTextVariant = item.variant === "text";

            return (
              <Link
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
              </Link>
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
              <Link
                key={index}
                href={item.link || "#"}
                className="flex items-center gap-1 text-sm hover:opacity-80"
                style={{ color: colors.text }}
              >
                {Icon && <Icon size={14} style={{ color: colors.primary }} />}
                <span>{item.text}</span>
              </Link>
            );
          })}
        </div>
      );

    default:
      return null;
  }
}
