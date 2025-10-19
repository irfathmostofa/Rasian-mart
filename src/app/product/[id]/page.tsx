"use client";

import { useParams } from "next/navigation";
import { useCart } from "@/app/store/useCart";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Heart, ShoppingCart, Star } from "lucide-react";
import PreviewImage from "@/components/ui/PreviewImage";
import ImageMagnifier from "@/components/ui/ImageMagnifier";
import api from "@/lib/api";
import { useProductStore } from "@/app/store/useProductStore";
import { PremiumProductCard } from "@/components/layout/ProductCard/PremiumProductCard";
import { useToastStore } from "@/app/store/useToastStore";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { showToast } = useToastStore();
  const { products: allProducts } = useProductStore();

  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<typeof allProducts>(
    []
  );
  const [loading, setLoading] = useState(true);

  // 🟢 Fetch product
  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/product/products/${id}`);
      if (response.data.success) {
        const data = response.data.data;
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
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

  // 🟢 Load related products
  useEffect(() => {
    if (!product || allProducts.length === 0) return;
    const mainCategoryId = product.categories?.[0]?.id;
    if (!mainCategoryId) return;

    const related = allProducts
      .filter(
        (p) =>
          p.id !== product.id &&
          p.categories?.some((c: any) => c.id === mainCategoryId)
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
  const mainImage =
    product.images?.find((img: any) => img.is_primary)?.url ||
    product.images?.[0]?.url ||
    "/no-image.png";
  const variantStock = selectedVariant?.stock ?? 0;
  return (
    <div className="container mx-auto py-10 space-y-16">
      {/* ================= Main Product ================= */}
      <div className="grid md:grid-cols-2 gap-10">
        {/* 🖼️ Product Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-md">
            <ImageMagnifier
              src={product.images[selectedImage]?.url || mainImage}
              alt={product.name}
              magnifierHeight={200}
              magnifierWidth={200}
              zoomLevel={2.5}
            />
          </div>

          {/* Thumbnail Gallery */}
          <div className="grid grid-cols-5 gap-2">
            {product.images.map((img: any, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative h-20 rounded-md overflow-hidden border-2 ${
                  selectedImage === index
                    ? "border-primary"
                    : "border-transparent"
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

        {/* 📦 Product Info */}
        <div className="space-y-3">
          <p className="text-sm text-gray-500 uppercase">
            {product.categories.map((c: any) => c.name).join(", ")}
          </p>
          <h1 className="text-3xl font-bold mt-2">{product.name}</h1>

          {/* ⭐ Rating */}
          <div className="flex items-center gap-1 mt-2 text-yellow-500">
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

          {/* 💲 Price */}
          <div className="flex items-center gap-3">
            <p className="text-2xl font-bold text-primary">
              ৳{" "}
              {selectedVariant
                ? (
                    parseFloat(product.selling_price) +
                    parseFloat(selectedVariant.additional_price || 0)
                  ).toFixed(2)
                : product.selling_price}
            </p>
          </div>

          {/* 🟢 Variant Selection */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Choose Variant</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 border rounded-lg text-sm ${
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
          <p
            className={`mt-2 text-sm font-medium ${
              variantStock > 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {variantStock > 0 ? `In stock: ${variantStock}` : "Out of stock"}
          </p>
          {/* Quantity */}
          <div>
            <h3 className="font-medium mb-2">Quantity</h3>
            <div className="flex items-center gap-3">
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
          </div>

          {/* 🛒 Action Buttons */}
          <div className="flex gap-3 mt-4 flex-wrap">
            {variantStock > 0 && (
              <>
                {" "}
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
                      price:
                        parseFloat(product.selling_price) +
                        parseFloat(selectedVariant.additional_price || 0),
                      image: mainImage,
                      quantity,
                    });
                    showToast("Added to cart 🛒", "success");
                  }}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 flex items-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" /> Add to Cart
                </button>
              </>
            )}

            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="border px-6 py-3 rounded-lg hover:bg-gray-100 flex items-center gap-2"
            >
              <Heart
                className={`w-5 h-5 sm:w-4 sm:h-4 ${
                  isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
                }`}
              />
              {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
            </button>
          </div>
        </div>
      </div>

      {/* 📖 Description */}
      <div>
        <h3 className="font-semibold text-lg mb-2">Description</h3>
        <p className="text-gray-600 leading-relaxed">
          {product.description || "No description available."}
        </p>
      </div>

      {/* ================= Customer Reviews ================= */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>

        {product.reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {product.reviews.map((review: any) => (
              <div
                key={review.id}
                className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition"
              >
                {/* Header */}
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

      {/* ================= Related Products ================= */}
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
    </div>
  );
}
