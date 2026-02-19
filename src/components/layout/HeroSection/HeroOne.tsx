// components/hero/HeroOne.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useThemeData } from "@/app/store/useThemeData";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ChevronDown,
} from "lucide-react";
import { useCategoryStore } from "@/app/store/useCatrgoryStore";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Slide {
  image: string;
  title: string;
  title_bn?: string;
  subtitle: string;
  subtitle_bn?: string;
  button_text: string;
  button_text_bn?: string;
  button_link: string;
  text_position: "left" | "center" | "right";
  text_color: string;
}

interface Banner {
  image: string;
  title: string;
  subtitle: string;
  text_position: "left" | "center" | "right";
}

interface SplitLayout {
  side_menu_position: "left" | "right";
  side_menu_width: number;
}

interface HeroData {
  status: boolean;
  slides: Slide[];
  layout: "slider" | "split" | "single";
  autoplay: boolean;
  interval: number;
  split_layout?: SplitLayout;
  banner?: Banner;
}

// ── Matches the shape from useCategoryStore exactly (image is optional) ──────
interface CategoryItem {
  id: number;
  code?: string;
  parent_id: number | null;
  name: string;
  slug: string;
  image?: string | null; // optional — fixes the TS2719 mismatch
  status?: string;
  children?: CategoryItem[];
}

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  heading: string;
  link: string;
  footer_bg: string;
  footer_text: string;
  sale_badge: string;
  new_badge: string;
  discount_badge: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function isDark(hex: string): boolean {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b < 160;
}

// ─── Responsive hook ─────────────────────────────────────────────────────────

function useIsDesktop(breakpoint = 1024): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpoint}px)`);
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);

  return isDesktop;
}

// ─── Side Menu ───────────────────────────────────────────────────────────────

function SideMenu({
  categories,
  loading,
  colors,
}: {
  categories: CategoryItem[];
  loading: boolean;
  colors: ThemeColors;
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const parentCategories =
    categories?.filter((c) => c.parent_id === null) ?? [];

  const toggleExpand = (id: number) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const headerTextColor = isDark(colors.primary) ? "#ffffff" : "#111111";
  const headerSubColor = isDark(colors.primary)
    ? "rgba(255,255,255,0.5)"
    : "rgba(0,0,0,0.45)";

  const accentCycle = [
    colors.secondary,
    colors.accent,
    colors.link,
    colors.new_badge,
    colors.sale_badge,
    colors.discount_badge,
    "#06b6d4",
    "#8b5cf6",
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: colors.background,
        borderRadius: "12px",
        boxShadow: `0 2px 20px ${hexToRgba(colors.primary, 0.1)}`,
        overflow: "hidden",
        border: `1px solid ${hexToRgba(colors.primary, 0.06)}`,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: colors.primary,
          padding: "16px 20px",
          flexShrink: 0,
        }}
      >
        <h3
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: headerTextColor,
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          All Categories
        </h3>
      </div>

      {/* List */}
      <div
        style={{
          overflowY: "auto",
          flex: 1,
          scrollbarWidth: "thin",
          scrollbarColor: `${hexToRgba(colors.primary, 0.15)} transparent`,
        }}
      >
        {loading ? (
          <div style={{ padding: "8px 0" }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 20px",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    background: hexToRgba(colors.primary, 0.07),
                    flexShrink: 0,
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
                <div
                  style={{
                    height: "12px",
                    borderRadius: "4px",
                    background: hexToRgba(colors.primary, 0.07),
                    width: `${55 + ((i * 7) % 30)}%`,
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: "6px 0" }}>
            {parentCategories.map((cat, index) => {
              const hasChildren = !!(cat.children && cat.children.length > 0);
              const isExpanded = expandedId === cat.id;
              const isHovered = hoveredId === cat.id;
              const accent = accentCycle[index % accentCycle.length];
              const accentText = isDark(accent) ? "#ffffff" : "#111111";

              return (
                <div key={cat.id}>
                  {/* Parent row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      paddingRight: "12px",
                      transition: "background 0.15s ease",
                      background: isHovered
                        ? hexToRgba(colors.primary, 0.04)
                        : "transparent",
                      cursor: "pointer",
                    }}
                    onMouseEnter={() => setHoveredId(cat.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    {/* Left accent bar */}
                    <div
                      style={{
                        width: "3px",
                        alignSelf: "stretch",
                        background:
                          isHovered || isExpanded ? accent : "transparent",
                        transition: "background 0.15s ease",
                        flexShrink: 0,
                      }}
                    />

                    {/* Link */}
                    <Link
                      href={`/category/${cat.id}/${cat.slug}`}
                      onClick={(e) => {
                        if (hasChildren) {
                          e.preventDefault();
                          toggleExpand(cat.id);
                        }
                      }}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 8px 10px 12px",
                        textDecoration: "none",
                        minWidth: 0,
                      }}
                    >
                      {/* Letter avatar */}
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "7px",
                          background:
                            isHovered || isExpanded
                              ? accent
                              : hexToRgba(colors.primary, 0.07),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all 0.15s ease",
                          fontSize: "11px",
                          fontWeight: 800,
                          color:
                            isHovered || isExpanded
                              ? accentText
                              : hexToRgba(colors.text, 0.45),
                        }}
                      >
                        {cat.name.charAt(0).toUpperCase()}
                      </div>

                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: isHovered || isExpanded ? 600 : 500,
                          color:
                            isHovered || isExpanded
                              ? colors.heading
                              : colors.text,
                          transition: "all 0.15s ease",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {cat.name}
                      </span>
                    </Link>

                    {/* Chevron */}
                    {hasChildren && (
                      <button
                        onClick={() => toggleExpand(cat.id)}
                        style={{
                          padding: "4px",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          color: isExpanded
                            ? accent
                            : hexToRgba(colors.text, 0.35),
                          transition: "all 0.2s ease",
                          flexShrink: 0,
                        }}
                      >
                        <ChevronDown
                          style={{
                            width: "14px",
                            height: "14px",
                            transform: isExpanded
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                            transition: "transform 0.25s ease",
                          }}
                        />
                      </button>
                    )}
                  </div>

                  {/* Accordion children */}
                  <div
                    style={{
                      overflow: "hidden",
                      maxHeight: isExpanded
                        ? `${(cat.children?.length ?? 0) * 40}px`
                        : "0px",
                      transition: "max-height 0.3s ease",
                    }}
                  >
                    <div
                      style={{
                        background: hexToRgba(colors.primary, 0.025),
                        borderLeft: `2px solid ${accent}`,
                        marginLeft: "15px",
                        marginBottom: "4px",
                      }}
                    >
                      {cat.children?.map((child) => (
                        <Link
                          key={child.id}
                          href={`/category/${child.id}/${child.slug}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "9px 14px",
                            fontSize: "12.5px",
                            color: hexToRgba(colors.text, 0.7),
                            textDecoration: "none",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.color = accent;
                            el.style.background = hexToRgba(accent, 0.05);
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.color = hexToRgba(colors.text, 0.7);
                            el.style.background = "transparent";
                          }}
                        >
                          <span
                            style={{
                              width: "5px",
                              height: "5px",
                              borderRadius: "50%",
                              background: "currentColor",
                              flexShrink: 0,
                              opacity: 0.5,
                            }}
                          />
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: `1px solid ${hexToRgba(colors.primary, 0.08)}`,
          flexShrink: 0,
          background: colors.background,
        }}
      >
        <Link
          href="/categories"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "9px 16px",
            background: colors.primary,
            color: isDark(colors.primary) ? "#ffffff" : "#111111",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 600,
            textDecoration: "none",
            letterSpacing: "0.4px",
            transition: "opacity 0.15s ease",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.opacity = "0.82")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.opacity = "1")
          }
        >
          View All Categories
          <ChevronRight style={{ width: "13px", height: "13px" }} />
        </Link>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HeroOne() {
  const heroData = (useThemeData("hero_section") || {}) as HeroData;
  const rawColors = (useThemeData("colors") || {}) as Partial<ThemeColors>;
  const { categories, fetchCategories, loading, hydrated } = useCategoryStore();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const isDesktop = useIsDesktop(1024);

  const colors: ThemeColors = {
    primary: rawColors.primary ?? "#222524",
    secondary: rawColors.secondary ?? "#DA291C",
    accent: rawColors.accent ?? "#F68B1E",
    background: rawColors.background ?? "#ffffff",
    text: rawColors.text ?? "#222524",
    heading: rawColors.heading ?? "#111827",
    link: rawColors.link ?? "#006747",
    footer_bg: rawColors.footer_bg ?? "#222524",
    footer_text: rawColors.footer_text ?? "#F3F4F6",
    sale_badge: rawColors.sale_badge ?? "#DA291C",
    new_badge: rawColors.new_badge ?? "#006747",
    discount_badge: rawColors.discount_badge ?? "#F68B1E",
  };

  const ctaColor = colors.accent || colors.secondary;
  const ctaTextColor = isDark(ctaColor) ? "#ffffff" : "#111111";

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const {
    slides = [],
    autoplay = true,
    interval = 5000,
    layout = "slider",
    split_layout = { side_menu_position: "left", side_menu_width: 25 },
    banner,
  } = heroData;

  // Guard clauses
  if (!heroData.status) return null;
  if ((layout === "slider" || layout === "split") && !slides.length)
    return null;
  if (layout === "single" && !banner) return null;

  // Navigation
  const nextSlide = useCallback(() => {
    if (slides.length) setCurrentSlide((p) => (p + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length)
      setCurrentSlide((p) => (p - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      else if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [nextSlide, prevSlide]);

  useEffect(() => {
    if (layout !== "slider" && layout !== "split") return;
    if (!autoplay || !isAutoPlaying || isHovered) return;
    const t = setInterval(nextSlide, interval);
    return () => clearInterval(t);
  }, [layout, autoplay, isAutoPlaying, isHovered, nextSlide, interval]);

  const handleTouchStart = (e: React.TouchEvent) =>
    setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) =>
    setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) nextSlide();
    if (touchStart - touchEnd < -75) prevSlide();
  };

  // Alignment helpers
  const flexJustify = (pos = "center") => {
    if (pos === "left") return "flex-start";
    if (pos === "right") return "flex-end";
    return "center";
  };
  const textAlignStr = (pos = "center"): "left" | "center" | "right" => {
    if (pos === "left") return "left";
    if (pos === "right") return "right";
    return "center";
  };

  const navBtnBase: React.CSSProperties = {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: hexToRgba(colors.primary, 0.38),
    backdropFilter: "blur(6px)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.15s ease",
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 10,
  };

  // ── Slider ────────────────────────────────────────────────────────────────

  const renderSlider = () => {
    const slide = slides[currentSlide];

    // Responsive height: taller on desktop, compact on mobile
    const sliderHeight = isDesktop
      ? "clamp(280px, 42vw, 470px)"
      : "clamp(200px, 55vw, 340px)";

    return (
      <div
        style={{
          position: "relative",
          height: sliderHeight,
          width: "100%",
          borderRadius: isDesktop ? "12px" : "10px",
          overflow: "hidden",
          flexShrink: 0,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: "easeInOut" }}
            style={{ position: "absolute", inset: 0 }}
          >
            <img
              src={slide.image}
              alt={slide.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              loading="lazy"
            />

            {/* Overlay — always bottom-heavy on mobile for readability */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: isDesktop
                  ? slide.text_position === "right"
                    ? `linear-gradient(to left, ${hexToRgba(colors.primary, 0.8)} 0%, ${hexToRgba(colors.primary, 0.28)} 55%, rgba(0,0,0,0) 100%)`
                    : slide.text_position === "center"
                      ? `linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, ${hexToRgba(colors.primary, 0.62)} 100%)`
                      : `linear-gradient(to right, ${hexToRgba(colors.primary, 0.8)} 0%, ${hexToRgba(colors.primary, 0.28)} 55%, rgba(0,0,0,0) 100%)`
                  : // Mobile: always a bottom-to-top gradient, easy to read
                    `linear-gradient(to top, ${hexToRgba(colors.primary, 0.88)} 0%, ${hexToRgba(colors.primary, 0.4)} 50%, rgba(0,0,0,0.05) 100%)`,
                zIndex: 1,
              }}
            />

            {/* Accent strip */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "3px",
                background: `linear-gradient(90deg, ${colors.secondary}, ${colors.accent})`,
                zIndex: 3,
              }}
            />

            {/* Content — always bottom-left on mobile, position-aware on desktop */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 2,
                display: "flex",
                alignItems: isDesktop ? "center" : "flex-end",
                justifyContent: isDesktop
                  ? flexJustify(slide.text_position)
                  : "flex-start",
                padding: isDesktop
                  ? "0 clamp(20px, 4vw, 56px)"
                  : "0 16px 20px 16px",
              }}
            >
              <div
                style={{
                  maxWidth: isDesktop ? "520px" : "100%",
                  textAlign: isDesktop
                    ? textAlignStr(slide.text_position)
                    : "left",
                }}
              >
                <motion.h1
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                  style={{
                    fontSize: isDesktop
                      ? "clamp(20px, 3.2vw, 44px)"
                      : "clamp(16px, 5vw, 24px)",
                    fontWeight: 800,
                    lineHeight: 1.15,
                    marginBottom: isDesktop ? "12px" : "6px",
                    color: slide.text_color || "#ffffff",
                    letterSpacing: "-0.02em",
                    textShadow: "0 2px 14px rgba(0,0,0,0.35)",
                  }}
                >
                  {slide.title}
                </motion.h1>

                {/* Hide subtitle on very small screens */}
                <motion.p
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.5 }}
                  style={{
                    fontSize: isDesktop ? "clamp(12px, 1.4vw, 15px)" : "12px",
                    marginBottom: isDesktop ? "22px" : "14px",
                    color: slide.text_color || "#ffffff",
                    opacity: 0.88,
                    lineHeight: 1.55,
                    textShadow: "0 1px 6px rgba(0,0,0,0.3)",
                    display: isDesktop ? undefined : "-webkit-box",
                    WebkitLineClamp: isDesktop ? undefined : 2,
                    WebkitBoxOrient: isDesktop ? undefined : "vertical",
                    overflow: isDesktop ? undefined : "hidden",
                  }}
                >
                  {slide.subtitle}
                </motion.p>
                {slide.button_link !== "" && (
                  <motion.div
                    initial={{ y: 24, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                    style={{
                      display: "flex",
                      gap: "8px",
                      justifyContent: isDesktop
                        ? flexJustify(slide.text_position)
                        : "flex-start",
                      flexWrap: "wrap",
                    }}
                  >
                    <Link
                      href={slide.button_link}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: isDesktop ? "10px 22px" : "8px 16px",
                        background: ctaColor,
                        color: ctaTextColor,
                        borderRadius: "8px",
                        fontWeight: 700,
                        fontSize: isDesktop ? "13px" : "12px",
                        textDecoration: "none",
                        boxShadow: `0 4px 16px ${hexToRgba(ctaColor, 0.45)}`,
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.transform = "translateY(-2px)";
                        el.style.boxShadow = `0 8px 24px ${hexToRgba(ctaColor, 0.55)}`;
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.transform = "translateY(0)";
                        el.style.boxShadow = `0 4px 16px ${hexToRgba(ctaColor, 0.45)}`;
                      }}
                    >
                      {slide.button_text}
                      <ChevronRight style={{ width: "14px", height: "14px" }} />
                    </Link>

                    {/* Ghost CTA — hide on very small mobile to save space */}
                    {/* {isDesktop && (
                    <Link
                      href="/deals"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "10px 22px",
                        background: "rgba(255,255,255,0.15)",
                        backdropFilter: "blur(8px)",
                        color: "#fff",
                        borderRadius: "8px",
                        fontWeight: 600,
                        fontSize: "13px",
                        textDecoration: "none",
                        border: "1px solid rgba(255,255,255,0.3)",
                        transition: "background 0.2s ease",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          "rgba(255,255,255,0.25)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          "rgba(255,255,255,0.15)")
                      }
                    >
                      View Deals
                    </Link>
                  )} */}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next — only on desktop */}
        {slides.length > 1 && isDesktop && (
          <>
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              style={{ ...navBtnBase, left: "12px" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = hexToRgba(
                  colors.primary,
                  0.65,
                ))
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = hexToRgba(
                  colors.primary,
                  0.38,
                ))
              }
            >
              <ChevronLeft style={{ width: "18px", height: "18px" }} />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              style={{ ...navBtnBase, right: "12px" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = hexToRgba(
                  colors.primary,
                  0.65,
                ))
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = hexToRgba(
                  colors.primary,
                  0.38,
                ))
              }
            >
              <ChevronRight style={{ width: "18px", height: "18px" }} />
            </button>
          </>
        )}

        {/* Dots */}
        {slides.length > 1 && (
          <div
            style={{
              position: "absolute",
              bottom: isDesktop ? "14px" : "10px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
              display: "flex",
              gap: "5px",
              alignItems: "center",
            }}
          >
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: i === currentSlide ? "18px" : "6px",
                  height: "6px",
                  borderRadius: "3px",
                  background:
                    i === currentSlide ? ctaColor : "rgba(255,255,255,0.55)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  padding: 0,
                }}
              />
            ))}
          </div>
        )}

        {/* Autoplay toggle — desktop only */}
        {autoplay && slides.length > 1 && isDesktop && (
          <button
            onClick={() => setIsAutoPlaying((p) => !p)}
            aria-label={isAutoPlaying ? "Pause autoplay" : "Resume autoplay"}
            style={{
              position: "absolute",
              bottom: "12px",
              right: "12px",
              zIndex: 10,
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: hexToRgba(colors.primary, 0.38),
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {isAutoPlaying ? (
              <Pause style={{ width: "13px", height: "13px" }} />
            ) : (
              <Play style={{ width: "13px", height: "13px" }} />
            )}
          </button>
        )}

        {/* Slide counter — desktop only */}
        {isDesktop && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              zIndex: 10,
              padding: "3px 10px",
              background: hexToRgba(colors.primary, 0.38),
              backdropFilter: "blur(6px)",
              color: "#fff",
              fontSize: "11px",
              fontWeight: 600,
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            {currentSlide + 1} / {slides.length}
          </div>
        )}
      </div>
    );
  };

  // ── Single Banner ─────────────────────────────────────────────────────────

  const renderSingleBanner = () => {
    if (!banner) return null;

    const bannerHeight = isDesktop
      ? "clamp(300px, 45vw, 520px)"
      : "clamp(220px, 60vw, 360px)";

    return (
      <div
        style={{
          position: "relative",
          height: bannerHeight,
          width: "100%",
          borderRadius: isDesktop ? "16px" : "10px",
          overflow: "hidden",
        }}
      >
        <img
          src={banner.image}
          alt={banner.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />

        {/* Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: isDesktop
              ? banner.text_position === "right"
                ? `linear-gradient(105deg, rgba(0,0,0,0) 35%, ${hexToRgba(colors.primary, 0.85)} 100%)`
                : banner.text_position === "center"
                  ? `radial-gradient(ellipse at center, ${hexToRgba(colors.primary, 0.62)} 0%, rgba(0,0,0,0.1) 100%)`
                  : `linear-gradient(105deg, ${hexToRgba(colors.primary, 0.85)} 0%, rgba(0,0,0,0) 65%)`
              : // Mobile: bottom-heavy
                `linear-gradient(to top, ${hexToRgba(colors.primary, 0.9)} 0%, ${hexToRgba(colors.primary, 0.45)} 55%, rgba(0,0,0,0.05) 100%)`,
            zIndex: 1,
          }}
        />

        {/* Accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: `linear-gradient(90deg, ${colors.secondary}, ${colors.accent}, ${colors.link})`,
            zIndex: 3,
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            display: "flex",
            alignItems: isDesktop ? "center" : "flex-end",
            justifyContent: isDesktop
              ? flexJustify(banner.text_position)
              : "flex-start",
            padding: isDesktop
              ? "0 clamp(24px, 5vw, 80px)"
              : "0 16px 24px 16px",
          }}
        >
          <div
            style={{
              maxWidth: isDesktop ? "600px" : "100%",
              textAlign: isDesktop
                ? textAlignStr(banner.text_position)
                : "left",
            }}
          >
            <motion.div
              initial={{ y: 32, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badge */}
              <span
                style={{
                  display: "inline-block",
                  padding: isDesktop ? "5px 14px" : "4px 10px",
                  background: colors.accent,
                  color: isDark(colors.accent) ? "#fff" : "#111",
                  borderRadius: "20px",
                  fontSize: isDesktop ? "11px" : "10px",
                  fontWeight: 800,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  marginBottom: isDesktop ? "16px" : "8px",
                }}
              >
                Featured
              </span>

              <h1
                style={{
                  fontSize: isDesktop
                    ? "clamp(28px, 4.5vw, 62px)"
                    : "clamp(18px, 6vw, 32px)",
                  fontWeight: 900,
                  lineHeight: 1.1,
                  marginBottom: isDesktop ? "16px" : "8px",
                  color: "#fff",
                  letterSpacing: "-0.03em",
                  textShadow: "0 2px 20px rgba(0,0,0,0.3)",
                }}
              >
                {banner.title}
              </h1>
            </motion.div>

            <motion.p
              initial={{ y: 32, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.18, duration: 0.6 }}
              style={{
                fontSize: isDesktop ? "clamp(13px, 1.6vw, 18px)" : "13px",
                marginBottom: isDesktop ? "32px" : "16px",
                color: "rgba(255,255,255,0.88)",
                lineHeight: 1.6,
                display: isDesktop ? undefined : "-webkit-box",
                WebkitLineClamp: isDesktop ? undefined : 2,
                WebkitBoxOrient: isDesktop ? undefined : "vertical",
                overflow: isDesktop ? undefined : "hidden",
              }}
            >
              {banner.subtitle}
            </motion.p>

            <motion.div
              initial={{ y: 32, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: isDesktop
                  ? flexJustify(banner.text_position)
                  : "flex-start",
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/shop"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: isDesktop ? "13px 30px" : "10px 20px",
                  background: ctaColor,
                  color: ctaTextColor,
                  borderRadius: "10px",
                  fontWeight: 800,
                  fontSize: isDesktop ? "14px" : "13px",
                  textDecoration: "none",
                  boxShadow: `0 6px 24px ${hexToRgba(ctaColor, 0.48)}`,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "translateY(-3px)";
                  el.style.boxShadow = `0 12px 32px ${hexToRgba(ctaColor, 0.58)}`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = `0 6px 24px ${hexToRgba(ctaColor, 0.48)}`;
                }}
              >
                Shop Now
                <ChevronRight style={{ width: "16px", height: "16px" }} />
              </Link>

              {isDesktop && (
                <Link
                  href="/categories"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "13px 30px",
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(10px)",
                    color: "#fff",
                    borderRadius: "10px",
                    fontWeight: 600,
                    fontSize: "14px",
                    textDecoration: "none",
                    border: "1px solid rgba(255,255,255,0.3)",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "rgba(255,255,255,0.22)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "rgba(255,255,255,0.12)")
                  }
                >
                  Browse Categories
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    );
  };

  // ── Layout ────────────────────────────────────────────────────────────────

  const renderContent = () => {
    switch (layout) {
      case "split": {
        const menuPos = split_layout?.side_menu_position || "left";
        const menuW = split_layout?.side_menu_width || 25;
        const sliderW = 100 - menuW;

        // On mobile / tablet: hide the side menu, show full-width slider only
        if (!isDesktop) {
          return renderSlider();
        }

        return (
          <div
            style={{
              display: "flex",
              gap: "16px",
              flexDirection: menuPos === "right" ? "row-reverse" : "row",
              alignItems: "stretch",
              height: "clamp(280px, 42vw, 470px)",
            }}
          >
            <div style={{ width: `${menuW}%`, minWidth: 0 }}>
              <SideMenu
                categories={(categories ?? []) as CategoryItem[]}
                loading={loading}
                colors={colors}
              />
            </div>
            <div style={{ width: `${sliderW}%`, minWidth: 0 }}>
              {renderSlider()}
            </div>
          </div>
        );
      }

      case "single":
        return renderSingleBanner();

      case "slider":
      default:
        return renderSlider();
    }
  };

  return (
    <section style={{ padding: isDesktop ? "16px 0" : "12px 0" }}>
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          // padding: isDesktop ? "0 16px" : "0 12px",
        }}
      >
        {renderContent()}
      </div>
    </section>
  );
}
