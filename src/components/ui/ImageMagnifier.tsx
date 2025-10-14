"use client";

import { useState, useRef, MouseEvent } from "react";
import Image from "next/image";

interface ImageMagnifierProps {
  src: string;
  alt: string;
  magnifierHeight?: number;
  magnifierWidth?: number;
  zoomLevel?: number;
}

export default function ImageMagnifier({
  src,
  alt,
  magnifierHeight = 120,
  magnifierWidth = 120,
  zoomLevel = 2,
}: ImageMagnifierProps) {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  const [imgPos, setImgPos] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;

    const elem = imgRef.current;
    const { top, left, width, height } = elem.getBoundingClientRect();

    const x = e.clientX - left;
    const y = e.clientY - top;

    // Keep magnifier within bounds
    const offsetX = Math.max(
      0,
      Math.min(x - magnifierWidth / 2, width - magnifierWidth)
    );
    const offsetY = Math.max(
      0,
      Math.min(y - magnifierHeight / 2, height - magnifierHeight)
    );

    setMagnifierPos({ x: offsetX, y: offsetY });

    // Calculate image position for zoom
    const bgX = (x / width) * 100;
    const bgY = (y / height) * 100;
    setImgPos({ x: bgX, y: bgY });
  };

  return (
    <div
      ref={imgRef}
      onMouseEnter={() => setShowMagnifier(true)}
      onMouseLeave={() => setShowMagnifier(false)}
      onMouseMove={handleMouseMove}
      className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in"
    >
      <Image src={src} alt={alt} fill className="object-contain" priority />

      {/* Magnifier Lens */}
      {showMagnifier && (
        <div
          style={{
            position: "absolute",
            left: `${magnifierPos.x}px`,
            top: `${magnifierPos.y}px`,
            width: `${magnifierWidth}px`,
            height: `${magnifierHeight}px`,
            border: "2px solid #999",
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            borderRadius: "4px",
            pointerEvents: "none",
            backgroundImage: `url('${src}')`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `calc(100% * ${zoomLevel}) calc(100% * ${zoomLevel})`,
            backgroundPosition: `calc(${imgPos.x}% - ${
              magnifierWidth / 2
            }px) calc(${imgPos.y}% - ${magnifierHeight / 2}px)`,
          }}
        />
      )}
    </div>
  );
}
