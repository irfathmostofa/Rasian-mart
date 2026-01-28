// components/FloatingSettings.tsx
"use client";

import { useState } from "react";
import { useSettings } from "@/app/store/useSettings";
import { Grid3X3, Settings } from "lucide-react";

export default function FloatingSettings() {
  const {
    headerStyle,
    setHeaderStyle,
    heroStyle,
    setHeroStyle,
    productCardStyle,
    setProductCardStyle,
  } = useSettings();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ⚙️ Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 z-50"
      >
        <Settings className="w-5 h-5 animate-spin-slow" />
      </button>

      {/* ⚙️ Settings Panel */}
      {open && (
        <div className="fixed bottom-20 right-6 w-64 bg-white shadow-xl rounded-xl border p-4 z-50">
          <h3 className="text-sm font-semibold mb-2">Choose Header Style</h3>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => setHeaderStyle(num)}
                className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                  headerStyle === num
                    ? "bg-primary text-white border-primary"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <h3 className="text-sm font-semibold mb-2">Choose Hero Style</h3>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => setHeroStyle(num)}
                className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                  heroStyle === num
                    ? "bg-primary text-white border-primary"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <h3 className="text-sm font-semibold mb-2">Product Card Stylee</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 1, label: "Premium" },
              { id: 2, label: "Minimal" },
              { id: 3, label: "Modern" },
              { id: 4, label: "Compact" },
              { id: 5, label: "Grid" },
              { id: 6, label: "Dense" },
              { id: 7, label: "Elegant" },
              { id: 8, label: "Horizontal" },
              { id: 9, label: "Luxury" },
              { id: 10, label: "Vibrant" },
            ].map((style) => (
              <button
                key={style.id}
                onClick={() => setProductCardStyle(style.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 ${
                  productCardStyle === style.id
                    ? "bg-primary text-white border-primary"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span className="text-xs font-medium">{style.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
