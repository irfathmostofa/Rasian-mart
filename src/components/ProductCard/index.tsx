// app/components/ProductCard/index.tsx
"use client";

import { MinimalProductCard } from "./MinimalProductCard";
import { ProductCardProps } from "@/types/ProductCard";

export function ProductCard(props: ProductCardProps & { cardStyle?: number }) {
  return <MinimalProductCard {...props} />; // Added return statement
}

export { MinimalProductCard };
