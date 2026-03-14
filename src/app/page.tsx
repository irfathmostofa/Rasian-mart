// app/page.tsx (or app/HomePage.tsx)
"use client";

import Hero from "@/components/layout/HeroSection";

import DynamicSectionRenderer, {
  Section,
} from "@/components/layout/DynamicSectionRenderer";
import { useThemeDataWithStatus, useThemeStore } from "./store/useThemeData";

// ─── Section skeleton — mirrors the real section card shape ──────────────────

function SectionSkeleton() {
  return (
    <div className="px-3 py-4 md:px-6 md:py-6 mb-4 md:mb-8">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <div className="w-6 h-6 rounded bg-gray-200 animate-pulse" />
        <div className="h-6 w-40 rounded bg-gray-200 animate-pulse" />
      </div>
      {/* Product card grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl overflow-hidden animate-pulse"
          >
            <div className="bg-gray-100 aspect-square w-full" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="h-7 bg-gray-100 rounded w-full mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { isLoading: themeLoading } = useThemeStore();
  const { data: sections, isLoading: sectionsLoading } =
    useThemeDataWithStatus("sections");

  const isLoading = themeLoading || sectionsLoading;

  // Normalise sections — may arrive as object or array
  const sectionsArray: Section[] = (() => {
    if (!sections) return [];
    if (Array.isArray(sections)) return sections;
    return Object.values(sections as Record<string, Section>);
  })();

  return (
    <div className="space-y-2">
      <Hero />

      {isLoading ? (
        // Show 3 section skeletons while theme data loads
        <div>
          <SectionSkeleton />
          <SectionSkeleton />
          <SectionSkeleton />
        </div>
      ) : (
        <DynamicSectionRenderer sections={sectionsArray} />
      )}
    </div>
  );
}
