// components/Hero.tsx
"use client";

import { useSettings } from "@/app/store/useSettings";
import HeroOne from "./HeroSection/HeroOne";
import HeroThree from "./HeroSection/HeroThree";
import HeroTwo from "./HeroSection/HeroTwo";
import HeroCarousel from "./HeroSection/HeroCarousel";

export default function Hero() {
  const { heroStyle } = useSettings();

  switch (heroStyle) {
    case 2:
      return <HeroCarousel />;
    case 3:
      return <HeroThree />;
    default:
      return <HeroOne />;
  }
}
