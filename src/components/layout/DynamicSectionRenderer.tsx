// components/sections/DynamicSectionRenderer.tsx
"use client";

import React, { useCallback, useMemo, memo, type JSX } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight, TrendingUp, Clock, Star, Sparkles } from "lucide-react";
import { useThemeData } from "@/app/store/useThemeData";
import {
  useRecentProducts,
  useBestSellingProducts,
  useFeaturedProducts,
} from "@/app/store/useProductStore";
import { ProductCard } from "@/components/ProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useCategoryStore } from "@/app/store/useCatrgoryStore";

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface Banner {
  image: string;
  title: string;
  title_bn?: string;
  subtitle: string;
  subtitle_bn?: string;
  button_text: string;
  button_text_bn?: string;
  link: string;
  size: "full" | "half" | "third" | "quarter";
  text_position: "left" | "center" | "right";
  text_color: string;
  overlay_opacity: number;
  button_color: string;
}

interface Brand {
  name: string;
  name_bn?: string;
  logo: string;
  link: string;
}

export interface Section {
  id: string;
  type:
    | "category_grid"
    | "featured_products"
    | "banner"
    | "featured_brands"
    | "recent_products"
    | "best_sellers";
  title: string;
  title_bn?: string;
  status: boolean;
  layout?: "grid" | "slider";
  columns?: number;
  grid_columns?: number;
  categoryids?: number[];
  banner_image?: string;
  banners?: Banner[];
  brands?: Brand[];
  show_images?: boolean;
  bg_color?: string;
  text_color?: string;
  padding?: string;
  margin?: string;
  border_radius?: string;
  products_count?: number;
  days?: number;
}

interface Product {
  id: number;
  primary_variant_id: number;
  name: string;
  slug: string;
  categories?: {
    id: number;
    name: string;
    slug?: string;
    code: string;
    image: string | null;
    is_primary: boolean;
  }[];
  selling_price: string | number;
  regular_price: string | number;
  cost_price?: string | number;
  badge?: string | null;
  total_stock?: string | number;
  rating?: number | null;
  images?:
    | { id: number; url: string; alt_text: string; is_primary: boolean }[]
    | null;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  parent_id?: number | null;
  children?: Category[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<string, JSX.Element | null> = {
  best_sellers: <TrendingUp className="w-5 h-5" />,
  recent_products: <Clock className="w-5 h-5" />,
  featured_brands: <Star className="w-5 h-5" />,
  category_grid: <Sparkles className="w-5 h-5" />,
  featured_products: <Sparkles className="w-5 h-5" />,
  banner: null,
};

const BADGE_STYLES: Record<
  string,
  { icon: string; colorKey: keyof ThemeColors }
> = {
  "Best Seller": { icon: "🔥", colorKey: "sale_badge" },
  Recent: { icon: "🆕", colorKey: "new_badge" },
  Sale: { icon: "🏷️", colorKey: "sale_badge" },
  New: { icon: "✨", colorKey: "new_badge" },
  Discount: { icon: "💥", colorKey: "discount_badge" },
};

const BANNER_SIZE_CLASS: Record<string, string> = {
  full: "col-span-12",
  half: "col-span-12 md:col-span-6",
  third: "col-span-12 md:col-span-4",
  quarter: "col-span-12 md:col-span-6 lg:col-span-3",
};

const TEXT_POSITION_CLASS: Record<string, string> = {
  left: "items-start text-left",
  center: "items-center text-center",
  right: "items-end text-right",
};

// ─── Layout helpers ───────────────────────────────────────────────────────────

function getColumnClass(cols = 4): string {
  const map: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-5",
    6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
  };
  return map[cols] || "grid-cols-2 md:grid-cols-4";
}

function getCarouselItemClass(cols = 4): string {
  const map: Record<number, string> = {
    1: "basis-full",
    2: "basis-1/2",
    3: "basis-1/2 sm:basis-1/3",
    4: "basis-1/2 sm:basis-1/3 md:basis-1/4",
    5: "basis-1/2 sm:basis-1/3 md:basis-1/5",
    6: "basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6",
  };
  return map[cols] || "basis-1/2 sm:basis-1/3 md:basis-1/4";
}

// ─── Pure sub-components ──────────────────────────────────────────────────────

const CategoryCard = memo(
  ({
    category,
    primaryColor,
  }: {
    category: Category;
    primaryColor: string;
  }) => (
    <Link
      href={`/category/${category.id}/${category.slug}`}
      className="group block h-full"
    >
      <div className="relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden h-full">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
              <span className="text-5xl opacity-30">📦</span>
            </div>
          )}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
            style={{ backgroundColor: primaryColor }}
          />
        </div>
        <div className="p-4 text-center">
          <h3 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
            {category.name}
          </h3>
          <p className="text-xs mt-1 text-gray-400">
            {category?.children?.length || 0} items
          </p>
        </div>
      </div>
    </Link>
  ),
);
CategoryCard.displayName = "CategoryCard";

const BrandCard = memo(
  ({ brand, primaryColor }: { brand: Brand; primaryColor: string }) => (
    <Link href={brand.link || "/brands"} className="group block h-full">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 p-6 text-center border border-gray-100 h-full flex flex-col justify-center">
        <div className="relative h-24 w-24 mx-auto mb-4 shrink-0">
          <Image
            src={brand.logo}
            alt={brand.name}
            fill
            className="object-contain group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <h3
          className="font-medium transition-colors group-hover:text-primary"
          style={{ color: primaryColor }}
        >
          {brand.name}
        </h3>
        <p className="text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          Shop Collection →
        </p>
      </div>
    </Link>
  ),
);
BrandCard.displayName = "BrandCard";

// Shared autoplay factory
function makeAutoplay(delay: number) {
  return Autoplay({ delay, stopOnInteraction: false, stopOnMouseEnter: true });
}

const ProductSlider = memo(
  ({
    products,
    badge,
    badgeIcon,
    badgeColor,
    columns = 4,
  }: {
    products: Product[];
    badge?: string;
    badgeIcon?: string;
    badgeColor?: string;
    columns?: number;
  }) => {
    const plugin = useMemo(() => makeAutoplay(3000), []);
    if (!products.length) return null;
    return (
      <div className="relative w-full py-2">
        <Carousel
          opts={{ align: "start", loop: true, dragFree: true }}
          plugins={[plugin]}
          className="relative"
        >
          <div className="hidden md:flex absolute top-1/2 left-0 -translate-y-1/2 z-10">
            <CarouselPrevious />
          </div>
          <div className="hidden md:flex absolute top-1/2 right-0 -translate-y-1/2 z-10">
            <CarouselNext />
          </div>
          <CarouselContent className="flex flex-nowrap pb-2">
            {products.map((p) => (
              <CarouselItem
                key={p.id}
                className={getCarouselItemClass(columns)}
              >
                <div className="h-full">
                  <ProductCard
                    {...p}
                    badge={badge}
                    badgeIcon={badgeIcon}
                    badgeColor={badgeColor}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    );
  },
);
ProductSlider.displayName = "ProductSlider";

const BrandSlider = memo(
  ({
    brands,
    primaryColor,
    columns = 4,
  }: {
    brands: Brand[];
    primaryColor: string;
    columns?: number;
  }) => {
    const plugin = useMemo(() => makeAutoplay(4000), []);
    if (!brands.length) return null;
    return (
      <div className="relative w-full py-2">
        <Carousel
          opts={{ align: "start", loop: true, dragFree: true }}
          plugins={[plugin]}
          className="relative"
        >
          <div className="hidden md:flex absolute top-1/2 left-0 -translate-y-1/2 z-10">
            <CarouselPrevious />
          </div>
          <div className="hidden md:flex absolute top-1/2 right-0 -translate-y-1/2 z-10">
            <CarouselNext />
          </div>
          <CarouselContent className="flex flex-nowrap pb-2">
            {brands.map((b, i) => (
              <CarouselItem key={i} className={getCarouselItemClass(columns)}>
                <div className="h-full">
                  <BrandCard brand={b} primaryColor={primaryColor} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    );
  },
);
BrandSlider.displayName = "BrandSlider";

const CategorySlider = memo(
  ({
    categories,
    primaryColor,
    columns = 4,
  }: {
    categories: Category[];
    primaryColor: string;
    columns?: number;
  }) => {
    const plugin = useMemo(() => makeAutoplay(4000), []);
    if (!categories.length) return null;
    return (
      <div className="relative w-full py-2">
        <Carousel
          opts={{ align: "start", loop: true, dragFree: true }}
          plugins={[plugin]}
          className="relative"
        >
          <div className="hidden md:flex absolute top-1/2 left-0 -translate-y-1/2 z-10">
            <CarouselPrevious />
          </div>
          <div className="hidden md:flex absolute top-1/2 right-0 -translate-y-1/2 z-10">
            <CarouselNext />
          </div>
          <CarouselContent className="flex flex-nowrap pb-2">
            {categories.map((cat) => (
              <CarouselItem
                key={cat.id}
                className={getCarouselItemClass(columns)}
              >
                <div className="h-full">
                  <CategoryCard category={cat} primaryColor={primaryColor} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    );
  },
);
CategorySlider.displayName = "CategorySlider";

// ─── Skeleton + Empty ─────────────────────────────────────────────────────────

const LoadingSkeleton = memo(
  ({ count = 4, type = "product" }: { count?: number; type?: string }) => (
    <div className={`grid ${getColumnClass(count)} gap-2 md:gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          {type === "category" ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-100 aspect-square w-full" />
              <div className="p-4">
                <div className="h-4 bg-gray-100 rounded w-3/4 mx-auto" />
              </div>
            </div>
          ) : type === "brand" ? (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full" />
              <div className="h-4 bg-gray-100 rounded w-20 mx-auto mt-4" />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-100 aspect-square w-full" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-8 bg-gray-100 rounded w-full mt-4" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  ),
);
LoadingSkeleton.displayName = "LoadingSkeleton";

const EmptyState = memo(
  ({ message, icon }: { message: string; icon?: string }) => (
    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
      <span className="text-4xl mb-3 block opacity-50">{icon || "📦"}</span>
      <p className="text-gray-500">{message}</p>
    </div>
  ),
);
EmptyState.displayName = "EmptyState";

// ─── Main Component ───────────────────────────────────────────────────────────

// ─── FeaturedSection — own React Query hook per section ──────────────────────
// Pulled out so the hook is called unconditionally at component level

function FeaturedSection({
  section,
  colors,
}: {
  section: Section;
  colors: Record<string, string>;
}) {
  const limit = section.products_count || 8;
  const { products, loading } = useFeaturedProducts(
    section.categoryids ?? [],
    limit,
  );
  const cols = section.columns || 4;
  const display = products.slice(0, limit);

  if (loading && !display.length)
    return <LoadingSkeleton count={cols} type="product" />;
  if (!display.length)
    return <EmptyState message="No products available" icon="🛍️" />;

  if (section.layout === "slider") {
    return <ProductSlider products={display} columns={cols} />;
  }
  return (
    <div className={`grid ${getColumnClass(cols)} gap-2 md:gap-4`}>
      {display.map((p) => (
        <ProductCard key={p.id} {...p} />
      ))}
    </div>
  );
}

function DynamicSectionRenderer({ sections }: { sections: Section[] }) {
  const { categories, loading: categoriesLoading } = useCategoryStore();

  const themeColors = (useThemeData("colors") || {}) as Partial<ThemeColors>;
  const colors = useMemo(
    () => ({
      primary: themeColors.primary || "#222524",
      secondary: themeColors.secondary || "#DA291C",
      accent: themeColors.accent || "#F68B1E",
      background: themeColors.background || "#ffffff",
      text: themeColors.text || "#222524",
      heading: themeColors.heading || "#111827",
      link: themeColors.link || "#006747",
      sale_badge: themeColors.sale_badge || "#DA291C",
      new_badge: themeColors.new_badge || "#006747",
      discount_badge: themeColors.discount_badge || "#F68B1E",
    }),
    [themeColors],
  );

  // Only process sections that are active
  const activeSections = useMemo(() => {
    if (!sections) return [];
    // sections may arrive as an object (keyed by index) instead of an array
    const arr = Array.isArray(sections)
      ? sections
      : Object.values(sections as Record<string, Section>);
    return arr.filter((s) => s?.status);
  }, [sections]);

  // React Query hooks — each fetches independently, results cached in memory
  const recentSection = activeSections.find(
    (s) => s.type === "recent_products",
  );
  const bestSellerSection = activeSections.find(
    (s) => s.type === "best_sellers",
  );

  const { recentProducts, recentLoading } = useRecentProducts(
    recentSection?.products_count || 20,
    recentSection?.days || 30,
  );
  const { bestSellingProducts, bestSellingLoading } = useBestSellingProducts(
    bestSellerSection?.products_count || 20,
  );

  // ── Derived: categories per section ────────────────────────────────────────
  // Computed from already-cached store data — no extra state needed
  const sectionCategories = useMemo(() => {
    const map: Record<string, Category[]> = {};
    activeSections.forEach((s) => {
      if (s.type === "category_grid" && s.categoryids?.length) {
        map[s.id] = (categories as Category[]).filter((c) =>
          s.categoryids!.includes(c.id),
        );
      }
    });
    return map;
  }, [categories, activeSections]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Section renderers
  // ─────────────────────────────────────────────────────────────────────────────

  const renderCategoryGrid = useCallback(
    (section: Section) => {
      const cats = sectionCategories[section.id] || [];
      const cols = section.grid_columns || section.columns || 4;

      if (categoriesLoading)
        return <LoadingSkeleton count={cols} type="category" />;
      if (!cats.length)
        return <EmptyState message="No categories available" icon="📦" />;

      if (section.layout === "slider") {
        return (
          <CategorySlider
            categories={cats}
            primaryColor={colors.primary}
            columns={cols}
          />
        );
      }
      return (
        <div className={`grid ${getColumnClass(cols)} gap-2 md:gap-4`}>
          {cats.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              primaryColor={colors.primary}
            />
          ))}
        </div>
      );
    },
    [sectionCategories, categoriesLoading, colors.primary],
  );

  const renderProductSection = useCallback(
    (section: Section, badge?: string, badgeIcon?: string) => {
      const cols = section.columns || 4;
      const limit = section.products_count || 8;

      let products: Product[] = [];
      let isLoading = false;

      if (section.type === "recent_products") {
        products = recentProducts;
        isLoading = recentLoading;
      } else if (section.type === "best_sellers") {
        products = bestSellingProducts;
        isLoading = bestSellingLoading;
      } else if (
        section.type === "featured_products" &&
        section.categoryids?.length
      ) {
        // useFeaturedProducts is called per-section via FeaturedSection wrapper below
        // This branch is handled by renderFeaturedSection — should not reach here
      }

      const display = products.slice(0, limit);

      if (isLoading && !display.length)
        return <LoadingSkeleton count={cols} type="product" />;
      if (!display.length)
        return (
          <EmptyState
            message={`No ${badge?.toLowerCase() || "products"} available`}
            icon="🛍️"
          />
        );

      const badgeColor = (() => {
        if (!badge) return undefined;
        const style = BADGE_STYLES[badge];
        return style
          ? colors[style.colorKey as keyof typeof colors] || colors.primary
          : colors.primary;
      })();

      const resolvedBadgeIcon = badgeIcon || BADGE_STYLES[badge || ""]?.icon;

      if (section.layout === "slider") {
        return (
          <ProductSlider
            products={display}
            badge={badge}
            badgeIcon={resolvedBadgeIcon}
            badgeColor={badgeColor}
            columns={cols}
          />
        );
      }

      return (
        <div className={`grid ${getColumnClass(cols)} gap-2 md:gap-4`}>
          {display.map((p) => (
            <ProductCard
              key={p.id}
              {...p}
              badge={badge}
              badgeIcon={resolvedBadgeIcon}
              badgeColor={badgeColor}
            />
          ))}
        </div>
      );
    },
    [
      recentProducts,
      recentLoading,
      bestSellingProducts,
      bestSellingLoading,
      colors,
    ],
  );

  const renderBrands = useCallback(
    (section: Section) => {
      const brands = section.brands || [];
      const cols = section.columns || 4;
      if (!brands.length)
        return <EmptyState message="No brands available" icon="🏢" />;
      if (section.layout === "slider") {
        return (
          <BrandSlider
            brands={brands}
            primaryColor={colors.primary}
            columns={cols}
          />
        );
      }
      return (
        <div className={`grid ${getColumnClass(cols)} gap-2 md:gap-4`}>
          {brands.map((b, i) => (
            <BrandCard key={i} brand={b} primaryColor={colors.primary} />
          ))}
        </div>
      );
    },
    [colors.primary],
  );

  const renderBanner = useCallback((section: Section) => {
    const banners = section.banners || [];

    if (!banners.length && section.banner_image) {
      return (
        <div className="relative rounded-xl overflow-hidden shadow-2xl h-75 md:h-100 group">
          <Image
            src={section.banner_image}
            alt={section.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/60 to-black/30 flex flex-col items-center justify-center text-white p-6">
            <h3 className="text-3xl md:text-4xl font-bold mb-2 text-center">
              {section.title}
            </h3>
            <Link
              href="/shop"
              className="mt-4 px-8 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-all hover:scale-105"
            >
              Shop Now
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-12 gap-2 md:gap-4">
        {banners.map((banner, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className={`${BANNER_SIZE_CLASS[banner.size] || "col-span-12"} relative rounded-xl overflow-hidden shadow-lg h-[250px] md:h-[300px] group`}
          >
            <Image
              src={banner.image}
              alt={banner.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-1000"
            />
            <div
              className="absolute inset-0 flex flex-col justify-center p-6 md:p-8"
              style={{
                backgroundColor: `rgba(0,0,0,${banner.overlay_opacity / 100})`,
              }}
            >
              <div
                className={`flex flex-col ${TEXT_POSITION_CLASS[banner.text_position] || "items-center text-center"}`}
              >
                <h3
                  className="text-xl md:text-2xl font-bold mb-2 drop-shadow-lg"
                  style={{ color: banner.text_color }}
                >
                  {banner.title}
                </h3>
                {banner.subtitle && (
                  <p
                    className="text-sm mb-4 drop-shadow-md"
                    style={{ color: banner.text_color }}
                  >
                    {banner.subtitle}
                  </p>
                )}
                <Link
                  href={banner.link || "/shop"}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold hover:opacity-90 transition-all hover:scale-105 text-sm"
                  style={{
                    backgroundColor: banner.button_color,
                    color: banner.text_color,
                  }}
                >
                  {banner.button_text}
                  <span className="text-lg">→</span>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────

  if (!activeSections.length) return null;

  return (
    <>
      {activeSections.map((section) => {
        const showViewAll =
          ["category_grid", "featured_products"].includes(section.type) &&
          !!section.categoryids?.length;

        const sectionStyle = {
          backgroundColor: section.bg_color || colors.background,
          color: section.text_color || colors.text,
        };

        return (
          <div
            key={section.id}
            style={sectionStyle}
            className={[
              section.padding || "px-3 py-4 md:px-6 md:py-6",
              section.margin || "mb-4 md:mb-8",
              !section.bg_color ? "" : section.border_radius || "rounded-lg",
              "transition-all duration-300",
            ].join(" ")}
          >
            {/* Section header */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl" style={{ color: colors.primary }}>
                  {TYPE_ICONS[section.type]}
                </span>
                <div>
                  <h2
                    className="text-xl md:text-2xl font-bold tracking-tight"
                    style={{ color: colors.heading }}
                  >
                    {section.title}
                  </h2>
                  {section.title_bn && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      {section.title_bn}
                    </p>
                  )}
                </div>
              </div>

              {showViewAll && (
                <Link
                  href={`/categories?ids=${section.categoryids!.join(",")}`}
                  className="group flex items-center gap-1 text-sm font-medium transition-colors hover:gap-2"
                  style={{ color: colors.primary }}
                >
                  View All
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
            </div>

            {/* Section body */}
            {section.type === "category_grid" && renderCategoryGrid(section)}
            {section.type === "featured_products" && (
              <FeaturedSection section={section} colors={colors} />
            )}
            {section.type === "recent_products" &&
              renderProductSection(section, "Recent", "🆕")}
            {section.type === "best_sellers" &&
              renderProductSection(section, "Best Seller", "🔥")}
            {section.type === "banner" && renderBanner(section)}
            {section.type === "featured_brands" && renderBrands(section)}
          </div>
        );
      })}
    </>
  );
}

export default memo(DynamicSectionRenderer);
