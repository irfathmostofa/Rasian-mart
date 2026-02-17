// app/search/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Filter,
  X,
  Loader2,
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useCategoryStore } from "../store/useCatrgoryStore";
import api from "@/lib/api";
import { useSettings } from "../store/useSettings";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "../store/useProductStore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    products: Product[];
    pagination: {
      currentPage: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
      nextPage: number | null;
    };
  };
}

interface CategoryItem {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  image?: string | null;
  children?: CategoryItem[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRICE_MIN = 0;
const PRICE_MAX = 50000;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Top Rated" },
];

const AVAILABILITY_OPTIONS = [
  { value: "all", label: "All Products" },
  { value: "in-stock", label: "In Stock" },
  { value: "out-of-stock", label: "Out of Stock" },
];

const RATING_OPTIONS = [5, 4, 3, 2, 1];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

const normalizeProduct = (p: Product): Product => ({
  ...p,
  cost_price: parseFloat(String(p.cost_price)) || 0,
  selling_price: parseFloat(String(p.selling_price)) || 0,
  regular_price: parseFloat(String(p.regular_price)) || 0,
  total_stock: parseFloat(String(p.total_stock)) || 0,
  total_sales: parseFloat(String(p.total_sales)) || 0,
  rating: p.rating || 0,
  review_count: p.review_count || 0,
});

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
        {title}
      </h4>
      {children}
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20">
      {label}
      <button
        onClick={onRemove}
        className="rounded-full hover:bg-primary/20 p-0.5 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

function EmptyState({
  title,
  message,
  actions,
}: {
  title: string;
  message: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-10 md:p-14 text-center">
      <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-7 h-7 text-gray-300"
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
      </div>
      <h3 className="text-base font-semibold text-gray-800 mb-1.5">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs mx-auto mb-5">{message}</p>
      {actions && (
        <div className="flex flex-wrap gap-3 justify-center">{actions}</div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const params = useSearchParams();
  const router = useRouter();
  const query = params.get("q") || "";
  const categoryId = params.get("category_id");
  const { productCardStyle } = useSettings();
  const { categories, fetchCategories } = useCategoryStore();

  // ── State ─────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set());

  // Filters
  const [priceRange, setPriceRange] = useState<[number, number]>([
    PRICE_MIN,
    PRICE_MAX,
  ]);
  const [priceInputs, setPriceInputs] = useState<[number, number]>([
    PRICE_MIN,
    PRICE_MAX,
  ]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [availability, setAvailability] = useState("all");
  const [minRating, setMinRating] = useState(0);

  // Keep filter values in a ref so fetchProducts always has fresh values
  // without needing to be in its dependency array
  const filtersRef = useRef({
    selectedCategories,
    priceRange,
    sortBy,
    availability,
    minRating,
    query,
  });
  useEffect(() => {
    filtersRef.current = {
      selectedCategories,
      priceRange,
      sortBy,
      availability,
      minRating,
      query,
    };
  }, [selectedCategories, priceRange, sortBy, availability, minRating, query]);

  const { ref, inView } = useInView({ threshold: 0, rootMargin: "120px" });

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(
    async (pageNum = 1, reset = false) => {
      if (loading && !reset) return;
      setLoading(true);
      if (reset) setInitialLoading(true);

      try {
        const f = filtersRef.current;
        const sp = new URLSearchParams({
          q: f.query,
          page: pageNum.toString(),
          limit: "20",
          sort: f.sortBy,
          availability: f.availability,
        });

        if (f.selectedCategories.length > 0)
          sp.set("category_id", f.selectedCategories.join(","));
        if (f.priceRange[0] > PRICE_MIN)
          sp.set("price_min", f.priceRange[0].toString());
        if (f.priceRange[1] < PRICE_MAX)
          sp.set("price_max", f.priceRange[1].toString());

        const res = await api.get<ApiResponse>(
          `/product/products/search?${sp}`,
        );

        if (res.data.success) {
          const { products: fetched, pagination } = res.data.data;
          let normalized = fetched.map(normalizeProduct);

          // Client-side rating filter
          if (f.minRating > 0)
            normalized = normalized.filter(
              (p) => (p.rating ?? 0) >= f.minRating,
            );

          if (reset) {
            setProducts(normalized);
          } else {
            setProducts((prev) => {
              const ids = new Set(prev.map((p) => p.id));
              return [...prev, ...normalized.filter((p) => !ids.has(p.id))];
            });
          }
          setHasMore(pagination.hasMore);
          setPage(pagination.currentPage);
          setTotalProducts(pagination.total);
        }
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [loading],
  ); // intentionally minimal — filtersRef keeps values fresh

  // Debounced re-fetch when filters change
  useEffect(() => {
    const t = setTimeout(() => {
      setProducts([]);
      setPage(1);
      setHasMore(true);
      fetchProducts(1, true);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selectedCategories, priceRange, sortBy, availability, minRating]);

  // Mount
  useEffect(() => {
    const t = setTimeout(() => fetchProducts(1, true), 100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pre-select category from URL param
  useEffect(() => {
    if (categoryId) {
      const numId = parseInt(categoryId);
      if (!isNaN(numId)) setSelectedCategories([numId]);
    }
  }, [categoryId]);

  // Infinite scroll
  useEffect(() => {
    if (inView && hasMore && !loading) {
      const t = setTimeout(() => fetchProducts(page + 1), 200);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, hasMore, loading, page]);

  // Fetch categories
  useEffect(() => {
    if ((categories as CategoryItem[]).length === 0) fetchCategories();
  }, [categories, fetchCategories]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const applyFilters = () => {
    setPriceRange(priceInputs);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setPriceInputs([PRICE_MIN, PRICE_MAX]);
    setSortBy("newest");
    setAvailability("all");
    setMinRating(0);
  };

  const clearSearch = () => {
    router.push("/search");
    resetFilters();
  };

  const toggleCatSelect = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const toggleCatExpand = (id: number) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const parentCats = (categories as CategoryItem[]).filter(
    (c) => c.parent_id === null,
  );

  const activeFilterCount =
    (selectedCategories.length > 0 ? 1 : 0) +
    (priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX ? 1 : 0) +
    (availability !== "all" ? 1 : 0) +
    (minRating > 0 ? 1 : 0);

  const currentSortLabel =
    SORT_OPTIONS.find((s) => s.value === sortBy)?.label ?? "Sort";

  // ── Skeleton ──────────────────────────────────────────────────────────────
  const Skeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden animate-pulse bg-white border border-gray-50"
        >
          <div className="bg-gray-100 aspect-square" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/2 mt-1" />
          </div>
        </div>
      ))}
    </div>
  );

  // ── Filter panel — shared by sidebar + mobile drawer ──────────────────────
  const FilterPanel = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={mobile ? "p-4 space-y-6" : "space-y-6"}>
      {/* Categories */}
      <FilterSection title="Categories">
        {(categories as CategoryItem[]).length === 0 ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
          </div>
        ) : (
          <div
            className="space-y-0.5 max-h-52 overflow-y-auto pr-1"
            style={{ scrollbarWidth: "thin" }}
          >
            {parentCats.map((cat) => {
              const hasKids = !!cat.children?.length;
              const isExp = expandedCats.has(cat.id);
              const isSel = selectedCategories.includes(cat.id);

              return (
                <div key={cat.id}>
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleCatSelect(cat.id)}
                      className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-sm transition-all ${
                        isSel
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {/* Custom checkbox */}
                      <span
                        className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSel
                            ? "border-primary bg-primary"
                            : "border-gray-300"
                        }`}
                      >
                        {isSel && (
                          <svg
                            viewBox="0 0 10 8"
                            className="w-2 h-2 fill-white"
                          >
                            <path
                              d="M1 4l2.5 2.5L9 1"
                              stroke="white"
                              strokeWidth="1.5"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      <span className="truncate">{cat.name}</span>
                      {hasKids && (
                        <span className="ml-auto text-[10px] text-gray-400 bg-gray-100 rounded px-1">
                          {cat.children!.length}
                        </span>
                      )}
                    </button>
                    {hasKids && (
                      <button
                        onClick={() => toggleCatExpand(cat.id)}
                        className="p-1 text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
                      >
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${isExp ? "rotate-180" : ""}`}
                        />
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {hasKids && isExp && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-4 border-l border-gray-100 pl-2 py-0.5 space-y-0.5">
                          {cat.children!.map((child) => {
                            const childSel = selectedCategories.includes(
                              child.id,
                            );
                            return (
                              <button
                                key={child.id}
                                onClick={() => toggleCatSelect(child.id)}
                                className={`w-full flex items-center gap-2 text-left px-2 py-1.5 rounded-md text-xs transition-all ${
                                  childSel
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                                }`}
                              >
                                <span
                                  className={`w-3 h-3 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                    childSel
                                      ? "border-primary bg-primary"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {childSel && (
                                    <svg
                                      viewBox="0 0 10 8"
                                      className="w-1.5 h-1.5 fill-white"
                                    >
                                      <path
                                        d="M1 4l2.5 2.5L9 1"
                                        stroke="white"
                                        strokeWidth="1.5"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  )}
                                </span>
                                {child.name}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability">
        <div className="space-y-1.5">
          {AVAILABILITY_OPTIONS.map((opt) => {
            const active = availability === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setAvailability(opt.value)}
                className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-left transition-all ${
                  active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    active ? "border-primary bg-primary" : "border-gray-300"
                  }`}
                >
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Price range */}
      <FilterSection title="Price Range">
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-gray-500">
            <span>৳{fmt(priceInputs[0])}</span>
            <span>৳{fmt(priceInputs[1])}</span>
          </div>
          <div className="flex gap-2">
            {(["Min", "Max"] as const).map((label, idx) => (
              <div key={label} className="flex-1">
                <p className="text-[10px] text-gray-400 mb-1">{label}</p>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                    ৳
                  </span>
                  <input
                    type="number"
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    step={100}
                    value={priceInputs[idx]}
                    onChange={(e) => {
                      const v = parseInt(e.target.value) || 0;
                      if (idx === 0)
                        setPriceInputs([
                          Math.max(PRICE_MIN, Math.min(v, priceInputs[1])),
                          priceInputs[1],
                        ]);
                      else
                        setPriceInputs([
                          priceInputs[0],
                          Math.min(PRICE_MAX, Math.max(v, priceInputs[0])),
                        ]);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                    disabled={loading}
                    className="w-full border border-gray-200 rounded-lg pl-7 pr-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow"
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={applyFilters}
            disabled={loading}
            className="w-full py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Min Rating">
        <div className="space-y-1">
          {RATING_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setMinRating((prev) => (prev === r ? 0 : r))}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-all ${
                minRating === r
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < r ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                  />
                ))}
              </div>
              <span className="text-xs">& up</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Mobile: clear search + apply/reset row */}
      {mobile && (
        <div className="space-y-2 pt-2 border-t border-gray-50">
          {query && (
            <button
              onClick={clearSearch}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-500 hover:text-primary transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear search &amp; show all
            </button>
          )}
          <div className="flex gap-3">
            <button
              onClick={resetFilters}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              onClick={applyFilters}
              disabled={loading}
              className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className="max-w-screen-xl mx-auto px-4 py-5">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 flex-wrap">
          <button
            onClick={() => router.push("/")}
            className="hover:text-primary transition-colors"
          >
            Home
          </button>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <span className="text-gray-800 font-medium">
            {query ? `Search: "${query}"` : "All Products"}
          </span>
        </nav>

        {/* ── Header row ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              {query ? (
                <>
                  Results for{" "}
                  <span className="text-primary">&ldquo;{query}&rdquo;</span>
                </>
              ) : (
                "All Products"
              )}
            </h1>
            {!initialLoading && (
              <p className="text-sm text-gray-500 mt-0.5">
                {totalProducts > 0
                  ? `${products.length} of ${totalProducts} products${hasMore ? " · scroll for more" : ""}`
                  : "No products found"}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile filter button */}
            <button
              onClick={() => setShowFilters(true)}
              className="md:hidden flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-primary/40 transition-colors shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSort(!showSort)}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-primary/40 transition-colors shadow-sm"
              >
                <span className="hidden sm:inline text-gray-400 text-xs">
                  Sort:
                </span>
                <span className="font-medium max-w-[130px] truncate">
                  {currentSortLabel}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform flex-shrink-0 ${showSort ? "rotate-180" : ""}`}
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
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.13 }}
                      className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      {SORT_OPTIONS.map((opt, i) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSortBy(opt.value);
                            setShowSort(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            sortBy === opt.value
                              ? "bg-primary/5 text-primary font-semibold"
                              : "text-gray-700 hover:bg-gray-50"
                          } ${i < SORT_OPTIONS.length - 1 ? "border-b border-gray-50" : ""}`}
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

            {/* Clear search — visible when a query is active */}
            {query && (
              <button
                onClick={clearSearch}
                disabled={loading}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-2 text-xs text-gray-500 hover:text-primary transition-colors rounded-lg hover:bg-gray-100"
              >
                <X className="w-3.5 h-3.5" /> Clear search
              </button>
            )}

            {/* Clear filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                disabled={loading}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-2 text-xs text-gray-500 hover:text-primary transition-colors rounded-lg hover:bg-gray-100"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Active filter chips */}
        {(activeFilterCount > 0 || query) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {query && (
              <FilterChip label={`"${query}"`} onRemove={clearSearch} />
            )}
            {selectedCategories.map((catId) => {
              const name =
                (categories as CategoryItem[]).find((c) => c.id === catId)
                  ?.name ??
                (categories as CategoryItem[])
                  .flatMap((c) => c.children ?? [])
                  .find((c) => c.id === catId)?.name ??
                "Category";
              return (
                <FilterChip
                  key={catId}
                  label={name}
                  onRemove={() => toggleCatSelect(catId)}
                />
              );
            })}
            {(priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX) && (
              <FilterChip
                label={`৳${fmt(priceRange[0])} – ৳${fmt(priceRange[1])}`}
                onRemove={() => {
                  setPriceRange([PRICE_MIN, PRICE_MAX]);
                  setPriceInputs([PRICE_MIN, PRICE_MAX]);
                }}
              />
            )}
            {availability !== "all" && (
              <FilterChip
                label={
                  AVAILABILITY_OPTIONS.find((a) => a.value === availability)
                    ?.label ?? ""
                }
                onRemove={() => setAvailability("all")}
              />
            )}
            {minRating > 0 && (
              <FilterChip
                label={`${minRating}★ & up`}
                onRemove={() => setMinRating(0)}
              />
            )}
          </div>
        )}

        {/* ── Main layout ── */}
        <div className="flex gap-5">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-60 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm sticky top-24 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-gray-800">
                    Filters
                  </span>
                  {activeFilterCount > 0 && (
                    <span className="text-[10px] font-bold bg-primary/10 text-primary rounded-full px-1.5 py-0.5 leading-none">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetFilters}
                    disabled={loading}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>

              <div className="p-4">
                <FilterPanel />
              </div>

              {/* Clear search CTA inside sidebar */}
              {query && (
                <div className="px-4 pb-4">
                  <button
                    onClick={clearSearch}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs text-gray-500 hover:text-primary border border-dashed border-gray-200 rounded-lg hover:border-primary/40 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Clear search &amp; show all
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Products */}
          <main className="flex-1 min-w-0">
            {initialLoading ? (
              <Skeleton />
            ) : products.length === 0 ? (
              <EmptyState
                title={
                  query ? `No results for "${query}"` : "No products found"
                }
                message={
                  query
                    ? "Try different keywords or remove some filters."
                    : "Try adjusting or clearing your filters."
                }
                actions={
                  <>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={resetFilters}
                        className="px-5 py-2 border border-primary text-primary rounded-lg text-sm font-semibold hover:bg-primary/5 transition-colors"
                      >
                        Reset Filters
                      </button>
                    )}
                    {query && (
                      <button
                        onClick={clearSearch}
                        className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                      >
                        Browse All Products
                      </button>
                    )}
                  </>
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      {...product}
                      cardStyle={productCardStyle}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div
                    ref={ref}
                    className="py-10 flex flex-col items-center gap-2"
                  >
                    {loading && (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <p className="text-sm text-gray-500">Loading more…</p>
                      </>
                    )}
                  </div>
                )}

                {!hasMore && products.length > 0 && (
                  <div className="text-center py-10 border-t border-gray-100 mt-6 space-y-3">
                    <p className="text-sm font-medium text-gray-600">
                      All {fmt(totalProducts)} products loaded 🎉
                    </p>
                    {query && (
                      <button
                        onClick={clearSearch}
                        className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                      >
                        Browse All Products
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* ── Mobile filter drawer ── */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-[min(300px,88vw)] bg-white z-50 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-gray-800">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="text-[10px] font-bold bg-primary/10 text-primary rounded-full px-1.5 py-0.5">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <FilterPanel mobile />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
