"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Filter, X, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import api from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { useSettings } from "@/app/store/useSettings";
import { useThemeData } from "@/app/store/useThemeData";
import { useCategoryStore } from "@/app/store/useCatrgoryStore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: number;
  code: string;
  name: string;
  slug: string;
  description: string;
  cost_price: string | number;
  selling_price: string | number;
  regular_price: string | number;
  status: string;
  uom_name: string;
  images: Array<{
    id: number;
    url: string;
    alt_text: string;
    is_primary: boolean;
    variant_id: number;
  }>;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
    code: string;
    image: string | null;
    is_primary: boolean;
  }>;
  total_stock: string | number;
  badge: string | null;
  rating: number | null;
  review_count: number | null;
  total_sales: string | number;
  primary_variant_id: number;
  discount_percentage?: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    data: Product[];
    pagination: {
      currentPage: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

interface PriceRangeConfig {
  min: number;
  max: number;
  label: string;
}

interface SortOption {
  value: string;
  label: string;
}

interface ProductSectionConfig {
  status: boolean;
  filter_options: string[];
  price_ranges: PriceRangeConfig[];
  show_pagination: boolean;
  sort_options: SortOption[];
}

// ─── Default fallbacks ────────────────────────────────────────────────────────

const DEFAULT_SORT_OPTIONS: SortOption[] = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Top Rated" },
];

const AVAILABILITY_OPTIONS = [
  { value: "all", label: "All Products" },
  { value: "in-stock", label: "In Stock Only" },
  { value: "out-of-stock", label: "Out of Stock" },
];

// ─── Category types & helpers ─────────────────────────────────────────────────

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
  children?: Category[];
}

/** Flatten nested category tree into a single ordered list (parents first, then children indented). */
function flattenCategories(cats: Category[], depth = 0): Array<Category & { depth: number }> {
  const result: Array<Category & { depth: number }> = [];
  for (const cat of cats) {
    result.push({ ...cat, depth });
    if (cat.children?.length) {
      result.push(...flattenCategories(cat.children, depth + 1));
    }
  }
  return result;
}

/** Find which top-level category (or itself) owns the given id. */
function findParentId(cats: Category[], targetId: number): number | null {
  for (const cat of cats) {
    if (cat.id === targetId) return null; // it IS a top-level
    if (cat.children?.some((c) => c.id === targetId)) return cat.id;
    for (const child of cat.children ?? []) {
      const found = findParentId([child], targetId);
      if (found !== null) return found;
    }
  }
  return null;
}

// ─── Category Strip ───────────────────────────────────────────────────────────

interface CategoryStripProps {
  currentId: string | string[] | undefined;
  categories: Category[];
  loading: boolean;
}

function CategoryStrip({ currentId, categories, loading }: CategoryStripProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const currentIdNum = currentId ? parseInt(String(currentId)) : -1;

  // Flatten the tree for display
  const flatCats = flattenCategories(categories);

  // Find the parent id of current category (null if it is top-level)
  const parentId = findParentId(categories, currentIdNum);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [flatCats.length, checkScroll]);

  // Auto-scroll active pill into view
  useEffect(() => {
    if (!scrollRef.current || !flatCats.length) return;
    const activeEl = scrollRef.current.querySelector("[data-active='true']") as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ inline: "center", behavior: "smooth", block: "nearest" });
    }
  }, [currentIdNum, flatCats.length]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex gap-3 overflow-hidden mb-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="shrink-0 h-10 w-28 rounded-full bg-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!flatCats.length) return null;

  return (
    <div className="relative mb-6 -mx-1">
      {/* Left fade + arrow */}
      <AnimatePresence>
        {canScrollLeft && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute left-0 top-0 bottom-0 z-10 flex items-center"
          >
            <div className="w-12 h-full bg-linear-to-r from-gray-50 to-transparent pointer-events-none absolute" />
            <button
              onClick={() => scroll("left")}
              className="relative z-10 ml-1 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrollable strip */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto px-1 py-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {flatCats.map((cat) => {
          const isActive = cat.id === currentIdNum;
          // Highlight parent of active child too (dimmer)
          const isParentOfActive = cat.id === parentId;
          const isChild = cat.depth > 0;

          return (
            <button
              key={cat.id}
              data-active={isActive}
              onClick={() => router.push(`/category/${cat.id}/${cat.slug}`)}
              className={`shrink-0 flex items-center gap-1.5 border text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                isChild ? "px-3 py-1.5 rounded-full text-xs" : "px-3.5 py-2 rounded-full"
              } ${
                isActive
                  ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.03]"
                  : isParentOfActive
                  ? "bg-primary/10 text-primary border-primary/30"
                  : isChild
                  ? "bg-white text-gray-500 border-gray-200 hover:border-primary/50 hover:text-primary hover:bg-primary/4"
                  : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary hover:bg-primary/4"
              }`}
            >
              {/* Indent indicator for children */}
              {isChild && (
                <span className={`w-1 h-1 rounded-full shrink-0 ${isActive ? "bg-white" : "bg-gray-300"}`} />
              )}
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Right fade + arrow */}
      <AnimatePresence>
        {canScrollRight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-0 top-0 bottom-0 z-10 flex items-center justify-end"
          >
            <div className="w-12 h-full bg-linear-to-l from-gray-50 to-transparent pointer-events-none absolute" />
            <button
              onClick={() => scroll("right")}
              className="relative z-10 mr-1 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CategoryPage() {
  const { id, slug } = useParams();
  const router = useRouter();
  const { productCardStyle } = useSettings();

  // Categories from store
  const {
    categories,
    fetchCategories,
    loading: categoriesLoading,
  } = useCategoryStore();

  // Pull product_section config from theme
  const rawSection = (useThemeData("product_section") ||
    {}) as Partial<ProductSectionConfig>;

  const sectionConfig: ProductSectionConfig = {
    status: rawSection.status ?? true,
    filter_options: rawSection.filter_options ?? ["price_range"],
    price_ranges: rawSection.price_ranges ?? [
      { min: 0, max: 50000, label: "Price Range" },
    ],
    show_pagination: rawSection.show_pagination ?? true,
    sort_options: rawSection.sort_options ?? [],
  };

  const activeSortOptions: SortOption[] =
    sectionConfig.sort_options.length > 0
      ? sectionConfig.sort_options
      : DEFAULT_SORT_OPTIONS;

  const showPriceFilter = sectionConfig.filter_options.includes("price_range");
  const showAvailability = sectionConfig.filter_options.includes("category");
  const showRatingFilter = sectionConfig.filter_options.includes("rating");

  const PRICE_MIN = sectionConfig.price_ranges[0]?.min ?? 0;
  const PRICE_MAX = sectionConfig.price_ranges[0]?.max ?? 50000;

  // ── State ──────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [priceInputs, setPriceInputs] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [sortBy, setSortBy] = useState(activeSortOptions[0]?.value ?? "newest");
  const [availability, setAvailability] = useState<string>("all");
  const [minRating, setMinRating] = useState<number>(0);

  const activeFilterCount =
    (showPriceFilter && (priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX) ? 1 : 0) +
    (showAvailability && availability !== "all" ? 1 : 0) +
    (showRatingFilter && minRating > 0 ? 1 : 0);

  const { ref, inView } = useInView({ threshold: 0, rootMargin: "100px" });

  // ── Fetch categories on mount ──────────────────────────────────────────────
  useEffect(() => {
    if (!categories.length) fetchCategories();
  }, []);

  // ── Infinite scroll ────────────────────────────────────────────────────────
  useEffect(() => {
    if (inView && hasMore && !loading) {
      fetchProducts(page + 1, false);
    }
  }, [inView]);

  // ── Fetch products ─────────────────────────────────────────────────────────
  const fetchProducts = useCallback(
    async (pageNum: number = 1, reset: boolean = false) => {
      if (loading && !reset) return;
      if (!id) return;

      setLoading(true);
      if (reset) setInitialLoading(true);
      setError(null);

      try {
        const requestBody: Record<string, unknown> = {
          page: pageNum,
          limit: 20,
          status: "A",
          category_id: parseInt(String(id)),
        };

        if (showPriceFilter) {
          if (priceRange[0] > PRICE_MIN) requestBody.price_min = priceRange[0];
          if (priceRange[1] < PRICE_MAX) requestBody.price_max = priceRange[1];
        }
        if (showRatingFilter && minRating > 0) requestBody.min_rating = minRating;
        requestBody.sort = sortBy;

        const response = await api.post<ApiResponse>(`/product/get-all-products`, requestBody);

        if (response.data.success) {
          const fetched = response.data.data.data || [];
          const pagination = response.data.data.pagination;

          let filtered = fetched;
          if (showAvailability) {
            if (availability === "in-stock") {
              filtered = fetched.filter((p) => parseFloat(String(p.total_stock)) > 0);
            } else if (availability === "out-of-stock") {
              filtered = fetched.filter((p) => parseFloat(String(p.total_stock)) <= 0);
            }
          }

          if (reset) {
            setProducts(filtered);
          } else {
            setProducts((prev) => {
              const existingIds = new Set(prev.map((p) => p.id));
              return [...prev, ...filtered.filter((p) => !existingIds.has(p.id))];
            });
          }

          setHasMore(pagination.currentPage < pagination.totalPages);
          setPage(pagination.currentPage);
          setTotalProducts(pagination.total);
        } else {
          setError("Failed to fetch products");
        }
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ??
          (err as { message?: string })?.message ??
          "Failed to load products";
        setError(msg);
        if (reset) {
          setProducts([]);
          setTotalProducts(0);
        }
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [loading, id, priceRange, sortBy, availability, minRating, showPriceFilter, showRatingFilter, showAvailability],
  );

  useEffect(() => {
    if (id) {
      setProducts([]);
      setPage(1);
      setHasMore(true);
      setPriceRange([PRICE_MIN, PRICE_MAX]);
      setPriceInputs([PRICE_MIN, PRICE_MAX]);
      setSortBy(activeSortOptions[0]?.value ?? "newest");
      setAvailability("all");
      setMinRating(0);
      fetchProducts(1, true);
    }
  }, [id]);

  // ── Filter actions ─────────────────────────────────────────────────────────

  const applyFilters = () => {
    if (priceInputs[0] > priceInputs[1]) {
      setError("Minimum price cannot be greater than maximum price");
      return;
    }
    setPriceRange(priceInputs);
    setShowFilters(false);
    setProducts([]);
    setPage(1);
    setHasMore(true);
    fetchProducts(1, true);
  };

  const resetFilters = () => {
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setPriceInputs([PRICE_MIN, PRICE_MAX]);
    setSortBy(activeSortOptions[0]?.value ?? "newest");
    setAvailability("all");
    setMinRating(0);
    setProducts([]);
    setPage(1);
    setHasMore(true);
    fetchProducts(1, true);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setShowSort(false);
    setProducts([]);
    setPage(1);
    setHasMore(true);
    fetchProducts(1, true);
  };

  const handleAvailabilityChange = (value: string) => {
    setAvailability(value);
    setProducts([]);
    setPage(1);
    setHasMore(true);
    fetchProducts(1, true);
  };

  const handleRatingChange = (value: number) => {
    setMinRating(value);
    setProducts([]);
    setPage(1);
    setHasMore(true);
    fetchProducts(1, true);
  };

  // ── Formatters ─────────────────────────────────────────────────────────────

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

  const formatCategoryName = (s: string) =>
    String(s).split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const categoryName = formatCategoryName(String(slug));

  // ── Skeleton ───────────────────────────────────────────────────────────────
  const renderSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 animate-pulse">
          <div className="bg-gray-200 h-52 rounded-lg mb-4" />
          <div className="h-4 bg-gray-200 rounded mb-2" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="h-6 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  );

  // ── Filter panel ───────────────────────────────────────────────────────────
  const renderFilterPanel = (mobile = false) => (
    <div className={mobile ? "p-4" : ""}>
      {showAvailability && (
        <div className="mb-7">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
            Availability
          </h4>
          <div className="space-y-2">
            {AVAILABILITY_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name={`availability-${mobile ? "mobile" : "desktop"}`}
                  checked={availability === opt.value}
                  onChange={() => handleAvailabilityChange(opt.value)}
                  className="w-4 h-4 text-primary border-gray-300 focus:ring-primary cursor-pointer"
                  disabled={loading}
                />
                <span className="text-sm text-gray-700 group-hover:text-primary transition-colors">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {showPriceFilter && (
        <div className="mb-7">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
              {sectionConfig.price_ranges[0]?.label ?? "Price Range"}
            </h4>
            <span className="text-xs text-primary font-semibold bg-primary/8 px-2 py-0.5 rounded">
              ৳{formatPrice(priceInputs[0])} – ৳{formatPrice(priceInputs[1])}
            </span>
          </div>

          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Min</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">৳</span>
                <input
                  type="number"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step="100"
                  value={priceInputs[0]}
                  onChange={(e) => {
                    const v = Math.max(PRICE_MIN, Math.min(parseInt(e.target.value) || PRICE_MIN, PRICE_MAX));
                    setPriceInputs([v, priceInputs[1]]);
                  }}
                  onBlur={applyFilters}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                  className="w-full border border-gray-300 rounded-lg pl-7 pr-2 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Max</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">৳</span>
                <input
                  type="number"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step="100"
                  value={priceInputs[1]}
                  onChange={(e) => {
                    const v = Math.min(PRICE_MAX, Math.max(parseInt(e.target.value) || PRICE_MAX, PRICE_MIN));
                    setPriceInputs([priceInputs[0], v]);
                  }}
                  onBlur={applyFilters}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                  className="w-full border border-gray-300 rounded-lg pl-7 pr-2 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <button
            onClick={applyFilters}
            className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Applying…
              </span>
            ) : (
              "Apply Price Filter"
            )}
          </button>
        </div>
      )}

      {showRatingFilter && (
        <div className="mb-7">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Min Rating</h4>
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((r) => (
              <label key={r} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name={`rating-${mobile ? "mobile" : "desktop"}`}
                  checked={minRating === r}
                  onChange={() => handleRatingChange(r)}
                  className="w-4 h-4 text-primary border-gray-300 focus:ring-primary cursor-pointer"
                  disabled={loading}
                />
                <span className="text-sm text-gray-700 group-hover:text-primary transition-colors flex items-center gap-1">
                  {r === 0 ? (
                    "All Ratings"
                  ) : (
                    <>
                      {"★".repeat(r)}{"☆".repeat(5 - r)}
                      <span className="text-gray-500 ml-1">& up</span>
                    </>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {activeFilterCount > 0 && (
        <button
          onClick={resetFilters}
          className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!sectionConfig.status) return null;

  const hasAnyFilter = showPriceFilter || showAvailability || showRatingFilter;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
          <span
            className="hover:text-primary cursor-pointer transition-colors"
            onClick={() => router.push("/")}
          >
            Home
          </span>
          <span className="text-gray-300">/</span>
          <span>Categories</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium capitalize">{categoryName}</span>
        </nav>

        {/* Page header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 capitalize">
              {categoryName}
            </h1>
            {!initialLoading && products.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Showing {products.length} of {totalProducts} products
                {hasMore && " · Scroll for more"}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {hasAnyFilter && (
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg md:hidden hover:bg-white transition-colors text-sm font-medium relative"
                disabled={loading}
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSort((p) => !p)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:border-primary transition-colors text-sm font-medium"
                disabled={loading}
              >
                <span className="hidden sm:inline text-gray-500">Sort:</span>
                <span>{activeSortOptions.find((s) => s.value === sortBy)?.label ?? "Sort"}</span>
                <ChevronDown
                  className="w-4 h-4 text-gray-400 transition-transform"
                  style={{ transform: showSort ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </button>

              <AnimatePresence>
                {showSort && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSort(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      {activeSortOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleSortChange(opt.value)}
                          className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                            sortBy === opt.value
                              ? "bg-primary/5 text-primary font-semibold border-l-2 border-primary"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                          disabled={loading}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Category Strip ── */}
        <CategoryStrip
          currentId={id}
          categories={categories}
          loading={categoriesLoading}
        />

        {/* Error banner */}
        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm">{error}</p>
            <button className="ml-auto text-red-400 hover:text-red-600" onClick={() => setError(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar desktop */}
          {hasAnyFilter && (
            <aside className="hidden md:block w-72 shrink-0">
              <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-24">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                  </h3>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={resetFilters}
                      className="text-xs text-primary hover:underline font-medium"
                      disabled={loading}
                    >
                      Clear all ({activeFilterCount})
                    </button>
                  )}
                </div>
                {renderFilterPanel(false)}
              </div>
            </aside>
          )}

          {/* Mobile drawer */}
          <AnimatePresence>
            {showFilters && hasAnyFilter && (
              <>
                <motion.div
                  className="fixed inset-0 bg-black/50 z-40 md:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowFilters(false)}
                />
                <motion.aside
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "tween", duration: 0.25 }}
                  className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white z-50 overflow-y-auto shadow-2xl md:hidden"
                >
                  <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filters
                    </h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {renderFilterPanel(true)}
                  <div className="p-4 border-t sticky bottom-0 bg-white flex gap-3">
                    <button
                      onClick={() => { resetFilters(); setShowFilters(false); }}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                      disabled={loading}
                    >
                      Reset
                    </button>
                    <button
                      onClick={applyFilters}
                      className="flex-1 bg-primary text-white py-3 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                        </span>
                      ) : "Apply"}
                    </button>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Products main */}
          <main className="flex-1 min-w-0">
            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="hidden md:flex flex-wrap items-center gap-2 mb-4 text-sm">
                <span className="text-gray-500">Active filters:</span>
                {showPriceFilter && (priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX) && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                    ৳{formatPrice(priceRange[0])} – ৳{formatPrice(priceRange[1])}
                    <button
                      onClick={() => {
                        setPriceRange([PRICE_MIN, PRICE_MAX]);
                        setPriceInputs([PRICE_MIN, PRICE_MAX]);
                        fetchProducts(1, true);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {showAvailability && availability !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                    {AVAILABILITY_OPTIONS.find((a) => a.value === availability)?.label}
                    <button onClick={() => handleAvailabilityChange("all")}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {showRatingFilter && minRating > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                    {"★".repeat(minRating)} & up
                    <button onClick={() => handleRatingChange(0)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={resetFilters}
                  className="text-gray-400 hover:text-primary transition-colors text-xs underline ml-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {initialLoading ? (
              renderSkeleton()
            ) : error && products.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <svg className="w-14 h-14 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
                <p className="text-gray-500 text-sm mb-5 max-w-sm mx-auto">{error}</p>
                <button
                  onClick={() => fetchProducts(1, true)}
                  className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <svg className="w-14 h-14 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 text-sm mb-5 max-w-sm mx-auto">
                  No products match your current filters. Try adjusting or clearing them.
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                  {products.map((p) => (
                    <ProductCard key={p.id} {...p} cardStyle={productCardStyle} />
                  ))}
                </div>

                {hasMore && (
                  <div ref={ref} className="py-10 flex flex-col items-center gap-3 text-gray-500">
                    {loading && (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-sm">Loading more…</span>
                      </>
                    )}
                  </div>
                )}

                {!hasMore && products.length > 0 && (
                  <div className="text-center py-10 border-t mt-8">
                    <p className="text-gray-700 font-semibold mb-1">You've seen it all! 🎉</p>
                    <p className="text-sm text-gray-400">
                      All {totalProducts} {categoryName} products loaded
                    </p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}