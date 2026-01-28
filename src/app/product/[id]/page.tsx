"use client";

import { useParams } from "next/navigation";
import { useCart } from "@/app/store/useCart";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Heart, ShoppingCart, Star, X } from "lucide-react";
import ImageMagnifier from "@/components/ui/ImageMagnifier";
import api from "@/lib/api";
import { useProductStore } from "@/app/store/useProductStore";
import { PremiumProductCard } from "@/components/ProductCard/PremiumProductCard";
import { useToastStore } from "@/app/store/useToastStore";
import { useWishlist } from "@/app/store/useWishlist";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { showToast } = useToastStore();
  const { products: allProducts } = useProductStore();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [mainImage, setMainImage] = useState<string>("/no-image.png");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<typeof allProducts>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [showBottomCart, setShowBottomCart] = useState(false);

  // Fetch product
  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/product/products/${id}`);
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
    fetchProduct();
  }, [id]);

  // Load related products
  useEffect(() => {
    if (!product || allProducts.length === 0) return;
    const mainCategoryId = product.categories?.[0]?.id;
    if (!mainCategoryId) return;

    const related = allProducts
      .filter(
        (p) =>
          p.id !== product.id &&
          p.categories?.some((c: any) => c.id === mainCategoryId),
      )
      .slice(0, 10);
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

  return (
    <div className="container mx-auto py-10 space-y-16 pb-24">
      {" "}
      {/* Added pb-24 for bottom spacing */}
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
            >
              -
            </button>
            <span className="font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3 py-1 border rounded-lg hover:bg-gray-100"
            >
              +
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4 flex-wrap">
            {variantStock > 0 && (
              <button
                onClick={() => {
                  if (!selectedVariant) {
                    showToast("Please select a variant first", "error");
                    return;
                  }
                  addToCart({
                    id: product.id,
                    primary_variant_id: selectedVariant.id,
                    name: `${product.name} - ${selectedVariant.name || ""}`,
                    price: currentPrice,
                    image: mainImage,
                    quantity,
                  });
                  showToast("Added to cart 🛒", "success");
                  setShowBottomCart(true);
                }}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
            )}

            <button
              onClick={() => {
                const willBeWishlisted = !isWishlisted;

                toggleWishlist({
                  id: product.id,
                  primary_variant_id: selectedVariant?.id,
                  name: `${product.name} - ${selectedVariant?.name || ""}`,
                  price: currentPrice,
                  image: mainImage,
                  stock: 0,
                });

                setIsWishlisted(willBeWishlisted);
                showToast(
                  `${willBeWishlisted ? "Added" : "Removed"} to wishlist ❤️`,
                  "success",
                );
              }}
              className="border px-6 py-3 rounded-lg hover:bg-gray-100 flex items-center gap-2"
            >
              <Heart
                className={`w-5 h-5 ${
                  isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
                }`}
              />
              {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
            </button>
          </div>
        </div>
      </div>
      {/* Description */}
      <div>
        <h3 className="font-semibold text-lg mb-2">Description</h3>
        <p className="text-gray-600 leading-relaxed">
          {product.description || "No description available."}
        </p>
      </div>
      {/* Customer Reviews */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
        {product.reviews?.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
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
        )}
      </div>
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5">
            {relatedProducts.map((p) => (
              <PremiumProductCard key={p.id} {...p} />
            ))}
          </div>
        </div>
      )}
      {/* Fixed Bottom Cart Section */}
      {showBottomCart && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
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
                  {/* <span className="font-medium">Cart ({cartItemCount})</span> */}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-xl font-bold text-primary">
                    {/* ৳ {cartTotal.toFixed(2)} */}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      // Navigate to cart page
                      window.location.href = "/cart";
                    }}
                    className="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition"
                  >
                    View Cart
                  </button>
                  <button
                    onClick={() => {
                      // Navigate to checkout page
                      window.location.href = "/checkout";
                    }}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                  >
                    Buy Now
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
