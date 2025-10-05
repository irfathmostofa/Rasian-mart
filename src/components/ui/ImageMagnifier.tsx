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
  magnifierHeight = 150,
  magnifierWidth = 150,
  zoomLevel = 2.5,
}: ImageMagnifierProps) {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setShowMagnifier(true);
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;

    const elem = imgRef.current;
    const { top, left, width, height } = elem.getBoundingClientRect();

    // Calculate cursor position relative to the image
    const x = e.clientX - left;
    const y = e.clientY - top;

    // Calculate magnifier position (centered on cursor)
    const magnifierX = e.clientX - magnifierWidth / 2;
    const magnifierY = e.clientY - magnifierHeight / 2;

    // Calculate the background position for the zoomed image
    const bgPosX = (x / width) * 100;
    const bgPosY = (y / height) * 100;

    setCursorPosition({ x: bgPosX, y: bgPosY });
    setMagnifierPosition({ x: magnifierX, y: magnifierY });
  };

  return (
    <>
      <div
        ref={imgRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        className="relative w-full h-96 rounded-xl overflow-hidden shadow-md cursor-crosshair"
      >
        <Image src={src} alt={alt} fill className="object-cover" priority />
      </div>

      {/* Magnifier Lens */}
      {showMagnifier && (
        <div
          style={{
            position: "fixed",
            left: `${magnifierPosition.x}px`,
            top: `${magnifierPosition.y}px`,
            width: `${magnifierWidth}px`,
            height: `${magnifierHeight}px`,
            border: "3px solid #fff",
            borderRadius: "50%",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            pointerEvents: "none",
            zIndex: 1000,
            backgroundImage: `url('${src}')`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${zoomLevel * 200}%`,
            backgroundPosition: `${cursorPosition.x}% ${cursorPosition.y}%`,
          }}
        />
      )}
    </>
  );
}
