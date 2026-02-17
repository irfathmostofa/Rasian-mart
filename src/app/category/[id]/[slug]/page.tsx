"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Filter, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import api from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { useSettings } from "@/app/store/useSettings";
import { useThemeData } from "@/app/store/useThemeData";

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
  filter_options: string[]; // e.g. ["category","price_range","brand","rating"]
  price_ranges: PriceRangeConfig[];
  show_pagination: boolean;
  sort_options: SortOption[]; // empty array → use defaults
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function CategoryPage() {
  const { id, slug } = useParams();
  const router = useRouter();
  const { productCardStyle } = useSettings();

  // Pull product_section config from theme
  const rawSection = (useThemeData("product_section") ||
    {}) as Partial<ProductSectionConfig>;

  // Resolve config with safe defaults
  const sectionConfig: ProductSectionConfig = {
    status: rawSection.status ?? true,
    filter_options: rawSection.filter_options ?? ["price_range"],
    price_ranges: rawSection.price_ranges ?? [
      { min: 0, max: 50000, label: "Price Range" },
    ],
    show_pagination: rawSection.show_pagination ?? true,
    sort_options: rawSection.sort_options ?? [],
  };

  // Use backend sort options if provided, otherwise fall back to defaults
  const activeSortOptions: SortOption[] =
    sectionConfig.sort_options.length > 0
      ? sectionConfig.sort_options
      : DEFAULT_SORT_OPTIONS;

  // Which filters to show (driven by filter_options array)
  const showPriceFilter = sectionConfig.filter_options.includes("price_range");
  const showAvailability = sectionConfig.filter_options.includes("category"); // maps to availability
  const showRatingFilter = sectionConfig.filter_options.includes("rating");

  // Price bounds from config
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

  // Filters
  const [priceRange, setPriceRange] = useState<[number, number]>([
    PRICE_MIN,
    PRICE_MAX,
  ]);
  const [priceInputs, setPriceInputs] = useState<[number, number]>([
    PRICE_MIN,
    PRICE_MAX,
  ]);
  const [sortBy, setSortBy] = useState(activeSortOptions[0]?.value ?? "newest");
  const [availability, setAvailability] = useState<string>("all");
  const [minRating, setMinRating] = useState<number>(0);

  // Count active filters for badge
  const activeFilterCount =
    (showPriceFilter && (priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX)
      ? 1
      : 0) +
    (showAvailability && availability !== "all" ? 1 : 0) +
    (showRatingFilter && minRating > 0 ? 1 : 0);

  const { ref, inView } = useInView({ threshold: 0, rootMargin: "100px" });

  // ── Infinite scroll ────────────────────────────────────────────────────────
  useEffect(() => {
    if (inView && hasMore && !loading) {
      fetchProducts(page + 1, false);
    }
  }, [inView]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
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

        // Price filters — only send when user actually changed them
        if (showPriceFilter) {
          if (priceRange[0] > PRICE_MIN) requestBody.price_min = priceRange[0];
          if (priceRange[1] < PRICE_MAX) requestBody.price_max = priceRange[1];
        }

        // Rating filter
        if (showRatingFilter && minRating > 0) {
          requestBody.min_rating = minRating;
        }

        // Sort
        requestBody.sort = sortBy;

        const response = await api.post<ApiResponse>(
          `/product/get-all-products`,
          requestBody,
        );

        if (response.data.success) {
          const fetched = response.data.data.data || [];
          const pagination = response.data.data.pagination;

          // Client-side availability filter (until backend supports it)
          let filtered = fetched;
          if (showAvailability) {
            if (availability === "in-stock") {
              filtered = fetched.filter(
                (p) => parseFloat(String(p.total_stock)) > 0,
              );
            } else if (availability === "out-of-stock") {
              filtered = fetched.filter(
                (p) => parseFloat(String(p.total_stock)) <= 0,
              );
            }
          }

          if (reset) {
            setProducts(filtered);
          } else {
            setProducts((prev) => {
              const existingIds = new Set(prev.map((p) => p.id));
              return [
                ...prev,
                ...filtered.filter((p) => !existingIds.has(p.id)),
              ];
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
          (
            err as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ??
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
    [
      loading,
      id,
      priceRange,
      sortBy,
      availability,
      minRating,
      showPriceFilter,
      showRatingFilter,
      showAvailability,
    ],
  );

  // Reset + refetch when category changes
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
    new Intl.NumberFormat("en-BD", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  const formatCategoryName = (s: string) =>
    String(s)
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

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

  // ── Shared filter panel (used in both sidebar and mobile drawer) ───────────
  const renderFilterPanel = (mobile = false) => (
    <div className={mobile ? "p-4" : ""}>
      {/* Availability */}
      {showAvailability && (
        <div className="mb-7">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
            Availability
          </h4>
          <div className="space-y-2">
            {AVAILABILITY_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-3 cursor-pointer group"
              >
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

      {/* Price Range */}
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
            {/* Min */}
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Min</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  ৳
                </span>
                <input
                  type="number"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step="100"
                  value={priceInputs[0]}
                  onChange={(e) => {
                    const v = Math.max(
                      PRICE_MIN,
                      Math.min(
                        parseInt(e.target.value) || PRICE_MIN,
                        PRICE_MAX,
                      ),
                    );
                    setPriceInputs([v, priceInputs[1]]);
                  }}
                  onBlur={applyFilters}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                  className="w-full border border-gray-300 rounded-lg pl-7 pr-2 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Max */}
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Max</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  ৳
                </span>
                <input
                  type="number"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step="100"
                  value={priceInputs[1]}
                  onChange={(e) => {
                    const v = Math.min(
                      PRICE_MAX,
                      Math.max(
                        parseInt(e.target.value) || PRICE_MAX,
                        PRICE_MIN,
                      ),
                    );
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

      {/* Rating */}
      {showRatingFilter && (
        <div className="mb-7">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
            Min Rating
          </h4>
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((r) => (
              <label
                key={r}
                className="flex items-center gap-3 cursor-pointer group"
              >
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
                      {"★".repeat(r)}
                      {"☆".repeat(5 - r)}
                      <span className="text-gray-500 ml-1">& up</span>
                    </>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Reset */}
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

  // If section is disabled, show nothing
  if (!sectionConfig.status) return null;

  // Check if any filter panel should be rendered at all
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
          <span className="text-gray-900 font-medium capitalize">
            {categoryName}
          </span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
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
            {/* Mobile filter button — only if there are filters */}
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
                <span>
                  {activeSortOptions.find((s) => s.value === sortBy)?.label ??
                    "Sort"}
                </span>
                <ChevronDown
                  className="w-4 h-4 text-gray-400 transition-transform"
                  style={{
                    transform: showSort ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              <AnimatePresence>
                {showSort && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowSort(false)}
                    />
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

        {/* Error banner */}
        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm">{error}</p>
            <button
              className="ml-auto text-red-400 hover:text-red-600"
              onClick={() => setError(null)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* ── Sidebar — desktop only, only if there are filters ── */}
          {hasAnyFilter && (
            <aside className="hidden md:block w-72 flex-shrink-0">
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

          {/* ── Mobile Drawer ── */}
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

                  {/* Mobile apply/reset footer */}
                  <div className="p-4 border-t sticky bottom-0 bg-white flex gap-3">
                    <button
                      onClick={() => {
                        resetFilters();
                        setShowFilters(false);
                      }}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                      disabled={loading}
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => {
                        applyFilters();
                      }}
                      className="flex-1 bg-primary text-white py-3 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                        </span>
                      ) : (
                        "Apply"
                      )}
                    </button>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* ── Products ── */}
          <main className="flex-1 min-w-0">
            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="hidden md:flex flex-wrap items-center gap-2 mb-4 text-sm">
                <span className="text-gray-500">Active filters:</span>
                {showPriceFilter &&
                  (priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX) && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                      ৳{formatPrice(priceRange[0])} – ৳
                      {formatPrice(priceRange[1])}
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
                    {
                      AVAILABILITY_OPTIONS.find((a) => a.value === availability)
                        ?.label
                    }
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

            {/* Content states */}
            {initialLoading ? (
              renderSkeleton()
            ) : error && products.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <svg
                  className="w-14 h-14 mx-auto text-gray-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Something went wrong
                </h3>
                <p className="text-gray-500 text-sm mb-5 max-w-sm mx-auto">
                  {error}
                </p>
                <button
                  onClick={() => fetchProducts(1, true)}
                  className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <svg
                  className="w-14 h-14 mx-auto text-gray-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 text-sm mb-5 max-w-sm mx-auto">
                  No products match your current filters. Try adjusting or
                  clearing them.
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
                    <ProductCard
                      key={p.id}
                      {...p}
                      cardStyle={productCardStyle}
                    />
                  ))}
                </div>

                {/* Infinite scroll sentinel */}
                {hasMore && (
                  <div
                    ref={ref}
                    className="py-10 flex flex-col items-center gap-3 text-gray-500"
                  >
                    {loading && (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-sm">Loading more…</span>
                      </>
                    )}
                  </div>
                )}

                {/* End of list */}
                {!hasMore && products.length > 0 && (
                  <div className="text-center py-10 border-t mt-8">
                    <p className="text-gray-700 font-semibold mb-1">
                      You've seen it all! 🎉
                    </p>
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
