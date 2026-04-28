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
  const [imageLoaded, setImageLoaded] = useState(false);

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

      const naturalW = img.naturalWidth || containerW;
      const naturalH = img.naturalHeight || containerH;

      const containerRatio = containerW / containerH;
      const imageRatio = naturalW / naturalH;

      let renderedW: number, renderedH: number;
      if (imageRatio > containerRatio) {
        renderedW = containerW;
        renderedH = containerW / imageRatio;
      } else {
        renderedH = containerH;
        renderedW = containerH * imageRatio;
      }

      const imgOffsetX = (containerW - renderedW) / 2;
      const imgOffsetY = (containerH - renderedH) / 2;

      const x = clientX - containerRect.left;
      const y = clientY - containerRect.top;

      const clampedX = Math.max(halfW, Math.min(x, containerW - halfW));
      const clampedY = Math.max(halfH, Math.min(y, containerH - halfH));
      setLensPos({ x: clampedX, y: clampedY });

      const relX = Math.max(0, Math.min((x - imgOffsetX) / renderedW, 1));
      const relY = Math.max(0, Math.min((y - imgOffsetY) / renderedH, 1));

      const zoomedW = renderedW * zoomLevel;
      const zoomedH = renderedH * zoomLevel;
      setBgSize({ w: zoomedW, h: zoomedH });

      setBgOffset({
        x: relX * zoomedW - halfW,
        y: relY * zoomedH - halfH,
      });
    },
    [halfW, halfH, zoomLevel],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (imageLoaded) {
        compute(e.clientX, e.clientY);
      }
    },
    [compute, imageLoaded],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (imageLoaded && e.touches.length > 0) {
        compute(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [compute, imageLoaded],
  );

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div
      ref={containerRef}
      className={`relative select-none w-full h-full overflow-hidden ${className}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => {
        setShow(false);
      }}
      onMouseMove={handleMouseMove}
      onTouchStart={() => setShow(true)}
      onTouchEnd={() => {
        setShow(false);
      }}
      onTouchMove={handleTouchMove}
      style={{ cursor: show ? "crosshair" : "default" }}
    >
      {/* Base image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        draggable={false}
        onLoad={handleImageLoad}
        className={`w-full h-full object-contain block ${imgClassName}`}
      />

      {/* Magnifier lens */}
      {show && imageLoaded && bgSize.w > 0 && (
        <div
          aria-hidden="true"
          className="absolute pointer-events-none rounded-full border-2 border-white/80 ring-1 ring-black/10 shadow-2xl overflow-hidden transition-shadow duration-200"
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
            backgroundColor: "#f9fafb",
          }}
        />
      )}

      {/* Zoom hint icon */}
      {!show && imageLoaded && (
        <div
          aria-hidden="true"
          className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center pointer-events-none animate-pulse"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0zM11 8v6M8 11h6"
            />
          </svg>
        </div>
      )}

      {/* Loading state */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 dark:border-gray-600 border-t-gray-900 dark:border-t-white" />
        </div>
      )}
    </div>
  );
}
