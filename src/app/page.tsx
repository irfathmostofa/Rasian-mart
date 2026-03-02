"use client";

import { useEffect } from "react";
import Hero from "@/components/layout/HeroSection";
import { useProductStore } from "@/app/store/useProductStore";
import { useSettings } from "./store/useSettings";
import { useThemeData } from "./store/useThemeData";
import DynamicSectionRenderer from "@/components/layout/DynamicSectionRenderer";

export default function HomePage() {
  const {
    products,
    loading,
    error,
    hasNextPage,
    fetchProducts,
    loadMore,
    currentPage,
  } = useProductStore();
  const { productCardStyle } = useSettings();
  const sections = (useThemeData("sections") || {}) as any;
  useEffect(() => {
    if (products.length === 0) {
      fetchProducts(1, 12);
    }
  }, [products.length]);

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <Hero />

      <DynamicSectionRenderer sections={sections} />
    </div>
  );
}
