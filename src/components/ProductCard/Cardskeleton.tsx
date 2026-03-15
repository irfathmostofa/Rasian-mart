// components/ProductCard/CardSkeleton.tsx
"use client";

/**
 * Shape-accurate skeleton for each card layout.
 * Pass the same `layout` string that comes from your server config.
 */
export function CardSkeleton({
  layout = "minimal",
}: {
  layout?:
    | "simple"
    | "minimal"
    | "detailed"
    | "hover-effect"
    | "modern"
    | string;
}) {
  if (layout === "hover-effect") {
    return (
      <div className="animate-pulse aspect-3/4 rounded-xl bg-gray-200 w-full" />
    );
  }

  if (layout === "simple") {
    return (
      <div className="animate-pulse bg-white border border-gray-100 rounded-lg overflow-hidden flex flex-col">
        <div className="aspect-3/4 bg-gray-200 w-full" />
        <div className="p-2.5 flex flex-col gap-2">
          <div className="h-2.5 w-1/3 rounded-full bg-gray-200" />
          <div className="h-3 w-full rounded-full bg-gray-200" />
          <div className="h-3 w-4/5 rounded-full bg-gray-200" />
          <div className="h-2.5 w-2/5 rounded-full bg-gray-200 mt-1" />
          <div className="h-4 w-1/3 rounded-full bg-gray-200" />
          <div className="flex gap-1.5 mt-1">
            <div className="flex-1 h-8 rounded-md bg-gray-200" />
            <div className="w-8 h-8 rounded-md bg-gray-200" />
            <div className="w-8 h-8 rounded-md bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (layout === "detailed") {
    return (
      <div className="animate-pulse bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col">
        <div className="aspect-3/4 bg-gray-200 w-full" />
        <div className="p-3 flex flex-col gap-2">
          <div className="h-2.5 w-1/4 rounded-full bg-gray-200" />
          <div className="h-3.5 w-full rounded-full bg-gray-200" />
          <div className="h-3.5 w-4/5 rounded-full bg-gray-200" />
          <div className="flex gap-0.5 mt-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-sm bg-gray-200" />
            ))}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="h-5 w-1/3 rounded-full bg-gray-200" />
            <div className="h-3.5 w-1/4 rounded-full bg-gray-200" />
          </div>
          <div className="h-9 w-full rounded-lg bg-gray-200 mt-0.5" />
          <div className="h-8 w-full rounded-lg bg-gray-200" />
          <div className="flex gap-1.5 pt-1 border-t border-gray-100">
            <div className="h-7 w-16 rounded-md bg-gray-200" />
            <div className="h-7 w-14 rounded-md bg-gray-200 ml-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (layout === "modern") {
    return (
      <div className="animate-pulse bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col">
        <div className="h-0.5 w-full bg-gray-200" />
        <div className="aspect-3/4 bg-gray-200 w-full" />
        <div className="p-3 flex flex-col gap-2">
          <div className="h-2.5 w-1/4 rounded-full bg-gray-200" />
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="h-3.5 w-full rounded-full bg-gray-200" />
              <div className="h-3.5 w-3/5 rounded-full bg-gray-200" />
            </div>
            <div className="w-3.5 h-3.5 rounded-sm bg-gray-200 mt-0.5 shrink-0" />
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-sm bg-gray-200" />
            ))}
          </div>
          <div className="h-6 w-2/5 rounded-full bg-gray-200 mt-1" />
          <div className="flex gap-1.5 mt-0.5">
            <div className="flex-1 h-10 rounded-xl bg-gray-200" />
            <div className="w-10 h-10 rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  // minimal (default)
  return (
    <div className="animate-pulse bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col">
      <div className="aspect-3/4 bg-gray-200 w-full" />
      <div className="p-2 sm:p-3 flex flex-col gap-2">
        <div className="h-2.5 w-1/3 rounded-full bg-gray-200" />
        <div className="h-3 w-full rounded-full bg-gray-200" />
        <div className="h-3 w-4/5 rounded-full bg-gray-200" />
        <div className="flex gap-0.5 mt-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-3.5 h-3.5 rounded-sm bg-gray-200" />
          ))}
        </div>
        <div className="h-4 w-1/3 rounded-full bg-gray-200 mt-1" />
        <div className="flex gap-1 mt-1">
          <div className="flex-1 h-8 rounded-lg bg-gray-200" />
          <div className="w-8 h-8 rounded-lg bg-gray-200" />
          <div className="w-8 h-8 rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
