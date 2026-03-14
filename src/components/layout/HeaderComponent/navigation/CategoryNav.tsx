// components/layout/navigation/CategoryNav.tsx
"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategoryStore } from "@/app/store/useCatrgoryStore";


interface Props {
  mobile?: boolean;
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function DesktopSkeleton() {
  return (
    <nav className="border-t">
      <div className="container mx-auto px-4 py-2">
        <div className="hidden md:flex gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-20 rounded-md" />
          ))}
        </div>
      </div>
    </nav>
  );
}

function MobileSkeleton() {
  return (
    <div className="space-y-2 w-full">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full rounded-md" />
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CategoryNav({ mobile = false }: Props) {
  const { categories, loading } = useCategoryStore();

  // Show skeleton while React Query is fetching
  if (loading && !categories.length) {
    return mobile ? <MobileSkeleton /> : <DesktopSkeleton />;
  }

  // ── Mobile ──────────────────────────────────────────────────────────────────
  if (mobile) {
    return (
      <div className="space-y-1">
        {categories.map((cat) => (
          <details key={cat.id} className="group border-b">
            <summary className="flex justify-between items-center px-2 py-3 cursor-pointer hover:bg-gray-50 transition-colors list-none">
              <Link
                href={`/category/${cat.id}/${cat.slug}`}
                className="flex-1 text-sm font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                {cat.name}
              </Link>
              {!!cat.children?.length && (
                <ChevronDown className="w-4 h-4 shrink-0 transition-transform group-open:rotate-180 text-gray-400" />
              )}
            </summary>

            {!!cat.children?.length && (
              <div className="pl-4 pb-2 space-y-0.5">
                {cat.children.map((sub) => (
                  <details key={sub.id} className="group/sub">
                    <summary className="flex justify-between items-center px-2 py-2 cursor-pointer hover:bg-gray-50 transition-colors list-none">
                      <Link
                        href={`/category/${sub.id}/${sub.slug}`}
                        className="flex-1 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {sub.name}
                      </Link>
                      {!!sub.children?.length && (
                        <ChevronDown className="w-3.5 h-3.5 shrink-0 transition-transform group-open/sub:rotate-180 text-gray-400" />
                      )}
                    </summary>

                    {!!sub.children?.length && (
                      <div className="pl-4 pb-1 space-y-0.5">
                        {sub.children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/category/${child.id}/${child.slug}`}
                            className="block px-2 py-2 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 rounded transition-colors"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </details>
                ))}
              </div>
            )}
          </details>
        ))}
      </div>
    );
  }

  // ── Desktop ─────────────────────────────────────────────────────────────────
  return (
    <nav className="border-t">
      <div className="container mx-auto px-4 py-2 flex items-center">
        <div className="hidden md:flex gap-6 text-sm font-medium">
          {categories.map((cat) => (
            <div key={cat.id} className="relative group">
              <Link
                href={`/category/${cat.id}/${cat.slug}`}
                className="flex items-center gap-1 py-1 hover:text-primary transition-colors whitespace-nowrap"
              >
                {cat.name}
                {!!cat.children?.length && (
                  <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                )}
              </Link>

              {!!cat.children?.length && (
                <div className="absolute left-0 top-full pt-1 z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150">
                  <div className="bg-white shadow-xl border border-gray-100 rounded-xl min-w-[200px] py-1 overflow-hidden">
                    {cat.children.map((sub) => (
                      <div key={sub.id} className="relative group/sub">
                        <Link
                          href={`/category/${sub.id}/${sub.slug}`}
                          className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 hover:text-primary transition-colors text-sm"
                        >
                          {sub.name}
                          {!!sub.children?.length && (
                            <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover/sub:text-primary" />
                          )}
                        </Link>

                        {!!sub.children?.length && (
                          <div className="absolute left-full top-0 pl-1 z-50 invisible opacity-0 group-hover/sub:visible group-hover/sub:opacity-100 transition-all duration-150">
                            <div className="bg-white shadow-xl border border-gray-100 rounded-xl min-w-[200px] py-1 overflow-hidden">
                              {sub.children.map((child) => (
                                <Link
                                  key={child.id}
                                  href={`/category/${child.id}/${child.slug}`}
                                  className="block px-4 py-2.5 text-sm hover:bg-gray-50 hover:text-primary transition-colors"
                                >
                                  {child.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
