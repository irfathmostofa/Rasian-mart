"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { useCategoryStore } from "@/app/store/useCatrgoryStore";

interface Props {
  mobile?: boolean;
}

export default function CategoryNav({ mobile = false }: Props) {
  const { categories, fetchCategories, loading, hydrated } = useCategoryStore();
  console.log(categories);
  // Fetch categories only after hydration
  useEffect(() => {
    if (!hydrated) return;
    fetchCategories();
  }, [hydrated, fetchCategories]);

  if (!hydrated || loading) {
    return <p className="p-4 text-center">Loading categories...</p>;
  }

  if (mobile) {
    // Mobile: collapsible <details> menu
    return (
      <div className="space-y-1">
        {categories?.map((cat) => (
          <details key={cat.id} className="group border-b">
            <summary className="flex justify-between items-center px-2 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
              {cat.name}
              {cat.children?.length ? (
                <ChevronDown
                  className="transition-transform group-open:rotate-180"
                  size={16}
                />
              ) : null}
            </summary>

            {cat?.children?.length ? (
              <div className="pl-4 pb-2 space-y-1">
                {cat?.children?.map((sub) => (
                  <details key={sub.id} className="group">
                    <summary className="flex justify-between items-center px-2 py-2 cursor-pointer hover:bg-gray-50 transition-colors">
                      {sub.name}
                      {sub.children?.length ? (
                        <ChevronDown
                          className="transition-transform group-open:rotate-180"
                          size={14}
                        />
                      ) : null}
                    </summary>

                    {sub.children?.length ? (
                      <div className="pl-4 pb-2 space-y-1">
                        {sub?.children?.map((child) => (
                          <Link
                            key={child.id}
                            href={`/category/${child.id}/${child.slug}`}
                            className="block px-2 py-2 hover:bg-gray-100 transition-colors"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </details>
                ))}
              </div>
            ) : null}
          </details>
        ))}
      </div>
    );
  }

  // Desktop: hover dropdown menu
  return (
    <nav className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="hidden md:flex gap-6 text-sm font-medium relative">
          {categories?.map((cat) => (
            <div key={cat.id} className="relative group">
              <span className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors">
                <Link href={`/category/${cat.id}/${cat.slug}`}>{cat.name}</Link>

                {cat.children?.length ? (
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                ) : null}
              </span>

              {cat.children?.length ? (
                <div className="absolute left-0 top-full bg-white shadow-lg border rounded-md mt-2 min-w-[200px] z-50 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200">
                  {cat.children.map((sub) => (
                    <div key={sub.id} className="relative group/sub">
                      <Link
                        href={`/category/${sub.id}/${sub.slug}`}
                        className="block px-4 py-2 hover:bg-gray-100 transition-colors"
                      >
                        {sub.name}
                      </Link>

                      {sub.children?.length ? (
                        <ChevronRight className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 group-hover/sub:text-primary" />
                      ) : null}

                      {sub.children?.length ? (
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
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
