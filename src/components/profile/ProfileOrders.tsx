"use client";
import { useEffect, useState } from "react";
import { useUserStore } from "@/app/store/useUserStore";
import api from "@/lib/api";
import {
  Loader2,
  Truck,
  XCircle,
  Repeat,
  ChevronLeft,
  ChevronRight,
  Package,
  Calendar,
  Filter,
  Search,
  Download,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  User,
  Copy,
  Check,
  Barcode,
  Star,
  MessageSquare,
  Image as ImageIcon,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/app/store/useToastStore";
import Image from "next/image";
import { uploadImageToCloudinary } from "../helper";

interface OrderItem {
  id: number;
  product_variant_id: number;
  product_name: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  discount: number;
  subtotal: number;
  image?: string;
}

interface Order {
  id: number;
  code: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_status: string;
  payment_status: string;
  delivery_method_name: string;
  payment_method_name: string;
  delivery_status: string;
  tracking_code: string;
  created_at: string;
  items: OrderItem[];
  total_items?: number;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  product: OrderItem;
  onSubmit: (reviewData: any) => void;
  isSubmitting: boolean;
  user: any;
}

// Review Modal Component
function ReviewModal({
  isOpen,
  onClose,
  order,
  product,
  onSubmit,
  isSubmitting,
  user,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      alert("You can only upload up to 5 images");
      return;
    }

    setImages([...images, ...files]);

    // Create preview URLs
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrls((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviewUrls(imagePreviewUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setUploadingImages(true);

    try {
      // Upload images to Cloudinary
      const uploadedUrls: { url: string }[] = [];

      for (const file of images) {
        try {
          const imageUrl = await uploadImageToCloudinary(file);
          uploadedUrls.push({ url: imageUrl });
        } catch (error) {
          console.error("Error uploading image:", error);
          alert("Failed to upload one or more images. Please try again.");
          setUploadingImages(false);
          return;
        }
      }

      onSubmit({
        order_id: order.id,
        product_id: product.product_variant_id,
        customer_id: user.id,
        rating,
        title: title || undefined,
        comment: comment || undefined,
        images: uploadedUrls,
      });
    } catch (error) {
      console.error("Error in review submission:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setUploadingImages(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Write a Review
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {product.product_name}{" "}
                    {product.variant_name && `(${product.variant_name})`}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoverRating || rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarize your experience"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  maxLength={100}
                />
              </div>

              {/* Comment */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Comment
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this product"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  maxLength={500}
                />
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Photos (Optional - Max 5)
                </label>

                {/* Image Previews */}
                {imagePreviewUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative w-20 h-20">
                        <Image
                          src={url}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                {images.length < 5 && (
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                      <Upload className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Upload Images
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Max 5 images, each up to 5MB
                </p>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting || uploadingImages}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting || uploadingImages ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {uploadingImages
                      ? "Uploading Images..."
                      : "Submitting Review..."}
                  </>
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ProfileOrders() {
  const { user } = useUserStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    order: Order | null;
    product: OrderItem | null;
  }>({
    isOpen: false,
    order: null,
    product: null,
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedProducts, setReviewedProducts] = useState<Set<string>>(
    new Set(),
  );

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
  const { showToast } = useToastStore();

  // Filters
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = async (pageNumber = 1) => {
    if (!user?.id) {
      setOrders([]);
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(
        "/order/get-all-order",
        {
          page: pageNumber,
          limit,
          customer_id: user.id,
          order_status: orderStatus || null,
          payment_status: paymentStatus || null,
          from_date: fromDate || null,
          to_date: toDate || null,
          search: searchQuery || null,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setOrders(res?.data?.data || []);
      setTotalPages(res?.data?.pagination?.totalPages || 1);
      setPage(pageNumber);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [user?.id]);

  const applyFilters = () => {
    fetchOrders(1);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setOrderStatus("");
    setPaymentStatus("");
    setFromDate("");
    setToDate("");
    setSearchQuery("");
    fetchOrders(1);
  };

  const cancelOrder = async (orderId: number) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      setCancellingId(orderId);
      const response = await api.post(
        "/order/cancel-order",
        { id: orderId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        showToast("Order cancelled successfully", "success");
        fetchOrders(page);
      }
    } catch (err: any) {
      console.error("Failed to cancel order:", err);
    } finally {
      setCancellingId(null);
    }
  };

  const submitReview = async (reviewData: any) => {
    try {
      setSubmittingReview(true);
      const response = await api.post("/product/create-reviews", reviewData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        showToast("Review submitted successfully!", "success");
        setReviewModal({ isOpen: false, order: null, product: null });

        // Mark this product as reviewed
        setReviewedProducts((prev) =>
          new Set(prev).add(`${reviewData.order_id}-${reviewData.product_id}`),
        );
      }
    } catch (err: any) {
      console.error("Failed to submit review:", err);
      showToast(
        err?.response?.data?.message || "Failed to submit review",
        "error",
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const copyToClipboard = (text: string, trackingId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTrackingId(trackingId);
    showToast("Tracking code copied to clipboard", "success");

    setTimeout(() => {
      setCopiedTrackingId(null);
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    const config = {
      delivered: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: CheckCircle,
        label: "Delivered",
      },
      completed: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: CheckCircle,
        label: "Completed",
      },
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: Clock,
        label: "Pending",
      },
      processing: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: Loader2,
        label: "Processing",
      },
      confirmed: {
        bg: "bg-indigo-100",
        text: "text-indigo-800",
        icon: CheckCircle,
        label: "Confirmed",
      },
      shipped: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        icon: Truck,
        label: "Shipped",
      },
      cancelled: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: XCircle,
        label: "Cancelled",
      },
      canceled: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: XCircle,
        label: "Cancelled",
      },
    };

    const statusConfig = config[statusLower as keyof typeof config] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      icon: AlertCircle,
      label: status,
    };

    const Icon = statusConfig.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
      >
        <Icon className="w-3 h-3" />
        {statusConfig.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    const colors = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-purple-100 text-purple-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${colors[statusLower as keyof typeof colors] || "bg-gray-100 text-gray-800"}`}
      >
        {status}
      </span>
    );
  };

  const hasReviewed = (orderId: number, productId: number) => {
    return reviewedProducts.has(`${orderId}-${productId}`);
  };

  if (loading && !orders.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="mt-4 text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  return (
    <>
      <div className="">
        {/* Header with Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition sm:hidden"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {/* Filters Section */}
        <AnimatePresence>
          {(showFilters || window.innerWidth >= 640) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 overflow-hidden mb-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                  />
                </div>

                <select
                  className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                >
                  <option value="">All Order Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                >
                  <option value="">All Payment Status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>

                <input
                  type="date"
                  className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  placeholder="From Date"
                />

                <input
                  type="date"
                  className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  placeholder="To Date"
                />
              </div>

              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Clear
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orders List */}
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200"
          >
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No orders found
            </h3>
            <p className="text-gray-500 mt-1 text-center max-w-sm">
              {searchQuery || orderStatus || paymentStatus || fromDate || toDate
                ? "No orders match your filters. Try adjusting your search criteria."
                : "You haven't placed any orders yet. Start shopping to see your orders here."}
            </p>
            {(searchQuery ||
              orderStatus ||
              paymentStatus ||
              fromDate ||
              toDate) && (
              <button
                onClick={clearFilters}
                className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Clear all filters
              </button>
            )}
            <Link
              href="/"
              className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition shadow-md"
            >
              Browse Products
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
                >
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">
                            Order #{order.code}
                          </span>
                        </div>
                        {getStatusBadge(order.order_status)}
                        {getPaymentStatusBadge(order.payment_status)}
                      </div>

                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tracking Code Section */}
                  {order.tracking_code && (
                    <div className="px-4 py-2 bg-indigo-50/50 border-b border-indigo-100">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Barcode className="w-4 h-4 text-indigo-600" />
                          <span className="text-xs font-medium text-indigo-700">
                            Tracking Code:
                          </span>
                          <code className="px-2 py-1 bg-white rounded border border-indigo-200 font-mono text-sm text-indigo-800">
                            {order.tracking_code}
                          </code>
                        </div>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              order.tracking_code,
                              `tracking-${order.id}`,
                            )
                          }
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200 transition"
                        >
                          {copiedTrackingId === `tracking-${order.id}` ? (
                            <>
                              <Check className="w-3 h-3" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="divide-y divide-gray-100">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {item.product_name}
                            </span>
                            {item.variant_name && (
                              <span className="text-sm text-gray-500">
                                ({item.variant_name})
                              </span>
                            )}
                            <span className="text-sm text-gray-500">
                              x{item.quantity}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            ৳ {item.unit_price.toFixed(2)} each
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              ৳ {item.subtotal.toFixed(2)}
                            </div>
                            {item.discount > 0 && (
                              <div className="text-xs text-green-600">
                                Saved ৳ {item.discount.toFixed(2)}
                              </div>
                            )}
                          </div>

                          {/* Give Feedback Button - Only for delivered orders and not reviewed yet */}
                          {order.order_status === "DELIVERED" &&
                            !hasReviewed(order.id, item.product_variant_id) && (
                              <button
                                onClick={() =>
                                  setReviewModal({
                                    isOpen: true,
                                    order,
                                    product: item,
                                  })
                                }
                                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition"
                              >
                                <Star className="w-3 h-3" />
                                Give Feedback
                              </button>
                            )}

                          {/* Already Reviewed Badge */}
                          {order.order_status === "DELIVERED" &&
                            hasReviewed(order.id, item.product_variant_id) && (
                              <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-md">
                                <Check className="w-3 h-3" />
                                Reviewed
                              </span>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-sm text-gray-500">
                            Total Items:
                          </span>
                          <span className="ml-2 font-medium text-gray-900">
                            {order.items.length}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-indigo-600">
                          ৳{" "}
                          {order.items
                            .reduce(
                              (sum, item) => sum + Number(item.subtotal),
                              0,
                            )
                            .toFixed(2)}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">Details</span>
                        </button>

                        {!["PENDING", "CONFIRMED", "PROCESSING"].includes(
                          order.order_status,
                        ) && (
                          <Link
                            href={`/track-order?orderId=${order.tracking_code}`}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                          >
                            <Truck className="w-4 h-4" />
                            <span className="hidden sm:inline">Track</span>
                          </Link>
                        )}

                        {["PENDING", "CONFIRMED", "PROCESSING"].includes(
                          order.order_status,
                        ) && (
                          <button
                            onClick={() => cancelOrder(order.id)}
                            disabled={cancellingId === order.id}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition disabled:opacity-50"
                          >
                            {cancellingId === order.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            <span className="hidden sm:inline">Cancel</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                <div className="text-sm text-gray-600">
                  Showing page {page} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchOrders(page - 1)}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNumber = i + 1;
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= page - 1 && pageNumber <= page + 1)
                      ) {
                        return (
                          <button
                            key={i}
                            onClick={() => fetchOrders(pageNumber)}
                            className={`w-8 h-8 text-sm rounded-lg transition ${
                              page === pageNumber
                                ? "bg-indigo-600 text-white"
                                : "bg-white border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        pageNumber === page - 2 ||
                        pageNumber === page + 2
                      ) {
                        return (
                          <span key={i} className="w-8 text-center">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => fetchOrders(page + 1)}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Order Details Modal */}
        <AnimatePresence>
          {selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Order #{selectedOrder.code}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Placed on{" "}
                        {new Date(selectedOrder.created_at).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      <XCircle className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Status */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Order Status</p>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(selectedOrder.order_status)}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">
                        Payment Status
                      </p>
                      <div className="flex items-center gap-2">
                        {getPaymentStatusBadge(selectedOrder.payment_status)}
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Customer Information
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{selectedOrder.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{selectedOrder.customer_email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{selectedOrder.customer_phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Order Items
                    </h4>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.product_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity} × ৳{" "}
                              {item.unit_price.toFixed(2)}
                            </p>
                          </div>
                          <p className="font-semibold text-indigo-600">
                            ৳ {item.subtotal.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-medium">
                          ৳{" "}
                          {selectedOrder.items
                            .reduce(
                              (sum, item) => sum + Number(item.subtotal),
                              0,
                            )
                            .toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Delivery Method</span>
                        <span className="font-medium">
                          {selectedOrder.delivery_method_name}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Payment Method</span>
                        <span className="font-medium">
                          {selectedOrder.payment_method_name}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Total</span>
                        <span className="text-indigo-600">
                          ৳{" "}
                          {selectedOrder.items
                            .reduce(
                              (sum, item) => sum + Number(item.subtotal),
                              0,
                            )
                            .toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Info */}
                  {selectedOrder.tracking_code && (
                    <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Truck className="w-5 h-5 text-indigo-600" />
                          <span className="font-medium text-indigo-900">
                            Tracking Information
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              selectedOrder.tracking_code,
                              `modal-${selectedOrder.id}`,
                            )
                          }
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200 transition"
                        >
                          {copiedTrackingId === `modal-${selectedOrder.id}` ? (
                            <>
                              <Check className="w-3 h-3" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copy Code
                            </>
                          )}
                        </button>
                      </div>

                      <div className="bg-white rounded-lg p-3 border border-indigo-200">
                        <div className="flex items-center gap-3">
                          <Barcode className="w-5 h-5 text-indigo-400" />
                          <code className="font-mono text-sm text-indigo-800 break-all">
                            {selectedOrder.tracking_code}
                          </code>
                        </div>
                      </div>

                      <Link
                        href={`/track-order?orderId=${selectedOrder.tracking_code}`}
                        className="mt-3 inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Track Order <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Review Modal */}
      {reviewModal.isOpen && reviewModal.order && reviewModal.product && (
        <ReviewModal
          isOpen={reviewModal.isOpen}
          onClose={() =>
            setReviewModal({ isOpen: false, order: null, product: null })
          }
          order={reviewModal.order}
          product={reviewModal.product}
          onSubmit={submitReview}
          isSubmitting={submittingReview}
          user={user}
        />
      )}
    </>
  );
}
