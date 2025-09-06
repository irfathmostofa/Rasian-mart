// components/FloatingSettings.tsx
"use client";

import { useState } from "react";
import { useSettings } from "@/app/store/useSettings";
import { Settings } from "lucide-react";

export default function FloatingSettings() {
  const { headerStyle, setHeaderStyle, heroStyle, setHeroStyle } =
    useSettings();
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
          <div className="flex gap-2">
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
        </div>
      )}
    </>
  );
}
