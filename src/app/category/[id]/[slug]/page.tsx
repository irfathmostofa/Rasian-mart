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
  const { id, slug } = useParams(); // dynamic category
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("new");

  const sortProducts = (products: Product[], sortBy: string) => {
    const sorted = [...products];
    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "new":
        sorted.sort((a, b) => b.id - a.id);
        break;
      case "old":
        sorted.sort((a, b) => a.id - b.id);
        break;
      default:
        break;
    }
    return sorted;
  };

  useEffect(() => {
    setLoading(true);

    setTimeout(() => {
      let filtered = demoProducts.filter(
        (p) => p.category.toLowerCase() === String(slug).toLowerCase()
      );

      filtered = sortProducts(filtered, sortBy);

      setProducts(filtered);
      setLoading(false);
    }, 800);
  }, [slug, sortBy]);

  return (
    <div className="container mx-auto px-1 py-1">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold capitalize">
          {slug} Products
        </h1>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="new">Newest</option>
          <option value="old">Oldest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500">No products found</p>
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
