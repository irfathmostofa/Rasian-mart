// app/components/ProductCard/index.tsx
"use client";

import { MinimalProductCard } from "./MinimalProductCard";
import { ModernProductCard } from "./ModernProductCard";
import { ProductCardProps } from "@/types/ProductCard";
import { useSettings } from "@/app/store/useSettings";
import { PremiumProductCard } from "./PremiumProductCard";
import { CompactProductCard } from "./CompactProductCard";
import { GridProductCard } from "./GridProductCard";
import { DenseProductCard } from "./Denseproductcard";
import { ElegantProductCard } from "./ElegantProductCard";
import { HorizontalProductCard } from "./Horizontalproductcard";
import { LuxuryProductCard } from "./Luxuryproductcard";
import { VibrantProductCard } from "./Vibrantproductcard";
import { useThemeData } from "@/app/store/useThemeData";

export function ProductCard(props: ProductCardProps & { cardStyle?: number }) {
  const { productCardStyle } = useSettings();
  const style = props.cardStyle || productCardStyle || 1;

  switch (style) {
    case 4:
      return <CompactProductCard {...props} />;
    case 5:
      return <GridProductCard {...props} />;
    case 2:
      return <MinimalProductCard {...props} />;
    case 3:
      return <ModernProductCard {...props} />;
    case 6:
      return <DenseProductCard {...props} />;
    case 7:
      return <ElegantProductCard {...props} />;
    case 8:
      return <HorizontalProductCard {...props} />;
    case 9:
      return <LuxuryProductCard {...props} />;
    case 10:
      return <VibrantProductCard {...props} />;
    default:
      return <PremiumProductCard {...props} />;
  }
}

export {
  PremiumProductCard,
  MinimalProductCard,
  ModernProductCard,
  GridProductCard,
  CompactProductCard,
};
