"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useProductStore } from "@/app/store/useProductStore";
import { useEffect } from "react";

import { ProductCard } from "../ProductCard";

interface Product {
  id: number;
  code: string;
  name: string;
  description: string;
  cost_price: number;
  selling_price: number;
  status: string;
  uom_name: string;
  categories: Array<{
    id: number;
    name: string;
    slug?: string;
    code: string;
    image: string | null;
    is_primary: boolean;
  }>;
  images: Array<{
    id: number;
    url: string;
    alt_text: string;
    is_primary: boolean;
  }> | null;
  total_stock: number;
  badge: string | null;
  rating: number | null;
  review_count: number | null;
  total_sales: number;
}

export default function ProductCarousel() {
  const { products, loading, fetchProducts } = useProductStore();

  // Fetch once on mount
  useEffect(() => {
    if (products.length === 0) fetchProducts();
  }, [fetchProducts, products.length]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }


  return (
    <div className="relative w-full mx-auto py-6">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 2000,
          }),
        ]}
        className="relative"
      >
        {/* Hide arrows on mobile, show on md+ */}
        <div className="hidden md:flex absolute top-1/2 left-0 -translate-y-1/2 z-10">
          <CarouselPrevious />
        </div>
        <div className="hidden md:flex absolute top-1/2 right-0 -translate-y-1/2 z-10">
          <CarouselNext />
        </div>

        <CarouselContent className="flex flex-nowrap mb-2">
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="basis-1/2 sm:basis-1/3 md:basis-1/4"
            >
              <ProductCard
                key={product.id}
                {...product}
         
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
