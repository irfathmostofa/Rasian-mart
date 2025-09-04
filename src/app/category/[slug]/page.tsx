"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Loader } from "lucide-react";
import ProductCardThree from "@/components/layout/ProductCard3";
import { demoProducts } from "@/components/dummyData/demoProducts";

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
    <div className="container mx-auto px-4 py-8">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCardThree
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
