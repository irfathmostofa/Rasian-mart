// app/search/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Filter,
  X,
  Loader2,
  ChevronDown,
  Search,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useCategoryStore } from "../store/useCatrgoryStore";
import { PremiumProductCard } from "@/components/layout/ProductCard/PremiumProductCard";
import api from "@/lib/api";

interface Product {
  id: number;
  code: string;
  name: string;
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

export default function SearchPage() {
  const params = useSearchParams();
  const router = useRouter();
  const query = params.get("q") || "";
  const categoryId = params.get("category_id");

  const { categories, fetchCategories } = useCategoryStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchInput, setSearchInput] = useState(query);

  // Filters
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [priceInputs, setPriceInputs] = useState<[number, number]>([0, 50000]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [showSort, setShowSort] = useState(false);
  const [availability, setAvailability] = useState<string>("all");

  // Use refs for values that shouldn't trigger re-renders
  const filtersRef = useRef({
    selectedCategories,
    priceRange,
    sortBy,
    availability,
    query,
  });

  // Update ref when filters change
  useEffect(() => {
    filtersRef.current = {
      selectedCategories,
      priceRange,
      sortBy,
      availability,
      query,
    };
  }, [selectedCategories, priceRange, sortBy, availability, query]);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px", // Load more when 100px from viewport
  });

  // Initialize price inputs from price range
  useEffect(() => {
    setPriceInputs(priceRange);
  }, []);

  // Normalize product data
  const normalizeProduct = (product: Product) => ({
    ...product,
    cost_price: parseFloat(product.cost_price as string) || 0,
    selling_price: parseFloat(product.selling_price as string) || 0,
    regular_price: parseFloat(product.regular_price as string) || 0,
    total_stock: parseFloat(product.total_stock as string) || 0,
    total_sales: parseFloat(product.total_sales as string) || 0,
    rating: product.rating || 0,
    review_count: product.review_count || 0,
  });

  // Fetch products from your Fastify backend
  const fetchProducts = useCallback(
    async (pageNum: number = 1, reset: boolean = false) => {
      if (loading && !reset) return;

      setLoading(true);
      if (reset) setInitialLoading(true);

      try {
        const currentFilters = filtersRef.current;
        const searchParams = new URLSearchParams({
          q: currentFilters.query,
          page: pageNum.toString(),
          limit: "20",
          sort: currentFilters.sortBy,
          availability: currentFilters.availability,
        });

        if (currentFilters.selectedCategories.length > 0) {
          searchParams.set(
            "category_id",
            currentFilters.selectedCategories.join(",")
          );
        }
        if (currentFilters.priceRange[0] > 0)
          searchParams.set(
            "price_min",
            currentFilters.priceRange[0].toString()
          );
        if (currentFilters.priceRange[1] < 50000)
          searchParams.set(
            "price_max",
            currentFilters.priceRange[1].toString()
          );

        // Call your Fastify backend API
        const response = await api.get<ApiResponse>(
          `/product/products/search?${searchParams}`
        );

        if (response.data.success) {
          const { products: fetchedProducts, pagination } = response.data.data;

          // Convert string numbers to numbers for consistency
          const normalizedProducts = fetchedProducts.map(normalizeProduct);

          if (reset) {
            setProducts(normalizedProducts);
          } else {
            setProducts((prev) => [...prev, ...normalizedProducts]);
          }
          setHasMore(pagination.hasMore);
          setPage(pagination.currentPage);
          setTotalProducts(pagination.total);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [loading] // Only depend on loading state
  );

  // Debounced filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setProducts([]);
      setPage(1);
      setHasMore(true);
      fetchProducts(1, true);
    }, 300); // Debounce by 300ms

    return () => clearTimeout(timer);
  }, [query, selectedCategories, priceRange, sortBy, availability]);

  // Initial load
  useEffect(() => {
    // Reset everything on initial load or when query changes
    setProducts([]);
    setPage(1);
    setHasMore(true);
    const timer = setTimeout(() => {
      fetchProducts(1, true);
    }, 100);

    return () => clearTimeout(timer);
  }, []); // Only run on mount

  // Handle category selection from URL on initial load
  useEffect(() => {
    if (categoryId) {
      const id = parseInt(categoryId);
      if (!isNaN(id) && !selectedCategories.includes(id)) {
        setSelectedCategories([id]);
      }
    }
  }, [categoryId]);

  // Load more when in view
  useEffect(() => {
    if (inView && hasMore && !loading) {
      const timer = setTimeout(() => {
        fetchProducts(page + 1);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [inView, hasMore, loading, page, fetchProducts]);

  // Fetch categories
  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  // Apply filters manually (for button clicks)
  const applyFilters = () => {
    // Update price range from inputs
    setPriceRange(priceInputs);
    // Trigger fetch via useEffect
    setShowFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 50000]);
    setPriceInputs([0, 50000]);
    setSortBy("newest");
    setAvailability("all");
    // Don't trigger fetch here - useEffect will handle it
  };

  // Clear search and show all products
  const clearSearch = () => {
    router.push("/search");
    setSearchInput("");
    resetFilters();
  };

  // Handle price input changes
  const handleMinPriceChange = (value: number) => {
    const newMin = Math.max(0, Math.min(value, priceInputs[1]));
    setPriceInputs([newMin, priceInputs[1]]);
  };

  const handleMaxPriceChange = (value: number) => {
    const newMax = Math.min(50000, Math.max(value, priceInputs[0]));
    setPriceInputs([priceInputs[0], newMax]);
  };

  // Handle price slider changes
  const handlePriceSliderChange = (index: number, value: number) => {
    if (index === 0) {
      // Min slider
      const newMin = Math.min(value, priceInputs[1]);
      setPriceInputs([newMin, priceInputs[1]]);
    } else {
      // Max slider
      const newMax = Math.max(value, priceInputs[0]);
      setPriceInputs([priceInputs[0], newMax]);
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    } else {
      clearSearch();
    }
  };

  // Sort options
  const sortOptions = [
    { value: "newest", label: "Newest Arrivals" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "popular", label: "Most Popular" },
    { value: "rating", label: "Top Rated" },
  ];

  // Availability options
  const availabilityOptions = [
    { value: "all", label: "All Products" },
    { value: "in-stock", label: "In Stock Only" },
    { value: "out-of-stock", label: "Out of Stock" },
  ];

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Search Bar for Mobile */}
        <div className="mb-6 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary outline-none"
              />
              <button
                type="submit"
                className="bg-primary text-white px-4 rounded-lg hover:bg-primary/90"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
            {query && (
              <button
                onClick={clearSearch}
                className="mt-2 text-sm text-primary hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Clear search and show all products
              </button>
            )}
          </form>
        </div>

        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-6">
          <span
            className="hover:text-primary cursor-pointer"
            onClick={() => router.push("/")}
          >
            Home
          </span>
          {" > "}
          <span className="font-medium">Search</span>
          {query && (
            <>
              {" > "}
              <span className="font-medium">"{query}"</span>
              <button
                onClick={clearSearch}
                className="ml-3 text-xs text-primary hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear search
              </button>
            </>
          )}
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {query ? `Search results for "${query}"` : "All Products"}
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
            >
              <Filter className="w-4 h-4" />
              Filters
              {(selectedCategories.length > 0 ||
                priceRange[1] < 50000 ||
                availability !== "all") && (
                <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {(selectedCategories.length > 0 ? 1 : 0) +
                    (priceRange[1] < 50000 ? 1 : 0) +
                    (availability !== "all" ? 1 : 0)}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowSort(!showSort)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
                          onClick={() => {
                            setSortBy(option.value);
                            setShowSort(false);
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                            sortBy === option.value
                              ? "bg-primary/5 text-primary font-medium border-l-2 border-primary"
                              : ""
                          }`}
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

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden md:block w-80 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-lg p-5 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                {(selectedCategories.length > 0 ||
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

              {/* Categories */}
              <div className="mb-8">
                <h4 className="font-medium text-gray-900 mb-4">Categories</h4>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                  {categories.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center group cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([
                                ...selectedCategories,
                                category.id,
                              ]);
                            } else {
                              setSelectedCategories(
                                selectedCategories.filter(
                                  (id) => id !== category.id
                                )
                              );
                            }
                          }}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                          disabled={loading}
                        />
                        <span className="ml-3 text-sm text-gray-700 group-hover:text-primary transition-colors">
                          {category.name}
                        </span>
                        {category.children && category.children.length > 0 && (
                          <span className="ml-auto text-xs text-gray-500">
                            ({category.children.length})
                          </span>
                        )}
                      </label>
                    ))
                  )}
                </div>
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
                        onChange={() => setAvailability(option.value)}
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

              {/* Price Range with Two Controllers */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">Price Range</h4>
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
                        value={priceInputs[0]}
                        onChange={(e) =>
                          handleMinPriceChange(parseInt(e.target.value) || 0)
                        }
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
                        value={priceInputs[1]}
                        onChange={(e) =>
                          handleMaxPriceChange(parseInt(e.target.value) || 0)
                        }
                        className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none"
                        disabled={loading}
                      />
                    </div>
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

              {/* Clear All Products Link */}
              {query && (
                <button
                  onClick={clearSearch}
                  className="w-full mt-4 text-sm text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  <RefreshCw className="w-4 h-4" />
                  Clear search and show all products
                </button>
              )}
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
                        Categories
                      </h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {categories.map((category) => (
                          <label
                            key={category.id}
                            className="flex items-center group cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(category.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCategories([
                                    ...selectedCategories,
                                    category.id,
                                  ]);
                                } else {
                                  setSelectedCategories(
                                    selectedCategories.filter(
                                      (id) => id !== category.id
                                    )
                                  );
                                }
                              }}
                              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                              disabled={loading}
                            />
                            <span className="ml-3 text-sm text-gray-700">
                              {category.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

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
                              onChange={() => setAvailability(option.value)}
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
                              value={priceInputs[0]}
                              onChange={(e) =>
                                handleMinPriceChange(
                                  parseInt(e.target.value) || 0
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
                              value={priceInputs[1]}
                              onChange={(e) =>
                                handleMaxPriceChange(
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm"
                              disabled={loading}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="relative h-2 bg-gray-200 rounded-full">
                          <div
                            className="absolute h-2 bg-primary rounded-full"
                            style={{
                              left: `${(priceInputs[0] / 50000) * 100}%`,
                              right: `${100 - (priceInputs[1] / 50000) * 100}%`,
                            }}
                          ></div>
                          <input
                            type="range"
                            min="0"
                            max="50000"
                            step="100"
                            value={priceInputs[0]}
                            onChange={(e) =>
                              handlePriceSliderChange(
                                0,
                                parseInt(e.target.value)
                              )
                            }
                            className="absolute top-0 left-0 w-full h-full opacity-0"
                            disabled={loading}
                          />
                          <input
                            type="range"
                            min="0"
                            max="50000"
                            step="100"
                            value={priceInputs[1]}
                            onChange={(e) =>
                              handlePriceSliderChange(
                                1,
                                parseInt(e.target.value)
                              )
                            }
                            className="absolute top-0 left-0 w-full h-full opacity-0"
                            disabled={loading}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>৳ 0</span>
                          <span>৳ 25,000</span>
                          <span>৳ 50,000</span>
                        </div>
                      </div>
                    </div>

                    {query && (
                      <div className="mb-4">
                        <button
                          onClick={clearSearch}
                          className="w-full text-sm text-primary hover:text-primary/80 flex items-center justify-center gap-2 py-2"
                          disabled={loading}
                        >
                          <RefreshCw className="w-4 h-4" />
                          Clear search
                        </button>
                      </div>
                    )}

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
              {selectedCategories.length > 0 && (
                <div className="text-sm text-gray-600">
                  Categories:{" "}
                  {selectedCategories.map((catId, idx) => {
                    const cat = categories.find((c) => c.id === catId);
                    return (
                      <span key={catId} className="font-medium">
                        {cat?.name}
                        {idx < selectedCategories.length - 1 ? ", " : ""}
                      </span>
                    );
                  })}
                </div>
              )}
              {priceRange[1] < 50000 && (
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
              {(selectedCategories.length > 0 ||
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
                  {query
                    ? `We couldn't find any products matching "${query}". Try adjusting your search terms.`
                    : "No products found with the selected filters. Try adjusting your filters."}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={resetFilters}
                    className="px-6 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-primary/5 transition-colors"
                    disabled={loading}
                  >
                    Reset Filters
                  </button>
                  {query && (
                    <button
                      onClick={clearSearch}
                      className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                      disabled={loading}
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Sort and Results Count */}
                <div className="hidden md:flex justify-between items-center mb-6 p-4 bg-white border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Showing {products.length} of {totalProducts} products
                    {hasMore && " • Scroll for more"}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none disabled:opacity-50"
                      disabled={loading}
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {products.map((product) => (
                    <PremiumProductCard
                      key={product.id}
                      id={product.id}
                      primary_variant_id={product.primary_variant_id}
                      name={product.name}
                      categories={product.categories}
                      selling_price={parseFloat(
                        product.selling_price as string
                      )}
                      regular_price={parseFloat(
                        product.regular_price as string
                      )}
                      cost_price={parseFloat(product.cost_price as string)}
                      images={product.images}
                      badge={product.badge}
                      total_stock={parseFloat(product.total_stock as string)}
                      rating={product.rating || 0}
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
                    <p className="text-sm">No more products to load</p>
                    {query && (
                      <button
                        onClick={clearSearch}
                        className="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
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
    </div>
  );
}
