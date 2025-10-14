"use client";
import Image from "next/image";

export default function Hero({ config }: { config: any }) {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="flex w-full overflow-x-auto snap-x snap-mandatory">
        {config.images?.map((src: string, i: number) => (
          <div key={i} className="w-full flex-shrink-0 snap-center relative">
            <Image
              src={src}
              alt={`Hero ${i}`}
              width={1920}
              height={600}
              className="w-full h-[600px] object-cover"
            />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <a
          href={config.ctaLink}
          className="bg-black/60 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-black/80 transition"
        >
          {config.ctaText}
        </a>
      </div>
    </div>
  );
}
