"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useProductStore } from "@/app/store/useProductStore";
import ProductCardFour from "../layout/ProductCard/ProductCardFour";

export default function ProductSlider({ config }: { config: any }) {
  const { products, loading, error, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <section className="">
      <h2 className="text-3xl font-bold mb-4">🛍️ {config.title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
        {products.map((product) => (
          <ProductCardFour
            key={product.id}
            id={product.id}
            name={product.name}
            categories={product.categories}
            selling_price={product.selling_price}
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
