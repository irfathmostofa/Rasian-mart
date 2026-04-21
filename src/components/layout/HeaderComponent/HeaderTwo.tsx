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
import CartDrawer from "../Cartdrawer";

// ─── Icon map ─────────────────────────────────────────────────────────────────

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

// ─── Types ────────────────────────────────────────────────────────────────────

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
    status?: string;
  };
  action_buttons?: Record<string, { status?: boolean; icon?: string }>;
  menu?: { items?: Array<{ label: string; link: string }> };
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
    site_title?: { status?: string; text?: string };
  };
  header_bottom?: {
    type?: string;
    menu_id?: string;
    status?: string;
    sticky?: string;
    mobile_menu?: { toggle_icon?: string };
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

// ─── Helper: render content sections ─────────────────────────────────────────

function renderHeaderContent(
  content: ContentSection | undefined,
  colors: { primary: string; text: string },
) {
  if (!content) return null;

  switch (content.type) {
    case "buttons":
      return (
        <div className="flex items-center gap-2 flex-wrap">
          {content.items?.map((item, index) => {
            const Icon = item.icon ? IconMap[item.icon] : null;
            const isText = item.variant === "text";
            return (
              <Link
                key={index}
                href={item.link || "#"}
                className={`flex items-center gap-1 hover:opacity-80 transition-opacity text-xs sm:text-sm ${
                  isText ? "" : "px-2.5 py-1 rounded-md text-white"
                }`}
                style={{
                  color: isText ? colors.primary : undefined,
                  backgroundColor: !isText ? colors.primary : "transparent",
                }}
              >
                {Icon && <Icon size={12} />}
                <span>{item.text}</span>
              </Link>
            );
          })}
        </div>
      );

    case "text":
      return (
        <div className="flex items-center gap-3 flex-wrap">
          {content.items?.map((item, index) => {
            const Icon = item.icon ? IconMap[item.icon] : null;
            return (
              <Link
                key={index}
                href={item.link || "#"}
                className="flex items-center gap-1 text-xs sm:text-sm hover:opacity-80 transition-opacity"
                style={{ color: colors.text }}
              >
                {Icon && <Icon size={12} style={{ color: colors.primary }} />}
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeaderTwo() {
  const router = useRouter();

  const headerData = (useThemeData("header_section") || {}) as HeaderData;
  const colors = (useThemeData("colors") || {}) as Colors;
  const typography = (useThemeData("typography") || {}) as Record<
    string,
    string
  >;

  const { cart, isLoading: cartLoading } = useCart();
  const { items, isLoading: wishlistLoading } = useWishlist();
  const { user, clearSession } = useUserStore();
  const { products, fetchProducts } = useProductStore();
  const { user: authUser } = useUserStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const { header_top, header_main, header_bottom } = headerData;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (authUser?.id) {
      useCart.getState().initializeCart(authUser.id);
      useWishlist.getState().initializeWishlist(authUser.id);
    }
  }, [authUser]);

  if (headerData?.status === false) return null;

  // Colors
  const primaryColor = colors?.primary || "#006747";
  const secondaryColor = colors?.secondary || "#DA291C";
  const textColor = colors?.text || "#222524";
  const backgroundColor = colors?.background || "#ffffff";
  const borderColor = colors?.border || "#e5e7eb";
  const headerBg = colors?.header_bg || backgroundColor;
  const navBg = colors?.nav_bg || backgroundColor;
  const inputBg = colors?.input_bg || "#ffffff";
  const textLight = colors?.text_light || "#9ca3af";
  const footerBg = colors?.footer_bg || primaryColor;
  const footerText = colors?.footer_text || "#ffffff";

  // Search
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
    if (e.key === "Enter") handleSearch();
  };

  const handleLogout = () => {
    clearSession();
    useCart.getState().resetCart();
    useWishlist.getState().resetWishlist();
    setMobileMenuOpen(false);
  };

  const isLoggedIn = !!(user || authUser);
  const userName = user?.full_name || authUser?.full_name;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
      />

      <header
        className="w-full sticky top-0 z-40 shadow"
        style={{
          fontFamily: typography?.font_family || "sans-serif",
          backgroundColor,
        }}
      >
        {/* ── Header Top ─────────────────────────────────────────────────────── */}
        {header_top?.status && (
          <div
            className="border-b"
            style={{ backgroundColor: footerBg, borderColor }}
          >
            <div className="container mx-auto px-3 sm:px-4">
              {/* ── Mobile top bar ── */}
              <div className="flex items-center min-h-9 gap-2 sm:hidden py-1">
                {/* Left: ticker or text */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  {header_top.content?.left?.status !== false &&
                    (header_top.content?.left?.type === "news_ticker" ? (
                      <LiveNewsTicker
                        data={header_top.content.left}
                        colors={{ primary: primaryColor, text: footerText }}
                      />
                    ) : (
                      <div
                        className="text-[11px] leading-tight truncate opacity-90"
                        style={{ color: footerText }}
                      >
                        {header_top.content?.left?.items?.[0]?.text}
                      </div>
                    ))}
                </div>

                {/* Divider */}
                <div
                  className="w-px h-3.5 shrink-0 opacity-30"
                  style={{ backgroundColor: footerText }}
                />

                {/* Right: auth links */}
                <div className="flex items-center gap-2 shrink-0">
                  {isLoggedIn ? (
                    <Link
                      href="/profile"
                      className="flex items-center gap-1 text-[11px] font-medium leading-none"
                      style={{ color: footerText }}
                    >
                      <User size={11} />
                      <span className="max-w-18 truncate">
                        {userName?.split(" ")[0]}
                      </span>
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/account/login"
                        className="text-[11px] leading-none hover:opacity-80 transition-opacity"
                        style={{ color: footerText }}
                      >
                        Login
                      </Link>
                      <span
                        className="text-[10px] opacity-30"
                        style={{ color: footerText }}
                      >
                        |
                      </span>
                      <Link
                        href="/account/signup"
                        className="text-[11px] leading-none font-medium hover:opacity-80 transition-opacity"
                        style={{ color: footerText }}
                      >
                        Sign up
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* ── Desktop top bar: 3-column grid ── */}
              <div className="hidden sm:grid sm:grid-cols-3 items-center min-h-10 text-sm">
                {/* Left */}
                <div className="flex items-center min-w-0">
                  {header_top.content?.left?.status !== false &&
                    (header_top.content?.left?.type === "news_ticker" ? (
                      <LiveNewsTicker
                        data={header_top.content.left}
                        colors={{ primary: primaryColor, text: footerText }}
                      />
                    ) : (
                      renderHeaderContent(header_top.content?.left, {
                        primary: primaryColor,
                        text: footerText,
                      })
                    ))}
                </div>

                {/* Center */}
                <div className="flex items-center justify-center">
                  {header_top.content?.center?.status !== false &&
                    renderHeaderContent(header_top.content?.center, {
                      primary: primaryColor,
                      text: footerText,
                    })}
                </div>

                {/* Right */}
                <div className="flex items-center justify-end gap-4">
                  <nav className="flex items-center gap-4 whitespace-nowrap text-sm">
                    <Link
                      href="/help"
                      className="hover:opacity-80 transition-opacity"
                      style={{ color: footerText }}
                    >
                      Help
                    </Link>
                    <Link
                      href="/track-order"
                      className="hover:opacity-80 transition-opacity"
                      style={{ color: footerText }}
                    >
                      Track Order
                    </Link>
                    {isLoggedIn ? (
                      <Link
                        href="/profile"
                        className="flex items-center gap-1 font-medium hover:opacity-80"
                        style={{ color: footerText }}
                      >
                        <User size={14} />
                        <span className="max-w-30 truncate">{userName}</span>
                      </Link>
                    ) : (
                      <>
                        <Link
                          href="/account/login"
                          className="hover:opacity-80 transition-opacity"
                          style={{ color: footerText }}
                        >
                          Login
                        </Link>
                        <Link
                          href="/account/signup"
                          className="hover:opacity-80 transition-opacity"
                          style={{ color: footerText }}
                        >
                          Signup
                        </Link>
                      </>
                    )}
                  </nav>

                  {/* Additional right content (non-button types) */}
                  {header_top.content?.right?.status !== false &&
                    header_top.content?.right?.type !== "buttons" &&
                    renderHeaderContent(header_top.content?.right, {
                      primary: primaryColor,
                      text: footerText,
                    })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Header Main ────────────────────────────────────────────────────── */}
        {header_main && (
          <div
            className="py-2.5 sm:py-4"
            style={{
              backgroundColor: headerBg,
              borderBottom: `1px solid ${borderColor}`,
            }}
          >
            <div className="container mx-auto px-3 sm:px-4">
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Hamburger (mobile) */}
                <button
                  className="lg:hidden p-2 rounded hover:bg-gray-100 shrink-0"
                  onClick={() => setMobileMenuOpen(true)}
                  style={{ color: primaryColor }}
                >
                  <Menu size={22} />
                </button>

                {/* Logo */}
                <Link
                  href="/"
                  className="text-xl sm:text-2xl font-bold flex items-center gap-2 shrink-0"
                  style={{ color: primaryColor }}
                >
                  {header_main?.content?.logo?.status && (
                    <img
                      src={header_main.content.logo.src}
                      alt={header_main?.site_title?.text || "Logo"}
                      width={header_main.content.logo.width || 130}
                      height={header_main.content.logo.height || 44}
                      className="h-9 sm:h-11 w-auto object-contain"
                    />
                  )}
                  {header_main?.site_title?.status && (
                    <span className="hidden sm:inline">
                      {header_main.site_title.text}
                    </span>
                  )}
                </Link>

                {/* Desktop search */}
                {header_main.content?.search?.status !== false && (
                  <div className="hidden md:flex flex-1 mx-4 lg:mx-6 max-w-2xl relative">
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setFocused(true)}
                      onKeyDown={handleKeyDown}
                      onBlur={() => setTimeout(() => setFocused(false), 200)}
                      placeholder={
                        header_main.content?.search?.placeholder ||
                        "Search products, brands, categories…"
                      }
                      className="flex-1 rounded-l-full border px-4 py-2 text-sm focus:ring-2 outline-none"
                      style={{
                        borderColor,
                        backgroundColor: inputBg,
                        color: textColor,
                      }}
                    />
                    <button
                      onClick={handleSearch}
                      className="text-white px-4 rounded-r-full hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Search className="w-4 h-4" />
                    </button>

                    {/* Search suggestions dropdown */}
                    {focused && searchQuery.length >= minChars && (
                      <div
                        className="absolute top-12 left-0 w-full border rounded-xl shadow-lg max-h-96 overflow-y-auto z-50"
                        style={{ backgroundColor, borderColor }}
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
                              Searching…
                            </span>
                          </div>
                        ) : (
                          <>
                            {filteredProducts.slice(0, 6).map((product) => (
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
                                  e.currentTarget.style.backgroundColor = `${primaryColor}12`;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "transparent";
                                }}
                              >
                                <img
                                  src={
                                    product.images?.[0]?.url ||
                                    "/placeholder.png"
                                  }
                                  alt={product.name}
                                  className="w-11 h-11 rounded-lg object-cover border shrink-0"
                                  style={{ borderColor }}
                                />
                                <p
                                  className="text-sm font-medium truncate"
                                  style={{ color: primaryColor }}
                                >
                                  {product.name}
                                </p>
                              </div>
                            ))}

                            <div
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={handleSearch}
                              className="px-4 py-3 text-sm cursor-pointer text-center font-medium transition-colors"
                              style={{ color: primaryColor }}
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
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Right action icons */}
                <div className="flex items-center gap-1 sm:gap-2 ml-auto">
                  {/* Mobile search trigger */}
                  <button
                    className="md:hidden p-2 rounded hover:bg-gray-100"
                    onClick={() => setMobileSearch(true)}
                    style={{ color: primaryColor }}
                  >
                    <Search size={20} />
                  </button>

                  {/* Configured action buttons */}
                  {header_main.content?.action_buttons &&
                    Object.entries(header_main.content.action_buttons).map(
                      ([key, config]: [string, any]) => {
                        if (config?.status === false) return null;
                        const Icon =
                          IconMap[config?.icon || "cart"] || ShoppingCart;

                        if (key === "cart") {
                          return (
                            <button
                              key={key}
                              onClick={() => setCartDrawerOpen(true)}
                              className="relative p-2 hover:opacity-80 transition-opacity"
                              style={{ color: primaryColor }}
                            >
                              <Icon size={22} />
                              {cartLoading || wishlistLoading ? (
                                <span
                                  className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full text-xs flex items-center justify-center text-white animate-pulse"
                                  style={{ backgroundColor: textLight }}
                                >
                                  …
                                </span>
                              ) : totalItems > 0 ? (
                                <span
                                  className="absolute -top-1 -right-1 min-w-4.5 h-4.5 sm:min-w-5 sm:h-5 rounded-full text-[10px] sm:text-xs flex items-center justify-center text-white px-0.5"
                                  style={{ backgroundColor: secondaryColor }}
                                >
                                  {totalItems > 99 ? "99+" : totalItems}
                                </span>
                              ) : null}
                            </button>
                          );
                        }

                        if (key === "wishlist") {
                          return (
                            <Link
                              key={key}
                              href="/profile?tab=wishlist"
                              className="relative p-2 hover:opacity-80 transition-opacity"
                              style={{ color: primaryColor }}
                            >
                              <Icon size={22} />
                              {!wishlistLoading && items.length > 0 && (
                                <span
                                  className="absolute -top-1 -right-1 min-w-4.5 h-4.5 sm:min-w-5 sm:h-5 rounded-full text-[10px] sm:text-xs flex items-center justify-center text-white px-0.5"
                                  style={{ backgroundColor: secondaryColor }}
                                >
                                  {items.length > 99 ? "99+" : items.length}
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

                  {/* Fallback icons */}
                  {!header_main.content?.action_buttons && (
                    <>
                      <Link
                        href="/profile?tab=wishlist"
                        className="relative p-2"
                        style={{ color: primaryColor }}
                      >
                        <Heart size={22} />
                        {!wishlistLoading && items.length > 0 && (
                          <span
                            className="absolute -top-1 -right-1 min-w-4.5 h-4.5 rounded-full text-[10px] flex items-center justify-center text-white px-0.5"
                            style={{ backgroundColor: secondaryColor }}
                          >
                            {items.length}
                          </span>
                        )}
                      </Link>
                      <button
                        onClick={() => setCartDrawerOpen(true)}
                        className="relative p-2"
                        style={{ color: primaryColor }}
                      >
                        <ShoppingCart size={22} />
                        {!cartLoading && totalItems > 0 && (
                          <span
                            className="absolute -top-1 -right-1 min-w-4.5 h-4.5 rounded-full text-[10px] flex items-center justify-center text-white px-0.5"
                            style={{ backgroundColor: secondaryColor }}
                          >
                            {totalItems}
                          </span>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Header Bottom (desktop nav) ─────────────────────────────────────── */}
        {header_bottom?.status && (
          <div
            className="border-t hidden lg:block"
            style={{ backgroundColor: navBg, borderColor }}
          >
            <div className="container mx-auto px-4">
              <CategoryNav />
            </div>
          </div>
        )}

        {/* ── Mobile Search overlay ───────────────────────────────────────────── */}
        <AnimatePresence>
          {mobileSearch && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="fixed inset-0 z-50 flex flex-col"
              style={{ backgroundColor }}
            >
              {/* Search bar */}
              <div
                className="flex items-center gap-3 px-4 py-3 border-b"
                style={{ borderColor }}
              >
                <button
                  onClick={() => setMobileSearch(false)}
                  style={{ color: textColor }}
                >
                  <X size={22} />
                </button>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    header_main?.content?.search?.placeholder ||
                    "Search products…"
                  }
                  className="flex-1 text-sm outline-none bg-transparent"
                  style={{ color: textColor }}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    style={{ color: textLight }}
                  >
                    <X size={16} />
                  </button>
                )}
                <button
                  onClick={handleSearch}
                  className="p-2 rounded-full"
                  style={{ backgroundColor: primaryColor, color: "#fff" }}
                >
                  <Search size={16} />
                </button>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto">
                {searchQuery.length >= minChars ? (
                  filteredProducts.length === 0 ? (
                    <div className="flex items-center justify-center gap-3 p-8">
                      <div
                        className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                        style={{
                          borderColor: primaryColor,
                          borderTopColor: "transparent",
                        }}
                      />
                      <span className="text-sm" style={{ color: textLight }}>
                        Searching…
                      </span>
                    </div>
                  ) : (
                    <>
                      <p
                        className="px-4 py-2 text-xs font-semibold uppercase tracking-wide"
                        style={{ color: textLight }}
                      >
                        {filteredProducts.length} results
                      </p>
                      {filteredProducts.slice(0, 8).map((product) => (
                        <div
                          key={product.id}
                          onClick={() => {
                            router.push(`/product/${product.slug}`);
                            setMobileSearch(false);
                            setSearchQuery("");
                          }}
                          className="flex items-center gap-3 px-4 py-3 border-b active:bg-gray-50 cursor-pointer"
                          style={{ borderColor }}
                        >
                          <img
                            src={product.images?.[0]?.url || "/placeholder.png"}
                            alt={product.name}
                            className="w-14 h-14 rounded-xl object-cover border shrink-0"
                            style={{ borderColor }}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-medium line-clamp-2"
                              style={{ color: textColor }}
                            >
                              {product.name}
                            </p>
                            {product.selling_price && (
                              <p
                                className="text-sm font-bold mt-0.5"
                                style={{ color: primaryColor }}
                              >
                                ৳
                                {Number(product.selling_price).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      {filteredProducts.length > 8 && (
                        <button
                          onClick={handleSearch}
                          className="w-full py-4 text-sm font-semibold"
                          style={{ color: primaryColor }}
                        >
                          View all {filteredProducts.length} results →
                        </button>
                      )}
                    </>
                  )
                ) : (
                  <div
                    className="px-4 py-6 text-sm text-center"
                    style={{ color: textLight }}
                  >
                    Type at least {minChars} characters to search
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Mobile Menu drawer ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/50 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
              />

              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.25 }}
                className="fixed top-0 left-0 w-[85vw] max-w-sm h-full z-50 shadow-2xl overflow-y-auto flex flex-col"
                style={{ backgroundColor }}
              >
                {/* Drawer header */}
                <div
                  className="flex justify-between items-center px-4 py-4 border-b shrink-0"
                  style={{ borderColor, backgroundColor: footerBg }}
                >
                  <span
                    className="text-base font-semibold"
                    style={{ color: footerText }}
                  >
                    {isLoggedIn ? `Hi, ${userName?.split(" ")[0]}` : "Menu"}
                  </span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ color: footerText }}
                  >
                    <X size={22} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {/* Category navigation */}
                  <div className="p-4 border-b" style={{ borderColor }}>
                    <CategoryNav mobile />
                  </div>

                  {/* Account / links */}
                  <div className="p-4 space-y-1">
                    <p
                      className="text-xs font-semibold uppercase tracking-wide mb-3"
                      style={{ color: textLight }}
                    >
                      Account
                    </p>
                    <Link
                      href="/cart"
                      className="flex items-center py-2.5 text-sm border-b"
                      style={{ color: textColor, borderColor }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Cart ({totalItems})
                    </Link>
                    {[
                      { href: "/track-order", label: "Track Order" },
                      { href: "/help", label: "Help & Support" },
                    ].map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        className="flex items-center py-2.5 text-sm border-b"
                        style={{ color: textColor, borderColor }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {label}
                      </Link>
                    ))}

                    {isLoggedIn ? (
                      <>
                        <Link
                          href="/profile"
                          className="flex items-center py-2.5 text-sm border-b font-medium"
                          style={{ color: primaryColor, borderColor }}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          My Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left py-2.5 text-sm font-medium"
                          style={{ color: secondaryColor }}
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <div className="flex gap-3 pt-2">
                        <Link
                          href="/account/login"
                          className="flex-1 text-center py-2.5 rounded-lg border text-sm font-medium"
                          style={{
                            borderColor: primaryColor,
                            color: primaryColor,
                          }}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Login
                        </Link>
                        <Link
                          href="/account/signup"
                          className="flex-1 text-center py-2.5 rounded-lg text-sm font-medium text-white"
                          style={{ backgroundColor: primaryColor }}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Sign Up
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
