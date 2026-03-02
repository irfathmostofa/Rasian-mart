"use client";

import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/app/store/useCart";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Heart, ShoppingCart, Star, X } from "lucide-react";
import ImageMagnifier from "@/components/ui/ImageMagnifier";
import api from "@/lib/api";
import { useProductStore } from "@/app/store/useProductStore";
import { useToastStore } from "@/app/store/useToastStore";
import { useWishlist } from "@/app/store/useWishlist";
import { ProductCard } from "@/components/ProductCard";
import { useSettings } from "@/app/store/useSettings";
import { useUserStore } from "@/app/store/useUserStore";

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
  const { productCardStyle } = useSettings();
  const [loading, setLoading] = useState(true);
  const [showBottomCart, setShowBottomCart] = useState(false);

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
      console.log(response);
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

  // Check if current product is in wishlist
  useEffect(() => {
    if (product) {
      const productVariantId = getProductId();
      // You might want to sync this with your wishlist store
      // For now, we'll rely on the store's isInWishlist function
    }
  }, [product, selectedVariant]);

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
              {avgRating.toFixed(1)} / 5.0 (
              {product.review_summary?.total_reviews || 0} reviews)
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

      {/* Customer Reviews */}
      {product.reviews?.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
          <div className="space-y-4">
            {product.reviews.map((review: any) => (
              <div
                key={review.id}
                className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {review.customer_name}
                    </p>
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
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {review.created_at}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">
                  {review.title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
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
    </div>
  );
}
