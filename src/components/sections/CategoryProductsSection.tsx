"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

import { useProductStore } from "@/app/store/useProductStore";
import { PremiumProductCard } from "../layout/ProductCard/PremiumProductCard";

interface CategoryProductsSectionProps {
  config?: {
    category_id?: number;
    title?: string;
    limit?: number;
  };
}

export default function CategoryProductsSection({
  config = {},
}: CategoryProductsSectionProps) {
  const { products, loading, error, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading)
    return <div className="text-center py-10">Loading products...</div>;

  if (products.length === 0)
    return (
      <div className="text-center py-10 text-gray-500">No products found</div>
    );

  return (
    <section className="py-10 container mx-auto">
      <div className="flex items-center justify-between">
        {" "}
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {config.title || "Featured Products"}
        </h2>
        <button>See More</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
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
    </section>
  );
}
