"use client";

import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/app/store/useCart";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ShoppingCart,
  Star,
  X,
  ChevronDown,
  ChevronUp,
  Heart,
  Share2,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useProductStore } from "@/app/store/useProductStore";
import { useToastStore } from "@/app/store/useToastStore";
import { ProductCard } from "@/components/ProductCard";
import { useUserStore } from "@/app/store/useUserStore";
import { formatDate } from "@/components/helper";
import { useThemeData } from "@/app/store/useThemeData";
import { CardConfig } from "@/types/ProductCard";
import { EnquiryModal } from "@/components/ProductCard/Enquirymodal";
import ProductActions from "@/components/ProductCard/ProductActionsButton";
import { ImageMagnifier } from "@/components/ui/ImageMagnifier";
import { ShareSheet } from "@/components/ProductCard/QuickViewModal";
import { useWishlist } from "@/app/store/useWishlist";

interface Review {
  id: number;
  order_id: number;
  variant_id: number;
  rating: number;
  title: string;
  comment: string;
  helpful_count: number;
  created_at: string;
  customer: {
    id: number;
    name: string;
    email: string;
  };
  variant: {
    id: number;
    name: string;
    code: string;
    sku: string | null;
  };
  images: {
    id: number;
    image_url: string;
  }[];
}

interface ReviewSummary {
  average_rating: number;
  total_reviews: number;
  rating_breakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user } = useUserStore();
  const { addToCart, isLoading: cartLoading } = useCart();
  const raw = (useThemeData("product_card") ?? {}) as Partial<CardConfig>;

  const requireAuth = (action: string): boolean => {
    if (!user) {
      showToast(`Please login to ${action}`, "error");
      router.push("/account/login");
      return false;
    }
    return true;
  };

  const cfg: CardConfig = {
    layout: raw.layout ?? "minimal",
    show_title: raw.show_title ?? true,
    show_price: raw.show_price ?? true,
    show_rating: raw.show_rating ?? true,
    show_add_to_cart: raw.show_add_to_cart ?? true,
    show_wishlist: raw.show_wishlist ?? true,
    show_compare: raw.show_compare ?? false,
    show_sale_badge: raw.show_sale_badge ?? true,
    show_new_badge: raw.show_new_badge ?? true,
    quick_view: raw.quick_view ?? true,
    show_buy_now: raw.show_buy_now ?? false,
    show_sku: raw.show_sku ?? false,
    show_stock: raw.show_stock ?? true,
    show_category: raw.show_category ?? true,
    image_aspect_ratio:
      (raw.image_aspect_ratio as CardConfig["image_aspect_ratio"]) ??
      "portrait",
    show_out_of_stock_badge: raw.show_out_of_stock_badge ?? true,
    show_discount_badge: raw.show_discount_badge ?? true,
    show_bestseller_badge: raw.show_bestseller_badge ?? true,
    show_featured_badge: raw.show_featured_badge ?? true,
    show_inquiry: raw.show_inquiry ?? true,
    primary_button:
      (raw.primary_button as CardConfig["primary_button"]) ?? "add_to_cart",
    button_position:
      (raw.button_position as CardConfig["button_position"]) ?? "bottom",
    button_size: (raw.button_size as CardConfig["button_size"]) ?? "md",
    button_style: (raw.button_style as CardConfig["button_style"]) ?? "icon",
    add_to_cart_text: raw.add_to_cart_text ?? "Add to Cart",
    buy_now_text: raw.buy_now_text ?? "Buy Now",
    inquiry_text: raw.inquiry_text ?? "Inquiry",
    whatsapp_text: raw.whatsapp_text ?? "Contact to Buy",
    show_contact_whatsapp: raw.show_contact_whatsapp ?? false,
    whatsapp: {
      number: raw.whatsapp?.number ?? "",
      button_color: raw.whatsapp?.button_color ?? "#25D366",
      button_text: raw.whatsapp?.button_text ?? "Contact on WhatsApp",
      message:
        raw.whatsapp?.message ??
        "Hello, I'm interested in {product_name} (SKU: {sku})",
      message_bn: raw.whatsapp?.message_bn ?? "",
      show_seller_number: raw.whatsapp?.show_seller_number ?? false,
      open_in_new_tab: raw.whatsapp?.open_in_new_tab ?? false,
    },
  };

  const { showToast } = useToastStore();
  const { products: allProducts } = useProductStore();
  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [mainImage, setMainImage] = useState<string>("/no-image.png");
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<typeof allProducts>(
    [],
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBottomCart, setShowBottomCart] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [helpfulLoading, setHelpfulLoading] = useState<number | null>(null);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [shareOpen, setShareOpen] = useState(false);
  const {
    toggleWishlist,
    isInWishlist,
    isLoading: wishlistLoading,
  } = useWishlist();

  const productUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/product/${slug}`
      : `/product/${slug}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url: productUrl });
        return;
      } catch {
        setShareOpen(true);
      }
    } else {
      setShareOpen(true);
    }
  };

  const handleWhatsAppClick = () => {
    if (!cfg.whatsapp.number) {
      showToast("WhatsApp number not configured", "error");
      return;
    }

    if (!product) {
      showToast("Product information not available", "error");
      return;
    }

    let message = cfg.whatsapp.message;
    message = message.replace(/{product_name}/g, product.name);
    message = message.replace(
      /{sku}/g,
      selectedVariant?.sku || product.sku || product.code || "",
    );

    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = cfg.whatsapp.number.replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    if (cfg.whatsapp.open_in_new_tab) {
      window.open(whatsappUrl, "_blank");
    } else {
      window.location.href = whatsappUrl;
    }
  };

  const getProductId = () => {
    return selectedVariant?.id || product?.id;
  };

  const getPrimaryVariantId = () => {
    return selectedVariant?.id || product?.id;
  };

  const getImageUrl = () => {
    return mainImage;
  };

  const getSafeStock = () => {
    return selectedVariant?.stock ?? product?.stock ?? 0;
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/product/product/${slug}`);
      if (response.data.success) {
        const data = response.data.data;
        setProduct(data);

        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
          const firstImage =
            data.variants[0].images?.find((img: any) => img.is_primary)?.url ||
            data.variants[0].images?.[0]?.url ||
            "/no-image.png";
          setMainImage(firstImage);
        } else {
          const productImage =
            data.images?.find((img: any) => img.is_primary)?.url ||
            data.images?.[0]?.url ||
            "/no-image.png";
          setMainImage(productImage);
        }
      }
    } catch (err) {
      console.error("Error fetching product:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const handleAddToCart = async () => {
    if (!user) {
      showToast("Please login to add items to cart", "error");
      router.push("/account/login");
      return;
    }

    const price = selectedVariant
      ? parseFloat(product.selling_price) +
        parseFloat(selectedVariant.additional_price || 0)
      : parseFloat(product.selling_price);

    try {
      await addToCart(
        {
          id: getProductId(),
          primary_variant_id: getPrimaryVariantId(),
          name: product.name,
          price: price,
          image: getImageUrl() || "",
          quantity: quantity,
          weight: "0",
        },
        user!.id,
      );
      showToast("Added to cart 🛒", "success");
      setShowBottomCart(true);
    } catch (error) {
      showToast("Failed to add to cart", "error");
    }
  };

  const handleMarkHelpful = async (reviewId: number) => {
    if (!user) {
      showToast("Please login to mark reviews as helpful", "error");
      router.push("/account/login");
      return;
    }

    try {
      setHelpfulLoading(reviewId);
      const response = await api.post(`/product/reviews/${reviewId}/helpful`);

      if (response.data.success) {
        setProduct((prev: any) => ({
          ...prev,
          reviews: prev.reviews.map((review: Review) =>
            review.id === reviewId
              ? { ...review, helpful_count: review.helpful_count + 1 }
              : review,
          ),
        }));
        showToast("Thanks for your feedback!", "success");
      }
    } catch (error: any) {
      console.error("Failed to mark as helpful:", error);
      showToast(
        error?.response?.data?.message || "Failed to mark as helpful",
        "error",
      );
    } finally {
      setHelpfulLoading(null);
    }
  };

  const handleBuyNow = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!cfg.show_buy_now) return;
    if (!requireAuth("buy now")) return;

    const price = selectedVariant
      ? parseFloat(product.selling_price) +
        parseFloat(selectedVariant.additional_price || 0)
      : parseFloat(product.selling_price);

    try {
      await addToCart(
        {
          id: getProductId(),
          primary_variant_id: getPrimaryVariantId(),
          name: product.name,
          price: price,
          image: getImageUrl() || "",
          quantity: quantity,
          weight: "0",
        },
        user!.id,
      );
      router.push("/checkout");
    } catch {
      showToast("Failed to proceed to checkout", "error");
    }
  };

  // Fixed wishlist handler
  const handleToggleWishlist = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!cfg.show_wishlist) return;
    if (!requireAuth("manage wishlist")) return;
    if (!product) return;

    try {
      const productData = {
        id: product.id,
        primary_variant_id: getPrimaryVariantId(),
        name: product.name,
        price: currentPrice,
        image: getImageUrl() || "",
        slug: slug as string,
        stock: getSafeStock(),
      };

      const added = await toggleWishlist(productData, user!.id);
      showToast(
        added ? "Added to wishlist ❤️" : "Removed from wishlist",
        "success",
      );
    } catch (error) {
      showToast("Failed to update wishlist", "error");
    }
  };

  useEffect(() => {
    if (!product || allProducts.length === 0) return;
    const mainCategoryId = product.categories?.[0]?.id;
    if (!mainCategoryId) return;

    const related = allProducts
      .filter(
        (p: any) =>
          p.id !== product.id &&
          p.categories?.some((c: any) => c.id === mainCategoryId),
      )
      .slice(0, 4);
    setRelatedProducts(related);
  }, [product, allProducts]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );

  if (!product)
    return (
      <p className="text-center text-gray-500 mt-20">Product not found.</p>
    );

  const avgRating = product.review_summary?.average_rating || 0;
  const totalReviews = product.review_summary?.total_reviews || 0;
  const ratingBreakdown = product.review_summary?.rating_breakdown || {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  const allImages =
    product.variants
      ?.flatMap((v: any) => v.images || [])
      .filter(
        (img: any, idx: any, arr: any) =>
          arr.findIndex((i: any) => i.url === img.url) === idx,
      ) || [];

  const galleryImages =
    allImages.length > 0 ? allImages : [{ url: "/no-image.png" }];

  const variantStock = selectedVariant?.stock ?? 0;
  const currentPrice = selectedVariant
    ? parseFloat(product.selling_price) +
      parseFloat(selectedVariant.additional_price || 0)
    : parseFloat(product.selling_price);

  const productVariantId = getProductId();

  // Check if product is in wishlist
  const isFavorite = isInWishlist(product.id);

  const sortedReviews = product.reviews
    ? [...product.reviews].sort(
        (a: Review, b: Review) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    : [];

  const displayedReviews = showAllReviews
    ? sortedReviews
    : sortedReviews.slice(0, 3);

  const calculatePercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return (count / totalReviews) * 100;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {shareOpen && (
        <div
          className="fixed inset-0 z-9999 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <ShareSheet
            url={productUrl}
            title={product.name}
            onClose={() => setShareOpen(false)}
          />
        </div>
      )}

      <EnquiryModal
        isOpen={showInquiryModal}
        onClose={() => setShowInquiryModal(false)}
        product={{
          id: getProductId(),
          name: product.name,
          code: selectedVariant?.sku || product.sku || product.code,
          images: mainImage,
          selling_price: currentPrice,
          regular_price: product.regular_price,
        }}
      />

      <div className="max-w-full mx-auto px-4 py-6 lg:py-10 lg:pb-10">
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden w-full aspect-square flex items-center justify-center">
              <ImageMagnifier
                src={mainImage}
                alt={product.name}
                magnifierHeight={200}
                magnifierWidth={200}
                zoomLevel={2.5}
                className="w-full h-full"
                imgClassName="w-full h-full"
              />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {galleryImages.map((img: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setMainImage(img.url)}
                  className={`relative h-20 rounded-md overflow-hidden border-2 transition ${
                    mainImage === img.url
                      ? "border-primary"
                      : "border-gray-200 hover:border-primary"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={`product-img-${index}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 20vw, 10vw"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="space-y-4 flex-1">
              {/* Category */}
              <p className="text-sm text-gray-500 uppercase">
                {product.categories?.map((c: any) => c.name).join(", ")}
              </p>

              {/* Title & Price */}
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-3 leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    ৳ {currentPrice.toFixed(2)}
                  </span>
                  {product.regular_price && (
                    <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                      ৳ {parseFloat(product.regular_price).toFixed(2)}
                    </span>
                  )}
                  {product.regular_price && (
                    <span className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 px-3 py-1 rounded-full text-sm font-semibold">
                      Save{" "}
                      {Math.round(
                        ((parseFloat(product.regular_price) - currentPrice) /
                          parseFloat(product.regular_price)) *
                          100,
                      )}
                      %
                    </span>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 text-yellow-500">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(avgRating)
                        ? "fill-current"
                        : "stroke-current"
                    }`}
                  />
                ))}
                <span className="text-sm text-gray-500 ml-2">
                  {avgRating.toFixed(1)} / 5.0 ({totalReviews}{" "}
                  {totalReviews === 1 ? "review" : "reviews"})
                </span>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 w-fit px-3 py-2 rounded-lg">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-400 font-semibold text-sm">
                  {variantStock > 0 ? `In stock` : "Out of stock"}
                </span>
              </div>

              {/* Variant Selection */}
              {product.variants?.length > 0 && (
                <div className="pt-2 space-y-3">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white">
                    Choose Variant
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v: any) => (
                      <button
                        key={v.id}
                        onClick={() => {
                          setSelectedVariant(v);
                          const firstVariantImage =
                            v.images?.find((img: any) => img.is_primary)?.url ||
                            v.images?.[0]?.url ||
                            mainImage;
                          setMainImage(firstVariantImage);
                        }}
                        className={`px-4 py-2 border-2 rounded-lg text-sm transition-all ${
                          selectedVariant?.id === v.id
                            ? "border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                            : "border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:border-gray-900 dark:hover:border-white"
                        }`}
                      >
                        {v.name || v.code}
                        {v.additional_price && (
                          <span className="ml-1 text-xs">
                            (+৳{parseFloat(v.additional_price).toFixed(2)})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Actions */}
              <div className="flex gap-3 items-center pt-6">
                <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    disabled={variantStock <= 0}
                  >
                    −
                  </button>
                  <span className="px-6 py-2 font-semibold text-gray-900 dark:text-white border-l border-r border-gray-300 dark:border-gray-700">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    disabled={variantStock <= 0 || quantity >= variantStock}
                  >
                    +
                  </button>
                </div>
                {/* Fixed Wishlist Button */}
                {cfg.show_wishlist && (
                  <button
                    onClick={handleToggleWishlist}
                    disabled={wishlistLoading}
                    className={`px-6 py-2 border-2 rounded-lg transition-all flex items-center gap-2 ${
                      isFavorite
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20 shadow-sm"
                        : "border-gray-300 dark:border-gray-700 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Heart
                      className={`w-5 h-5 transition-all ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
                    />
                    <span className="hidden sm:inline">
                      {wishlistLoading
                        ? "Loading..."
                        : isFavorite
                          ? "Remove"
                          : "Wishlist"}
                    </span>
                  </button>
                )}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-300 dark:border-gray-700"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Desktop Buttons */}
              <ProductActions
                cfg={cfg}
                variantStock={variantStock}
                cartLoading={cartLoading}
                handleAddToCart={handleAddToCart}
                handleBuyNow={handleBuyNow}
                handleWhatsAppClick={handleWhatsAppClick}
                setShowInquiryModal={setShowInquiryModal}
              />
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className=" dark:border-gray-800  mb-12">
          <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 mb-6 overflow-x-auto">
            {["description", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 font-semibold capitalize whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab
                    ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Description Tab */}
          {activeTab === "description" && (
            <div className="prose dark:prose-invert max-w-none">
              <div
                className="text-gray-700 dark:text-gray-300 leading-relaxed text-base"
                dangerouslySetInnerHTML={{
                  __html: product.description || "No description available.",
                }}
              />
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" &&
          product.reviews &&
          product.reviews.length > 0 ? (
            <div className="space-y-6">
              {/* Rating Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30 p-6 rounded-xl">
                <div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {avgRating.toFixed(1)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      out of 5
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {totalReviews.toLocaleString()} verified reviews
                  </p>
                </div>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-sm w-12 text-gray-600 dark:text-gray-400">
                        {star} star
                      </span>
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 transition-all"
                          style={{
                            width: `${calculatePercentage(ratingBreakdown[star as keyof typeof ratingBreakdown])}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-6">
                {displayedReviews.map((review: Review) => (
                  <div
                    key={review.id}
                    className="pb-6 border-b border-gray-200 dark:border-gray-800 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-900/30 -mx-4 px-4 py-3 rounded-lg transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {review.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {review.customer.name} •{" "}
                          {formatDate(new Date(review.created_at), "PPP")}
                        </p>
                      </div>
                      {review.variant && (
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 rounded-full">
                          {review.variant.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300 dark:text-gray-700"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                      {review.comment}
                    </p>

                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mb-4">
                        {review.images.map((img) => (
                          <button
                            key={img.id}
                            onClick={() => setSelectedImage(img.image_url)}
                            className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-primary transition"
                          >
                            <Image
                              src={img.image_url}
                              alt="Review image"
                              fill
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => handleMarkHelpful(review.id)}
                      disabled={helpfulLoading === review.id}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition disabled:opacity-50 font-medium"
                    >
                      👍 Helpful ({review.helpful_count})
                    </button>
                  </div>
                ))}
              </div>

              {/* Show More Button */}
              {product.reviews.length > 3 && (
                <div className="text-center pt-6">
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white rounded-lg hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all"
                  >
                    {showAllReviews ? (
                      <>
                        Show Less <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Show All {product.reviews.length} Reviews{" "}
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            "No reviews Found"
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-12 pb-32 lg:pb-0">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p: any) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Cart (Mobile Only) */}
      {showBottomCart && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 p-4 lg:hidden z-50 shadow-2xl">
          <div className="flex gap-3 items-center">
            <button
              onClick={() => setShowBottomCart(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-medium">Added to cart!</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-lg font-bold">
                ৳ {(currentPrice * quantity).toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => router.push("/checkout")}
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition"
            >
              Checkout
            </button>
          </div>
        </div>
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
