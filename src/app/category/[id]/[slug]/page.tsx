"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Filter, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import api from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { useSettings } from "@/app/store/useSettings";

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

export default function CategoryPage() {
  const { id, slug } = useParams(); // id is category_id, slug is category name
  const router = useRouter();
  const { productCardStyle } = useSettings();
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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [priceInputs, setPriceInputs] = useState<[number, number]>([0, 50000]);
  const [sortBy, setSortBy] = useState("newest");
  const [availability, setAvailability] = useState<string>("all");

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  // Initialize price inputs from price range
  useEffect(() => {
    setPriceInputs(priceRange);
  }, []);

  // Fetch products from API
  const fetchProducts = useCallback(
    async (pageNum: number = 1, reset: boolean = false) => {
      if (loading && !reset) return;
      if (!id) return;

      setLoading(true);
      if (reset) setInitialLoading(true);
      setError(null);

      try {
        const requestBody: any = {
          page: pageNum,
          limit: 20,
          status: "A",
          category_id: parseInt(String(id)),
        };

        // Add price filters - IMPORTANT: Use undefined, not 0, for no filter
        if (priceRange[0] > 0) {
          requestBody.price_min = priceRange[0];
        }
        // Don't send price_max if it's the maximum (50000) unless min is also set
        if (priceRange[1] < 50000 || priceRange[0] > 0) {
          requestBody.price_max = priceRange[1];
        }

        // Add availability filter to API call instead of client-side
        if (availability === "in-stock") {
          // You'll need to add a stock filter parameter to your backend
          // For now, we'll handle it client-side
        } else if (availability === "out-of-stock") {
          // You'll need to add a stock filter parameter to your backend
          // For now, we'll handle it client-side
        }

        // Call API with POST
        const response = await api.post<ApiResponse>(
          `/product/get-all-products`,
          requestBody,
        );

        if (response.data.success) {
          const fetchedProducts = response.data.data.data || [];
          const pagination = response.data.data.pagination;

          // Apply availability filter client-side (temporary)
          let filteredProducts = fetchedProducts;
          if (availability === "in-stock") {
            filteredProducts = fetchedProducts.filter(
              (p) => parseFloat(String(p.total_stock)) > 0,
            );
          } else if (availability === "out-of-stock") {
            filteredProducts = fetchedProducts.filter(
              (p) => parseFloat(String(p.total_stock)) <= 0,
            );
          }

          // For reset, replace products
          if (reset) {
            setProducts(filteredProducts);
          } else {
            // For pagination, append unique products
            setProducts((prev) => {
              const existingIds = new Set(prev.map((p) => p.id));
              const newProducts = filteredProducts.filter(
                (p) => !existingIds.has(p.id),
              );
              return [...prev, ...newProducts];
            });
          }

          setHasMore(pagination.currentPage < pagination.totalPages);
          setPage(pagination.currentPage);
          setTotalProducts(pagination.total);
        } else {
          setError("Failed to fetch products");
        }
      } catch (error: any) {
        console.error("Error fetching category products:", error);
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load products",
        );
        if (reset) {
          setProducts([]);
          setTotalProducts(0);
        }
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [loading, id, priceRange, sortBy, availability],
  );

  // Reset everything when category changes
  useEffect(() => {
    if (id) {
      setProducts([]);
      setPage(1);
      setHasMore(true);
      setPriceRange([0, 50000]);
      setPriceInputs([0, 50000]);
      setSortBy("newest");
      setAvailability("all");
      fetchProducts(1, true);
    }
  }, [id]);

  // Apply filters manually (for button clicks)
  const applyFilters = () => {
    if (priceInputs[0] > priceInputs[1]) {
      setError("Minimum price cannot be greater than maximum price");
      return;
    }

    setPriceRange(priceInputs);
    setShowFilters(false);
    // Reset and fetch with new filters
    setProducts([]);
    setPage(1);
    setHasMore(true);
    fetchProducts(1, true);
  };

  // Reset all filters
  const resetFilters = () => {
    const newPriceRange: [number, number] = [0, 50000];
    setPriceRange(newPriceRange);
    setPriceInputs(newPriceRange);
    setSortBy("newest");
    setAvailability("all");

    // Only fetch if not already at default values
    if (
      id &&
      (priceRange[0] !== 0 ||
        priceRange[1] !== 50000 ||
        sortBy !== "newest" ||
        availability !== "all")
    ) {
      setProducts([]);
      setPage(1);
      setHasMore(true);
      fetchProducts(1, true);
    }
  };

  // Handle price input changes
  const handleMinPriceChange = (value: number) => {
    const newMin = Math.max(0, Math.min(value, 50000));
    setPriceInputs([newMin, priceInputs[1]]);
  };

  const handleMaxPriceChange = (value: number) => {
    const newMax = Math.min(50000, Math.max(value, 0));
    setPriceInputs([priceInputs[0], newMax]);
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value);
    setShowSort(false);
    // Reset and fetch with new sort
    setProducts([]);
    setPage(1);
    setHasMore(true);
    fetchProducts(1, true);
  };

  // Handle availability change
  const handleAvailabilityChange = (value: string) => {
    setAvailability(value);
    // Reset and fetch with new availability filter
    setProducts([]);
    setPage(1);
    setHasMore(true);
    fetchProducts(1, true);
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Format category name
  const formatCategoryName = (slug: string) => {
    if (!slug) return "";
    return String(slug)
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 animate-pulse">
          <div className="bg-gray-200 h-60 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );

  // Get current category name
  const categoryName = formatCategoryName(String(slug));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-6">
          <span
            className="hover:text-primary cursor-pointer"
            onClick={() => router.push("/")}
          >
            Home
          </span>
          {" > "}
          <span className="font-medium">Categories</span>
          {" > "}
          <span className="font-medium capitalize">{categoryName}</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 capitalize">
              {categoryName}
            </h1>
            {!initialLoading && products.length > 0 && (
              <p className="text-gray-600 mt-1">
                Showing {products.length} of {totalProducts} products
                {hasMore && " • Scroll for more"}
              </p>
            )}
          </div>

          {/* Mobile Filter/Sort Buttons */}
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg md:hidden hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              <Filter className="w-4 h-4" />
              Filters
              {(priceRange[0] > 0 ||
                priceRange[1] < 50000 ||
                availability !== "all") && (
                <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {(priceRange[0] > 0 || priceRange[1] < 50000 ? 1 : 0) +
                    (availability !== "all" ? 1 : 0)}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowSort(!showSort)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                <span className="hidden sm:inline">Sort by:</span>
                <span className="font-medium">
                  {sortOptions.find((s) => s.value === sortBy)?.label}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {showSort && (
                  <>
                    <motion.div
                      className="fixed inset-0 z-40 md:hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowSort(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                    >
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleSortChange(option.value)}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                            sortBy === option.value
                              ? "bg-primary/5 text-primary font-medium border-l-2 border-primary"
                              : ""
                          }`}
                          disabled={loading}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden md:block w-80 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-lg p-5 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                {(priceRange[0] > 0 ||
                  priceRange[1] < 50000 ||
                  availability !== "all") && (
                  <button
                    onClick={resetFilters}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                    disabled={loading}
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Availability */}
              <div className="mb-8">
                <h4 className="font-medium text-gray-900 mb-4">Availability</h4>
                <div className="space-y-2">
                  {availabilityOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center group cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="availability"
                        checked={availability === option.value}
                        onChange={() => handleAvailabilityChange(option.value)}
                        className="w-4 h-4 text-primary border-gray-300 focus:ring-primary cursor-pointer"
                        disabled={loading}
                      />
                      <span className="ml-3 text-sm text-gray-700 group-hover:text-primary transition-colors">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">Price Range</h4>
                  <span className="text-sm text-primary font-medium">
                    ৳ {formatPrice(priceInputs[0])} - ৳{" "}
                    {formatPrice(priceInputs[1])}
                  </span>
                </div>

                {/* Price Input Fields */}
                <div className="flex gap-3 mb-4">
                  <div className="flex-1">
                    <label className="text-xs text-gray-600 mb-1 block">
                      Min Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        ৳
                      </span>
                      <input
                        type="number"
                        min="0"
                        max="50000"
                        step="100"
                        value={priceInputs[0]}
                        onChange={(e) =>
                          handleMinPriceChange(parseInt(e.target.value) || 0)
                        }
                        onBlur={applyFilters}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") applyFilters();
                        }}
                        className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-600 mb-1 block">
                      Max Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        ৳
                      </span>
                      <input
                        type="number"
                        min="0"
                        max="50000"
                        step="100"
                        value={priceInputs[1]}
                        onChange={(e) =>
                          handleMaxPriceChange(
                            parseInt(e.target.value) || 50000,
                          )
                        }
                        onBlur={applyFilters}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") applyFilters();
                        }}
                        className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={applyFilters}
                  className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Applying...
                    </span>
                  ) : (
                    "Apply Filters"
                  )}
                </button>
              </div>
            </div>
          </aside>

          {/* Mobile Filters Overlay */}
          <AnimatePresence>
            {showFilters && (
              <>
                <motion.div
                  className="fixed inset-0 bg-black/50 z-40 md:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowFilters(false)}
                />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  className="fixed left-0 top-0 h-full w-80 bg-white z-50 overflow-y-auto md:hidden"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold">Filters</h3>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        disabled={loading}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Mobile filter content */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-4">
                        Availability
                      </h4>
                      <div className="space-y-2">
                        {availabilityOptions.map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center"
                          >
                            <input
                              type="radio"
                              name="availability"
                              checked={availability === option.value}
                              onChange={() =>
                                handleAvailabilityChange(option.value)
                              }
                              className="w-4 h-4 text-primary border-gray-300"
                              disabled={loading}
                            />
                            <span className="ml-3 text-sm text-gray-700">
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Price Range for Mobile */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-900">
                          Price Range
                        </h4>
                        <span className="text-sm text-primary font-medium">
                          ৳ {formatPrice(priceInputs[0])} - ৳{" "}
                          {formatPrice(priceInputs[1])}
                        </span>
                      </div>

                      <div className="flex gap-3 mb-4">
                        <div className="flex-1">
                          <label className="text-xs text-gray-600 mb-1 block">
                            Min Price
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              ৳
                            </span>
                            <input
                              type="number"
                              min="0"
                              max="50000"
                              step="100"
                              value={priceInputs[0]}
                              onChange={(e) =>
                                handleMinPriceChange(
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm"
                              disabled={loading}
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-gray-600 mb-1 block">
                            Max Price
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              ৳
                            </span>
                            <input
                              type="number"
                              min="0"
                              max="50000"
                              step="100"
                              value={priceInputs[1]}
                              onChange={(e) =>
                                handleMaxPriceChange(
                                  parseInt(e.target.value) || 50000,
                                )
                              }
                              className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm"
                              disabled={loading}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={resetFilters}
                        className="flex-1 border border-primary text-primary py-3 rounded-lg font-medium hover:bg-primary/5 transition-colors disabled:opacity-50"
                        disabled={loading}
                      >
                        Reset
                      </button>
                      <button
                        onClick={applyFilters}
                        className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Applying...
                          </span>
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <main className="flex-1">
            {/* Active Filters - Desktop */}
            <div className="hidden md:flex flex-wrap gap-2 mb-6">
              {(priceRange[0] > 0 || priceRange[1] < 50000) && (
                <div className="text-sm text-gray-600">
                  Price:{" "}
                  <span className="font-medium">
                    ৳ {formatPrice(priceRange[0])} - ৳{" "}
                    {formatPrice(priceRange[1])}
                  </span>
                </div>
              )}
              {availability !== "all" && (
                <div className="text-sm text-gray-600">
                  Availability:{" "}
                  <span className="font-medium">
                    {
                      availabilityOptions.find((a) => a.value === availability)
                        ?.label
                    }
                  </span>
                </div>
              )}
              {(priceRange[0] > 0 ||
                priceRange[1] < 50000 ||
                availability !== "all") && (
                <button
                  onClick={resetFilters}
                  className="text-sm text-primary hover:underline ml-4"
                  disabled={loading}
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Products */}
            {initialLoading ? (
              renderSkeleton()
            ) : error ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 md:p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
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
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Error Loading Products
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
                <button
                  onClick={() => fetchProducts(1, true)}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  disabled={loading}
                >
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 md:p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
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
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  No products found in this category with the selected filters.
                  Try adjusting your filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  disabled={loading}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3  gap-4 md:gap-6">
                  {products.map((p) => (
                    <ProductCard
                      key={p.id}
                      {...p}
                      cardStyle={productCardStyle}
                    />
                  ))}
                </div>

                {/* Infinite Scroll Trigger */}
                {hasMore && (
                  <div ref={ref} className="py-10 text-center">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-gray-600">
                          Loading more products...
                        </span>
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
                        <p>Scroll to load more</p>
                      </div>
                    )}
                  </div>
                )}

                {/* End of results */}
                {!hasMore && products.length > 0 && (
                  <div className="text-center py-10 text-gray-500 border-t mt-8">
                    <p className="text-lg font-medium mb-2">
                      You've seen it all! 🎉
                    </p>
                    <p className="text-sm">
                      No more {categoryName} products to load
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

// Add these outside the component
const sortOptions = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Top Rated" },
];

const availabilityOptions = [
  { value: "all", label: "All Products" },
  { value: "in-stock", label: "In Stock Only" },
  { value: "out-of-stock", label: "Out of Stock" },
];
