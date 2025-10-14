"use client";
import { useCategoryStore } from "@/app/store/useCatrgoryStore";
import Link from "next/link";

export default function CategorySection({ config }: { config: any }) {
    const { categories, fetchCategories, loading, hydrated } = useCategoryStore();
  return (
    <section className="py-10 container mx-auto text-center">
      <h2 className="text-2xl font-bold mb-6">{config.title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {config.categories?.map((cat: string, i: number) => (
          <Link
            key={i}
            href={`/category/${cat}`}
            className="p-6 border rounded-lg hover:bg-gray-100 transition"
          >
            {cat.toUpperCase()}
          </Link>
        ))}
      </div>
    </section>
  );
}
