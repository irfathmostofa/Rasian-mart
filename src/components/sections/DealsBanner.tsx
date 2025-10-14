"use client";
import Image from "next/image";
import Link from "next/link";

export default function DealsBanner({ config }: { config: any }) {
  return (
    <section className="py-8 container mx-auto text-center relative">
      <Link href={config.link || "#"} className="block relative">
        <Image
          src={config.image}
          alt={config.title}
          width={1200}
          height={300}
          className="w-full h-[300px] object-cover rounded-xl"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h2 className="text-3xl font-bold text-white">{config.title}</h2>
        </div>
      </Link>
    </section>
  );
}
