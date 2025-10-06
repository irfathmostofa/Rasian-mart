"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Loader } from "lucide-react";
import { demoProducts } from "@/components/dummyData/demoProducts";
import ProductCardFour from "@/components/layout/ProductCard/ProductCardFour";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  stock: number;
  rating: number;
  image: string;
  badge?: string;
}

export default function CategoryPage() {
  const { slug } = useParams(); // 🏷️ dynamic category slug
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch products (dummy fetch here, replace with API later)
  useEffect(() => {
    setLoading(true);

    // Simulated fetch (replace with real API call)
    setTimeout(() => {
      // Filter by category slug
      const filtered = demoProducts.filter(
        (p) => p.category.toLowerCase() === String(slug).toLowerCase()
      );

      setProducts(filtered);
      setLoading(false);
    }, 800);
  }, [slug]);

  return (
    <div className="container mx-auto px-1 py-1">
      {/* Page Title */}
      <h1 className="text-2xl sm:text-3xl font-bold capitalize mb-6">
        {slug} Products
      </h1>

      {/* Loader */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500">No products found 😔</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
          {products.map((product) => (
            <ProductCardFour
              id={product.id}
              key={product.id}
              name={product.name}
              category={product.category}
              price={product.price}
              oldPrice={product.oldPrice}
              discount={product.discount}
              image={product.image}
              badge={product.badge}
              stock={product.stock}
              rating={product.rating}
            />
          ))}
        </div>
      )}
    </div>
  );
}
