// app/page.tsx
"use client";

import { Suspense } from "react";
import Hero from "@/components/layout/HeroSection";

import DynamicSectionRenderer, {
  Section,
} from "@/components/layout/DynamicSectionRenderer";
import { useThemeDataWithStatus, useThemeStore } from "./store/useThemeData";
import HeroSkeleton from "@/components/layout/Skeleton/HeroSkeleton";
import LoadingSection from "@/components/layout/Skeleton/LoadingSection";

export default function HomePage() {
  const { isLoading: themeLoading } = useThemeStore();
  const { data: sections, isLoading: sectionsLoading } =
    useThemeDataWithStatus("sections");

  const isLoading = themeLoading || sectionsLoading;

  const sectionsArray: Section[] = (() => {
    if (!sections) return [];
    if (Array.isArray(sections)) return sections;
    return Object.values(sections as Record<string, Section>);
  })();

  return (
    <div className="space-y-2">
      <Suspense fallback={<HeroSkeleton />}>
        <Hero />
      </Suspense>

      {isLoading ? (
        <LoadingSection />
      ) : (
        <DynamicSectionRenderer sections={sectionsArray} />
      )}
    </div>
  );
}
