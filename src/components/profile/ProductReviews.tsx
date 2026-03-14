"use client";
import { useEffect, useState } from "react";
import { useUserStore } from "@/app/store/useUserStore";
import api from "@/lib/api";
import {
  Loader2,
  Star,
  ChevronLeft,
  ChevronRight,
  Package,
  MessageSquare,
  Image as ImageIcon,
  ThumbsUp,
  Calendar,
  Filter,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/app/store/useToastStore";

interface ReviewImage {
  id: number;
  image_url: string;
}

interface Review {
  id: number;
  order_id: number;
  variant_id: number;
  rating: string;
  title: string;
  comment: string;
  helpful_count: number;
  created_at: string;
  order_status: string;
  order_date: string;
  product_id: number;
  product_name: string;
  product_slug: string;
  variant_name: string;
  variant_code: string;
  variant_sku: string | null;
  variant_price: string;
  images: ReviewImage[];
}

interface Pagination {
  currentPage: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: Review[];
  pagination: Pagination;
}

export default function ProductReviews() {
  const { user } = useUserStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "highest" | "lowest"
  >("newest");
  const [showFilters, setShowFilters] = useState(false);
  const { showToast } = useToastStore();

  // Calculate statistics from reviews
  const calculateStats = () => {
    if (!reviews.length) return null;

    const total = reviews.length;
    const sum = reviews.reduce(
      (acc, review) => acc + parseFloat(review.rating),
      0,
    );
    const average = (sum / total).toFixed(1);

    const ratingBreakdown = {
      5: reviews.filter((r) => parseFloat(r.rating) === 5).length,
      4: reviews.filter((r) => parseFloat(r.rating) === 4).length,
      3: reviews.filter((r) => parseFloat(r.rating) === 3).length,
      2: reviews.filter((r) => parseFloat(r.rating) === 2).length,
      1: reviews.filter((r) => parseFloat(r.rating) === 1).length,
    };

    const productsReviewed = new Set(reviews.map((r) => r.product_id)).size;
    const lastReviewDate =
      reviews.length > 0
        ? new Date(
            Math.max(...reviews.map((r) => new Date(r.created_at).getTime())),
          ).toISOString()
        : new Date().toISOString();

    return {
      total_reviews: total,
      average_rating: average,
      products_reviewed: productsReviewed,
      last_review_date: lastReviewDate,
      rating_breakdown: ratingBreakdown,
    };
  };

  const stats = calculateStats();

  const fetchReviews = async (pageNumber = 1) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await api.post<ApiResponse>(
        `/product/get-customer-reviews`,
        {
          page: pageNumber,
          limit,
          customerId: user.id,
        },
      );

      if (response.data.success) {
        setReviews(response.data.data || []);
        setPagination(response.data.pagination);
        setPage(response.data.pagination.currentPage);
      }
    } catch (error: any) {
      showToast(
        error?.response?.data?.message || "Failed to load reviews",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, [user?.id, filterRating, sortBy]);

  const renderStars = (rating: string | number, size: "sm" | "md" = "md") => {
    const numRating = typeof rating === "string" ? parseFloat(rating) : rating;
    const starSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= numRating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const handleFilterChange = (rating: number | null) => {
    setFilterRating(rating);
    setPage(1);
  };

  const handleSortChange = (
    value: "newest" | "oldest" | "highest" | "lowest",
  ) => {
    setSortBy(value);
    setPage(1);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Please Login</h3>
        <p className="text-gray-500 mt-1">Login to view your reviews</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-linear-to-br from-blue-50 to-blue-100 p-4 rounded-xl"
          >
            <p className="text-sm text-blue-600 font-medium">Total Reviews</p>
            <p className="text-2xl font-bold text-blue-900">
              {stats.total_reviews}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-linear-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl"
          >
            <p className="text-sm text-yellow-600 font-medium">Avg. Rating</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-yellow-900">
                {stats.average_rating}
              </p>
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-linear-to-br from-green-50 to-green-100 p-4 rounded-xl"
          >
            <p className="text-sm text-green-600 font-medium">
              Products Reviewed
            </p>
            <p className="text-2xl font-bold text-green-900">
              {stats.products_reviewed}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-linear-to-br from-purple-50 to-purple-100 p-4 rounded-xl"
          >
            <p className="text-sm text-purple-600 font-medium">Last Review</p>
            <p className="text-lg font-bold text-purple-900">
              {new Date(stats.last_review_date).toLocaleDateString()}
            </p>
          </motion.div>
        </div>
      )}
      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No reviews yet</h3>
          <p className="text-gray-500 mt-1">
            {filterRating
              ? "No reviews match the selected rating"
              : "You haven't reviewed any products yet"}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Product Image Placeholder */}
                  <Link
                    href={`/product/${review.product_slug}`}
                    className="md:w-24"
                  >
                    <div className="relative w-24 h-24 bg-linear-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  </Link>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                      <div>
                        <Link
                          href={`/product/${review.product_slug}`}
                          className="text-lg font-semibold text-gray-900 hover:text-indigo-600"
                        >
                          {review.product_name}
                        </Link>
                        {review.variant_name && (
                          <p className="text-sm text-gray-500">
                            Variant: {review.variant_name} • Code:{" "}
                            {review.variant_code}
                            {review.variant_sku &&
                              ` • SKU: ${review.variant_sku}`}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500">
                            {parseFloat(review.rating).toFixed(1)}/5
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(review.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </div>
                    </div>

                    {review.title && (
                      <h4 className="font-medium text-gray-900 mt-3">
                        {review.title}
                      </h4>
                    )}

                    <p className="text-gray-600 mt-2">{review.comment}</p>

                    {/* Review Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {review.images.map((img) => (
                          <button
                            key={img.id}
                            onClick={() => setSelectedImage(img.image_url)}
                            className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden hover:opacity-90 transition border border-gray-200"
                          >
                            <Image
                              src={img.image_url}
                              alt="Review"
                              fill
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Order Info */}
                    <div className="mt-2 text-xs text-gray-400">
                      Order #{review.order_id} • {review.order_status}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
              <p className="text-sm text-gray-500">
                Page {pagination.currentPage} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchReviews(page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={() => fetchReviews(page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-3xl max-h-[80vh]"
            >
              <Image
                src={selectedImage}
                alt="Review"
                width={800}
                height={600}
                className="object-contain rounded-lg"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
