"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader } from "lucide-react";
import { useProductStore } from "@/app/store/useProductStore";
import { PremiumProductCard } from "@/components/layout/ProductCard/PremiumProductCard";

export default function CategoryPage() {
  const { slug } = useParams(); // dynamic category slug
  const {
    products: allProducts,
    loading: storeLoading,
    fetchProducts,
  } = useProductStore();
  const [products, setProducts] = useState<typeof allProducts>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("new");

  // Filter by category
  const filterByCategory = (products: typeof allProducts, slug: string) => {
    return products.filter((p) =>
      p.categories?.some((c) => c.name.toLowerCase() === slug.toLowerCase())
    );
  };

  // Sort products
  const sortProducts = (products: typeof allProducts, sortBy: string) => {
    const sorted = [...products];
    switch (sortBy) {
      case "price-asc":
        sorted.sort(
          (a, b) => Number(a.selling_price) - Number(b.selling_price)
        );
        break;
      case "price-desc":
        sorted.sort(
          (a, b) => Number(b.selling_price) - Number(a.selling_price)
        );
        break;
      case "new":
        sorted.sort((a, b) => b.id - a.id);
        break;
      case "old":
        sorted.sort((a, b) => a.id - b.id);
        break;
    }
    return sorted;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (allProducts.length === 0) await fetchProducts();

      const filtered = filterByCategory(allProducts, String(slug));
      const sorted = sortProducts(filtered, sortBy);

      setProducts(sorted);
      setLoading(false);
    };

    load();
  }, [slug, sortBy, allProducts, fetchProducts]);

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

      {loading || storeLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500">No products found</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
          {products.map((product) => (
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
      )}
    </div>
  );
}
