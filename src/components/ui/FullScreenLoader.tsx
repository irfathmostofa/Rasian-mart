// components/ui/FullScreenLoader.tsx
"use client";

import { Loader2 } from "lucide-react";

export default function FullScreenLoader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
      <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
      <p className="text-gray-600 font-medium">Loading your experience...</p>
    </div>
  );
}
