"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategoryStore } from "@/app/store/useCatrgoryStore";

interface Props {
  mobile?: boolean;
}

export default function CategoryNav({ mobile = false }: Props) {
  const { categories, fetchCategories, loading, hydrated } = useCategoryStore();
  const [mounted, setMounted] = useState(false);
  // Prevent SSR mismatch flicker
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch categories after hydration
  useEffect(() => {
    if (hydrated) fetchCategories();
  }, [hydrated, fetchCategories]);

  // Wait until client hydration
  if (!mounted || !hydrated) {
    return (
      <nav className=" border-t">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="hidden md:flex gap-6 text-sm font-medium relative">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-20 rounded-md" />
            ))}
          </div>

          {mobile && (
            <div className="space-y-2 w-full">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-md" />
              ))}
            </div>
          )}
        </div>
      </nav>
    );
  }

  // 📱 Mobile View
  if (mobile) {
    return (
      <div className="space-y-1">
        {categories?.map((cat) => (
          <details key={cat.id} className="group border-b">
            <summary className="flex justify-between items-center px-2 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
              <Link href={`/category/${cat.id}/${cat.slug}`} className="flex-1">
                {cat.name}
              </Link>
              {cat.children && cat.children.length > 0 && (
                <ChevronDown
                  className="transition-transform group-open:rotate-180"
                  size={16}
                />
              )}
            </summary>

            {cat.children && cat.children.length > 0 && (
              <div className="pl-4 pb-2 space-y-1">
                {cat.children.map((sub) => (
                  <details key={sub.id} className="group/sub-detail">
                    <summary className="flex justify-between items-center px-2 py-2 cursor-pointer hover:bg-gray-50 transition-colors">
                      <Link
                        href={`/category/${sub.id}/${sub.slug}`}
                        className="flex-1"
                      >
                        {sub.name}
                      </Link>
                      {sub.children && sub.children.length > 0 && (
                        <ChevronDown
                          className="transition-transform group-open/sub-detail:rotate-180"
                          size={14}
                        />
                      )}
                    </summary>

                    {sub.children && sub.children.length > 0 && (
                      <div className="pl-4 pb-2 space-y-1">
                        {sub.children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/category/${child.id}/${child.slug}`}
                            className="block px-2 py-2 hover:bg-gray-100 transition-colors"
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

  // 💻 Desktop View
  return (
    <nav className=" border-t">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="hidden md:flex gap-6 text-sm font-medium relative">
          {categories?.map((cat) => (
            <div key={cat.id} className="relative group">
              <span className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors">
                <Link href={`/category/${cat.id}/${cat.slug}`}>{cat.name}</Link>
                {cat.children && cat.children.length > 0 && (
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                )}
              </span>

              {cat.children && cat.children.length > 0 && (
                <div className="absolute left-0 top-full bg-white shadow-lg border rounded-md mt-2 min-w-[200px] z-50 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200">
                  {cat.children.map((sub) => (
                    <div key={sub.id} className="relative group/sub">
                      <Link
                        href={`/category/${sub.id}/${sub.slug}`}
                        className="block px-4 py-2 hover:bg-gray-100 transition-colors"
                      >
                        {sub.name}
                      </Link>
                      {sub.children && sub.children.length > 0 && (
                        <>
                          <ChevronRight className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 group-hover/sub:text-primary" />
                          <div className="absolute left-full top-0 bg-white shadow-lg border rounded-md min-w-[200px] hidden group-hover/sub:block">
                            {sub.children.map((child) => (
                              <Link
                                key={child.id}
                                href={`/category/${child.id}/${child.slug}`}
                                className="block px-4 py-2 hover:bg-gray-100 transition-colors"
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
