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

interface Review {
  id: number;
  customer_name: string;
  rating: number;
  title: string;
  comment: string;
  helpful: number;
  created_at: string;
  images: { id: number; image_url: string }[];
}

interface Product {
  id: number;
  name: string;
  description: string;
  selling_price: string;
  regular_price: string;
  primary_variant_id: number;
  categories: { id: number; name: string }[];
  images: { url: string; is_primary: boolean }[];
  variants: any[];
  barcodes: any[];
  review_summary: { average_rating: number | null; total_reviews: number };
  reviews: Review[];
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const {
    products: allProducts,
    loading: storeLoading,
    fetchProducts,
  } = useProductStore();
  const [relatedProducts, setRelatedProducts] = useState<typeof allProducts>(
    []
  );
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const loadRelatedProducts = () => {
    if (!product || allProducts.length === 0) return;
    const mainCategoryId = product.categories[0]?.id;
    if (!mainCategoryId) return;

    const related = allProducts
      .filter(
        (p) =>
          p.id !== product.id &&
          p.categories.some((c) => c.id === mainCategoryId)
      )
      .slice(0, 10);
    setRelatedProducts(related);
  };
  useEffect(() => {
    loadRelatedProducts();
  }, [product, allProducts, fetchProducts]);
  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/product/products/${id}`);
      if (response.data.success) {
        setProduct(response.data.data);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    // filterByCategory(allProducts);
  }, [id]);

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

  const avgRating = product.review_summary.average_rating || 0;
  const mainImage =
    product.images.find((img) => img.is_primary)?.url ||
    product.images[0]?.url ||
    "/no-image.png";

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
            {product.images.map((img, index) => (
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
            {product.categories.map((c) => c.name).join(", ")}
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
              {product.review_summary.total_reviews} reviews)
            </span>
          </div>

          {/* 💲 Price */}
          <div className="flex items-center gap-3">
            <p className="text-2xl font-bold text-primary">
              ৳ {product.selling_price}
            </p>
          </div>

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
          <div className="flex gap-3 mt-4">
            <button
              onClick={() =>
                addToCart({
                  id: product.id,
                  primary_variant_id: product.primary_variant_id,
                  name: product.name,
                  price: parseFloat(product.selling_price),
                  image: mainImage,
                  quantity,
                })
              }
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </button>
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="border px-6 py-3 rounded-lg hover:bg-gray-100 flex items-center gap-2"
            >
              <Heart
                className={`w-5 h-5 sm:w-4 sm:h-4 ${
                  isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
                }`}
              />{" "}
              Add to Wishlist
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

      {/* ================= Product Reviews ================= */}
      <div>
        <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>

        {product.reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          <div className="space-y-6">
            {product.reviews.map((review) => (
              <div
                key={review.id}
                className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
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
                      <span className="text-xs text-gray-500 ml-1">
                        {review.rating}/5
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {review.created_at}
                  </span>
                </div>

                {/* Title + Comment */}
                <h4 className="font-medium text-gray-900 mb-1">
                  {review.title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {review.comment}
                </p>

                {/* Review Images */}
                {review.images.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {review.images.map((img) => (
                      <div
                        key={img.id}
                        className="w-20 h-20 rounded-md overflow-hidden border"
                      >
                        <PreviewImage
                          src={img.image_url}
                          alt="review-img"
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Helpful */}
                <div className="mt-3">
                  <button className="text-xs text-gray-500 hover:text-primary transition">
                    👍 Helpful ({review.helpful})
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4">
            {relatedProducts.map((product) => (
              <PremiumProductCard
                key={product.id}
                id={product.id}
                primary_variant_id={product.primary_variant_id}
                name={product.name}
                categories={product.categories}
                selling_price={product.selling_price}
                regular_price={product.regular_price}
                cost_price={product.cost_price}
                images={product.images}
                badge={product.badge}
                total_stock={product.total_stock}
                rating={product.rating}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
