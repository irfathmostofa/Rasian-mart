"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  Filter,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { useCategoryStore } from "../store/useCatrgoryStore";
import { ProductCardProps } from "@/types/ProductCard";

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    data: ProductCardProps[];
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

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
  children?: Category[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function flattenCategories(cats: Category[]): Category[] {
  const result: Category[] = [];
  for (const cat of cats) {
    result.push(cat);
    if (cat.children?.length) result.push(...flattenCategories(cat.children));
  }
  return result;
}

const DEFAULT_SORT_OPTIONS = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Top Rated" },
];

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function CategoriesPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-1.5 mb-4">
          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
        </div>

        {/* Category strip skeleton */}
        <div className="flex gap-2.5 overflow-hidden mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 h-9 w-24 rounded-full bg-gray-200 animate-pulse"
            />
          ))}
        </div>

        {/* Products grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="bg-gray-200 h-52 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Category Filter Strip ────────────────────────────────────────────────────

interface CategoryStripProps {
  allCategories: Category[];
  selectedIds: number[];
  activeFilterId: number | null; // null = show all selected
  onSelect: (id: number | null) => void;
  loading: boolean;
}

function CategoryFilterStrip({
  allCategories,
  selectedIds,
  activeFilterId,
  onSelect,
  loading,
}: CategoryStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const flat = flattenCategories(allCategories);
  const relevantCats = flat.filter((c) => selectedIds.includes(c.id));

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
  }, [relevantCats.length, checkScroll]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -240 : 240,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <div className="flex gap-2.5 overflow-hidden mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 h-9 w-24 rounded-full bg-gray-200 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (relevantCats.length < 2) return null;

  return (
    <div className="relative mb-6 -mx-1">
      <AnimatePresence>
        {canScrollLeft && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute left-0 top-0 bottom-0 z-10 flex items-center"
          >
            <div className="w-10 h-full bg-linear-to-r from-gray-50 to-transparent pointer-events-none absolute" />
            <button
              onClick={() => scroll("left")}
              className="relative z-10 ml-1 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto px-1 py-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* "All" pill */}
        <button
          onClick={() => onSelect(null)}
          className={`shrink-0 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 whitespace-nowrap ${
            activeFilterId === null
              ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.03]"
              : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary hover:bg-primary/4"
          }`}
        >
          All
          <span
            className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              activeFilterId === null
                ? "bg-white/20"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {selectedIds.length}
          </span>
        </button>

        {relevantCats.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`shrink-0 px-3.5 py-2 rounded-full border text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeFilterId === cat.id
                ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.03]"
                : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary hover:bg-primary/4"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {canScrollRight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-0 top-0 bottom-0 z-10 flex items-center justify-end"
          >
            <div className="w-10 h-full bg-linear-to-l from-gray-50 to-transparent pointer-events-none absolute" />
            <button
              onClick={() => scroll("right")}
              className="relative z-10 mr-1 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-all"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Categories Content ──────────────────────────────────────────────────

function CategoriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    categories,
    fetchCategories,
    loading: categoriesLoading,
  } = useCategoryStore();

  const [isClient, setIsClient] = useState(false);

  // Parse ?ids=2,1,3,4 from URL
  const categoryIds: number[] = (searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => parseInt(s.trim()))
    .filter((n) => !isNaN(n) && n > 0);

  // Which category to show — null means all
  const [activeFilterId, setActiveFilterId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState(DEFAULT_SORT_OPTIONS[0].value);
  const [showSort, setShowSort] = useState(false);

  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Handle client-side mounting
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch categories from store
  useEffect(() => {
    if (!categories.length) fetchCategories();
  }, [categories.length, fetchCategories]);

  // The ids to actually request (single or all)
  const effectiveIds = activeFilterId !== null ? [activeFilterId] : categoryIds;

  // ── Fetch products ─────────────────────────────────────────────────────────
  const fetchProducts = useCallback(
    async (pageNum = 1, reset = false) => {
      if (!effectiveIds.length) return;
      if (loading && !reset) return;

      setLoading(true);
      if (reset) setInitialLoading(true);
      setError(null);

      try {
        const response = await api.post<ApiResponse>(
          "/product/get-all-products-with-cat",
          {
            page: pageNum,
            limit: 20,
            category_ids: effectiveIds,
            category_match_type: "ANY",
            sort: sortBy,
          },
        );

        if (response.data.success) {
          const fetched = response.data.data.data || [];
          const pagination = response.data.data.pagination;

          if (reset) {
            setProducts(fetched);
          } else {
            setProducts((prev) => {
              const seen = new Set(prev.map((p) => p.id));
              return [...prev, ...fetched.filter((p) => !seen.has(p.id))];
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
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ??
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortBy, activeFilterId, categoryIds.join(",")],
  );

  // Reset + refetch when ids, active filter, or sort changes
  useEffect(() => {
    if (categoryIds.length && isClient) {
      setProducts([]);
      setPage(1);
      setHasMore(true);
      fetchProducts(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilterId, sortBy, searchParams.get("ids"), isClient]);

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setShowSort(false);
  };

  const handleCategoryFilter = (id: number | null) => {
    setActiveFilterId(id);
  };

  // ── Page title: derive from selected categories ────────────────────────────
  const flat = flattenCategories(categories);
  const selectedCats = flat.filter((c) => categoryIds.includes(c.id));
  const pageTitle =
    selectedCats.length === 1
      ? selectedCats[0].name
      : selectedCats.length > 1
        ? `${selectedCats[0].name} & more`
        : "Products";

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return <CategoriesPageSkeleton />;
  }

  // ── Guard: no IDs in URL ───────────────────────────────────────────────────
  if (!categoryIds.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No categories specified.</p>
          <button
            onClick={() => router.push("/")}
            className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
          <span
            className="hover:text-primary cursor-pointer transition-colors"
            onClick={() => router.push("/")}
          >
            Home
          </span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">{pageTitle}</span>
        </nav>

        {/* Page header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {pageTitle}
            </h1>
            {!initialLoading && products.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Showing {products.length} of {totalProducts} products
                {hasMore && " · Scroll for more"}
              </p>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSort((p) => !p)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:border-primary transition-colors text-sm font-medium"
              disabled={loading}
            >
              <span className="hidden sm:inline text-gray-500">Sort:</span>
              <span>
                {DEFAULT_SORT_OPTIONS.find((s) => s.value === sortBy)?.label ??
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
                    {DEFAULT_SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleSortChange(opt.value)}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                          sortBy === opt.value
                            ? "bg-primary/5 text-primary font-semibold border-l-2 border-primary"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
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

        {/* Category filter strip (only when 2+ categories) */}
        <CategoryFilterStrip
          allCategories={categories}
          selectedIds={categoryIds}
          activeFilterId={activeFilterId}
          onSelect={handleCategoryFilter}
          loading={categoriesLoading}
        />

        {/* Error banner */}
        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm">{error}</p>
            <button
              className="ml-auto text-red-400 hover:text-red-600"
              onClick={() => setError(null)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Products */}
        {initialLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="bg-gray-200 h-52 rounded-lg mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
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
              {activeFilterId !== null
                ? "No products in this category. Try switching to All."
                : "No products found for the selected categories."}
            </p>
            {activeFilterId !== null && (
              <button
                onClick={() => handleCategoryFilter(null)}
                className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Show All
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {products.map((p) => (
                <ProductCard key={p.id} {...p}  />
              ))}
            </div>

            {/* Load More */}
            <div className="mt-10 flex flex-col items-center gap-3">
              {hasMore ? (
                <button
                  onClick={() => fetchProducts(page + 1, false)}
                  disabled={loading}
                  className="inline-flex items-center gap-2.5 px-8 py-3 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading…
                    </>
                  ) : (
                    <>
                      Load More
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                        {totalProducts - products.length} remaining
                      </span>
                    </>
                  )}
                </button>
              ) : (
                <div className="text-center py-6 border-t w-full mt-2">
                  <p className="text-gray-700 font-semibold mb-1">
                    You've seen it all! 🎉
                  </p>
                  <p className="text-sm text-gray-400">
                    All {totalProducts} products loaded
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-400">
                {products.length} of {totalProducts} products
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page with Suspense ──────────────────────────────────────────────────

export default function CategoriesPage() {
  return (
    <Suspense fallback={<CategoriesPageSkeleton />}>
      <CategoriesContent />
    </Suspense>
  );
}
