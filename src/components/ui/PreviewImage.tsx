"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ZoomIn } from "lucide-react";

interface PreviewImageProps {
  src: string;
  alt?: string;
  className?: string;
  rounded?: boolean;
}

export default function PreviewImage({
  src,
  alt = "Preview",
  className = "",
  rounded = true,
}: PreviewImageProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          className={`relative cursor-pointer overflow-hidden group ${className}`}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
              rounded ? "rounded-xl" : ""
            }`}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-6 h-6 text-white" />
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none">
        <div className="relative w-full h-[80vh]">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain rounded-xl bg-black/90"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
