"use client";

import Image from "next/image";
import { useState, useRef, useCallback } from "react";

interface ImageMagnifierProps {
  src: string;
  alt: string;
  magnifierHeight?: number;
  magnifierWidth?: number;
  zoomLevel?: number;
  className?: string;
  imgClassName?: string;
}

export function ImageMagnifier({
  src,
  alt,
  magnifierHeight = 200,
  magnifierWidth = 200,
  zoomLevel = 2.5,
  className = "",
  imgClassName = "",
}: ImageMagnifierProps) {
  const [show, setShow] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [bgOffset, setBgOffset] = useState({ x: 0, y: 0 });
  const [bgSize, setBgSize] = useState({ w: 0, h: 0 });

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const halfW = magnifierWidth / 2;
  const halfH = magnifierHeight / 2;

  const compute = useCallback(
    (clientX: number, clientY: number) => {
      const img = imgRef.current;
      const container = containerRef.current;
      if (!img || !container) return;

      const containerRect = container.getBoundingClientRect();
      const containerW = containerRect.width;
      const containerH = containerRect.height;

      // Replicate object-contain: scale to fit inside container keeping aspect ratio
      const naturalW = img.naturalWidth || containerW;
      const naturalH = img.naturalHeight || containerH;

      const containerRatio = containerW / containerH;
      const imageRatio = naturalW / naturalH;

      let renderedW: number, renderedH: number;
      if (imageRatio > containerRatio) {
        // Wider than container — constrained by width, letterboxed top/bottom
        renderedW = containerW;
        renderedH = containerW / imageRatio;
      } else {
        // Taller than container — constrained by height, pillarboxed left/right
        renderedH = containerH;
        renderedW = containerH * imageRatio;
      }

      // Where the rendered image starts inside the container (centred by object-contain)
      const imgOffsetX = (containerW - renderedW) / 2;
      const imgOffsetY = (containerH - renderedH) / 2;

      // Cursor position relative to container
      const x = clientX - containerRect.left;
      const y = clientY - containerRect.top;

      // Clamp lens so it stays fully inside container
      const clampedX = Math.max(halfW, Math.min(x, containerW - halfW));
      const clampedY = Math.max(halfH, Math.min(y, containerH - halfH));
      setLensPos({ x: clampedX, y: clampedY });

      // Where the cursor falls inside the rendered image, as 0→1
      const relX = Math.max(0, Math.min((x - imgOffsetX) / renderedW, 1));
      const relY = Math.max(0, Math.min((y - imgOffsetY) / renderedH, 1));

      // The CSS background must cover exactly the rendered image area, then scale by zoomLevel
      const zoomedW = renderedW * zoomLevel;
      const zoomedH = renderedH * zoomLevel;
      setBgSize({ w: zoomedW, h: zoomedH });

      // Shift background so the hovered pixel appears at the centre of the lens
      setBgOffset({
        x: relX * zoomedW - halfW,
        y: relY * zoomedH - halfH,
      });
    },
    [halfW, halfH, zoomLevel],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => compute(e.clientX, e.clientY),
    [compute],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) =>
      compute(e.touches[0].clientX, e.touches[0].clientY),
    [compute],
  );

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${className}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onMouseMove={handleMouseMove}
      onTouchStart={() => setShow(true)}
      onTouchEnd={() => setShow(false)}
      onTouchMove={handleTouchMove}
      style={{ cursor: show ? "crosshair" : "default" }}
    >
      {/* Base image — object-contain keeps full image visible, no cropping */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <Image
        ref={imgRef}
        height={300}
        width={300}
        src={src}
        alt={alt}
        draggable={false}
        className={`w-full h-full object-contain block ${imgClassName}`}
      />

      {/* Magnifier lens */}
      {show && bgSize.w > 0 && (
        <div
          aria-hidden
          className="absolute pointer-events-none rounded-full border-2 border-white/80 ring-1 ring-black/10 shadow-xl overflow-hidden"
          style={{
            width: magnifierWidth,
            height: magnifierHeight,
            top: lensPos.y - halfH,
            left: lensPos.x - halfW,
            zIndex: 20,
            backgroundImage: `url('${src}')`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${bgSize.w}px ${bgSize.h}px`,
            backgroundPosition: `-${bgOffset.x}px -${bgOffset.y}px`,
          }}
        />
      )}

      {/* Zoom hint icon — visible at rest, gone while lens is active */}
      {!show && (
        <div
          aria-hidden
          className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center pointer-events-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3.5 h-3.5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0zM11 8v6M8 11h6"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
