"use client";

import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/app/store/useCart";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Heart,
  ShoppingCart,
  Star,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ImageMagnifier from "@/components/ui/ImageMagnifier";
import api from "@/lib/api";
import { useProductStore } from "@/app/store/useProductStore";
import { useToastStore } from "@/app/store/useToastStore";
import { useWishlist } from "@/app/store/useWishlist";
import { ProductCard } from "@/components/ProductCard";
import { useSettings } from "@/app/store/useSettings";
import { useUserStore } from "@/app/store/useUserStore";
import { formatDate } from "@/components/helper";

// Review interface based on your response
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

// Review summary interface
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
  const {
    toggleWishlist,
    isInWishlist,
    isLoading: wishlistLoading,
  } = useWishlist();
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
  const { productCardStyle } = useSettings();
  const [loading, setLoading] = useState(true);
  const [showBottomCart, setShowBottomCart] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [helpfulLoading, setHelpfulLoading] = useState<number | null>(null);

  // Get product ID based on variant or product itself
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

  // Fetch product
  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/product/product/${slug}`);
      console.log(response, "response");
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
          // If no variants, show product image
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

    // Calculate price based on variant or base product
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
      setShowBottomCart(true); // Show bottom cart after adding
    } catch (error) {
      showToast("Failed to add to cart", "error");
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      showToast("Please login to manage wishlist", "error");
      router.push("/account/login");
      return;
    }

    // Calculate price based on variant or base product
    const price = selectedVariant
      ? parseFloat(product.selling_price) +
        parseFloat(selectedVariant.additional_price || 0)
      : parseFloat(product.selling_price);

    try {
      const added = await toggleWishlist(
        {
          id: getProductId(),
          primary_variant_id: getPrimaryVariantId(),
          name:
            product.name +
            (selectedVariant ? ` - ${selectedVariant.name}` : ""),
          price: price || 0,
          image: getImageUrl(),
          stock: getSafeStock(),
        },
        user.id,
      );
      showToast(
        `${added ? "Added to" : "Removed from"} wishlist ❤️`,
        "success",
      );
    } catch (error) {
      showToast("Failed to update wishlist", "error");
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
        // Update the helpful count in the UI
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

  // Load related products
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

  // Gather all images from all variants for thumbnail gallery
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

  // Check if product is in wishlist
  const productVariantId = getProductId();
  const isWishlisted = isInWishlist(productVariantId);

  // Sort and limit reviews
  const sortedReviews = product.reviews
    ? [...product.reviews].sort(
        (a: Review, b: Review) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    : [];

  const displayedReviews = showAllReviews
    ? sortedReviews
    : sortedReviews.slice(0, 3);

  // Calculate rating percentages for progress bars
  const calculatePercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return (count / totalReviews) * 100;
  };

  return (
    <div className="container mx-auto py-10 space-y-16 pb-24">
      {/* ================= Main Product ================= */}
      <div className="grid md:grid-cols-2 gap-10">
        {/* Product Image Gallery */}
        <div className="space-y-4">
          <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-md">
            <ImageMagnifier
              src={mainImage}
              alt={product.name}
              magnifierHeight={200}
              magnifierWidth={200}
              zoomLevel={2.5}
            />
          </div>

          {/* Thumbnail Gallery */}
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
        <div className="space-y-4">
          <p className="text-sm text-gray-500 uppercase">
            {product.categories?.map((c: any) => c.name).join(", ")}
          </p>
          <h1 className="text-3xl font-bold">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 text-yellow-500">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(avgRating) ? "fill-current" : "stroke-current"
                }`}
              />
            ))}
            <span className="text-sm text-gray-500 ml-2">
              {avgRating.toFixed(1)} / 5.0 ({totalReviews}{" "}
              {totalReviews === 1 ? "review" : "reviews"})
            </span>
          </div>

          {/* Price */}
          <div className="text-2xl font-bold text-primary">
            ৳ {currentPrice.toFixed(2)}
            {product.regular_price && (
              <span className="text-lg text-gray-500 line-through ml-2">
                ৳ {parseFloat(product.regular_price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Variant Selection */}
          {product.variants?.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Choose Variant</h3>
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
                    className={`px-4 py-2 border rounded-lg text-sm transition ${
                      selectedVariant?.id === v.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-gray-300 text-gray-700 hover:border-primary"
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

          {/* Stock Status */}
          <p
            className={`text-sm font-medium ${
              variantStock > 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {variantStock > 0 ? `In stock: ${variantStock}` : "Out of stock"}
          </p>

          {/* Quantity Selector */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-1 border rounded-lg hover:bg-gray-100"
              disabled={variantStock <= 0}
            >
              -
            </button>
            <span className="font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3 py-1 border rounded-lg hover:bg-gray-100"
              disabled={variantStock <= 0 || quantity >= variantStock}
            >
              +
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4 flex-wrap">
            {variantStock > 0 && (
              <button
                onClick={handleAddToCart}
                disabled={cartLoading || variantStock <= 0}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartLoading ? "Adding..." : "Add to Cart"}
              </button>
            )}

            <button
              onClick={handleToggleWishlist}
              disabled={wishlistLoading}
              className="border px-6 py-3 rounded-lg hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Heart
                className={`w-5 h-5 ${
                  isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
                }`}
              />
              {wishlistLoading
                ? "Updating..."
                : isWishlisted
                  ? "Wishlisted"
                  : "Add to Wishlist"}
            </button>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="font-semibold text-lg mb-2">Description</h3>
        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
          {product.description || "No description available."}
        </p>
      </div>

      {/* Customer Reviews Section */}
      {product.reviews && product.reviews.length > 0 && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">Customer Reviews</h2>

          {/* Rating Summary with Progress Bars */}
          <div className="grid md:grid-cols-3 gap-8 bg-gray-50 p-6 rounded-xl">
            {/* Average Rating */}
            <div className="text-center md:text-left">
              <div className="text-5xl font-bold text-primary">
                {avgRating.toFixed(1)}
              </div>
              <div className="flex justify-center md:justify-start items-center gap-1 text-yellow-500 my-2">
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
              </div>
              <p className="text-sm text-gray-500">
                Based on {totalReviews}{" "}
                {totalReviews === 1 ? "review" : "reviews"}
              </p>
            </div>

            {/* Rating Breakdown */}
            <div className="md:col-span-2 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm w-12 flex items-center gap-1">
                    {star}{" "}
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{
                        width: `${calculatePercentage(ratingBreakdown[star as keyof typeof ratingBreakdown])}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12">
                    {ratingBreakdown[star as keyof typeof ratingBreakdown]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {displayedReviews.map((review: Review) => (
              <div
                key={review.id}
                className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition"
              >
                {/* Review Header */}
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-semibold text-primary">
                          {review.customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {review.customer.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(new Date(review.created_at), "PPP")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-yellow-500">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "fill-current"
                              : "stroke-current"
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-500 ml-2">
                        {review.rating}.0/5
                      </span>
                    </div>
                  </div>

                  {/* Variant Badge */}
                  {review.variant && (
                    <span className="px-3 py-1 bg-gray-100 text-xs text-gray-600 rounded-full">
                      Variant: {review.variant.name}
                    </span>
                  )}
                </div>

                {/* Review Title */}
                {/* {review.title && (
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {review.title}
                  </h4>
                )} */}

                {/* Review Comment */}
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {review.comment}
                </p>

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {review.images.map((img) => (
                      <button
                        key={img.id}
                        onClick={() => setSelectedImage(img.image_url)}
                        className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 hover:border-primary transition"
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

                {/* Helpful Button */}
                <button
                  onClick={() => handleMarkHelpful(review.id)}
                  disabled={helpfulLoading === review.id}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition disabled:opacity-50"
                >
                  <span>👍</span>
                  <span>Helpful ({review.helpful_count})</span>
                </button>
              </div>
            ))}
          </div>

          {/* Show More/Less Button */}
          {product.reviews.length > 3 && (
            <div className="text-center">
              <button
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="inline-flex items-center gap-2 px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/5 transition"
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
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {relatedProducts.map((p: any) => (
              <ProductCard key={p.id} {...p} cardStyle={productCardStyle} />
            ))}
          </div>
        </div>
      )}

      {/* Fixed Bottom Cart Section */}
      {showBottomCart && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 animate-slide-up">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowBottomCart(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  <span className="font-medium">Added to cart!</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-xl font-bold text-primary">
                    ৳ {(currentPrice * quantity).toFixed(2)}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      router.push("/cart");
                    }}
                    className="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition"
                  >
                    View Cart
                  </button>
                  <button
                    onClick={() => {
                      router.push("/checkout");
                    }}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
