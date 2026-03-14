// components/layout/FloatingButtons.tsx
"use client";

import { useEffect, useState } from "react";
import {
  FaWhatsapp,
  FaFacebookMessenger,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import { useThemeData } from "@/app/store/useThemeData";
import { ChevronRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FloatingButton {
  id: string;
  type: "whatsapp" | "messenger" | "phone" | "email" | "custom";
  label: string;
  label_bn?: string;
  icon: string;
  icon_type: "fontawesome" | "custom";
  color: string;
  hover_color: string;
  text_color: string;
  size: "sm" | "md" | "lg";
  shape: "rounded" | "circle" | "square";
  status: boolean;
  tooltip: boolean;
  tooltip_text?: string;
  tooltip_text_bn?: string;
  open_in_new_tab?: boolean;
  phone_number?: string;
  link?: string;
}

export interface FloatingConfig {
  status: boolean;
  position: "left" | "right";
  offset_bottom: number;
  offset_right?: number;
  offset_left?: number;
  z_index: number;
  buttons: FloatingButton[];
  animation: "none" | "pulse" | "bounce" | "slide";
  mobile_show: boolean;
  desktop_show: boolean;
  schedule_enabled: boolean;
  direction: "horizontal" | "vertical";
  active_days: string[];
}

interface FloatingButtonsProps {
  className?: string;
  showBackToTop?: boolean;
  backToTopOffset?: number;
}

// ─── Icon map ─────────────────────────────────────────────────────────────────

const IconMap: Record<string, React.ElementType> = {
  whatsapp: FaWhatsapp,
  messenger: FaFacebookMessenger,
  phone: FaPhone,
  email: FaEnvelope,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getButtonSize(size: string) {
  return size === "sm"
    ? "w-8 h-8 text-sm"
    : size === "lg"
      ? "w-14 h-14 text-lg"
      : "w-12 h-12 text-base";
}

function getButtonShape(shape: string) {
  return shape === "circle"
    ? "rounded-full"
    : shape === "square"
      ? "rounded-none"
      : "rounded-lg";
}

function isScheduleActive(activeDays: string[]): boolean {
  const today = new Date().toLocaleDateString("en-US", { weekday: "short" });
  return activeDays.includes(today);
}

function buildUrl(button: FloatingButton): string {
  switch (button.type) {
    case "whatsapp":
      return `https://wa.me/${button.phone_number?.replace(/[^0-9]/g, "")}`;
    case "messenger":
      return "https://m.me/";
    case "phone":
      return `tel:${button.phone_number}`;
    case "email":
      return `mailto:${button.link}`;
    default:
      return button.link || "#";
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FloatingButtons({
  className = "",
  showBackToTop = true,
  backToTopOffset = 300,
}: FloatingButtonsProps) {
  // Use floatingConfig directly — no local state copy needed.
  // Copying it into useState caused infinite re-renders because
  // React Query returns a new object reference on every render,
  // which triggered useEffect → setConfig → re-render → repeat.
  const config = useThemeData("floating_buttons") as FloatingConfig | undefined;

  const [isMobile, setIsMobile] = useState(false);
  const [showBackToTopBtn, setShowBackToTopBtn] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Browser-only effects — no dependency on config object reference
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []); // runs once

  useEffect(() => {
    if (!showBackToTop) return;
    const handleScroll = () =>
      setShowBackToTopBtn(window.scrollY > backToTopOffset);
    handleScroll(); // initial check
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showBackToTop, backToTopOffset]); // stable primitives — safe deps

  // Schedule check — only re-run when config.active_days identity changes
  useEffect(() => {
    if (!config?.schedule_enabled) return;
    setIsVisible(isScheduleActive(config.active_days));
  }, [config?.schedule_enabled, config?.active_days]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleButtonClick = (button: FloatingButton) => {
    const url = buildUrl(button);
    button.open_in_new_tab
      ? window.open(url, "_blank")
      : (window.location.href = url);
  };

  const renderTooltip = (
    button: FloatingButton,
    position: "left" | "right",
  ) => {
    if (!button.tooltip) return null;
    const text =
      isMobile && button.tooltip_text_bn
        ? button.tooltip_text_bn
        : button.tooltip_text;
    const posClass = position === "left" ? "right-full mr-2" : "left-full ml-2";
    return (
      <div
        className={`absolute ${posClass} top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
      >
        {text}
      </div>
    );
  };

  // ── Guards ────────────────────────────────────────────────────────────────

  if (!config?.status || !isVisible) return null;
  if (isMobile && !config.mobile_show) return null;
  if (!isMobile && !config.desktop_show) return null;

  // ── Derived values ────────────────────────────────────────────────────────

  const activeButtons = (config.buttons ?? []).filter((b) => b.status);
  const tooltipPosition = config.position === "right" ? "left" : "right";
  const directionClass =
    config.direction === "vertical"
      ? "flex-col space-y-2"
      : "flex-row space-x-2";

  const animationClass: Record<FloatingConfig["animation"], string> = {
    none: "",
    pulse: "animate-pulse",
    bounce: "animate-bounce",
    slide: "animate-slide-in",
  };

  const positionStyles: React.CSSProperties = {
    [config.position === "right" ? "right" : "left"]:
      config.position === "right"
        ? (config.offset_right ?? 20)
        : (config.offset_left ?? 20),
    bottom: config.offset_bottom,
    zIndex: config.z_index,
  };

  const backToTopBtn = showBackToTop && showBackToTopBtn && (
    <button
      onClick={scrollToTop}
      className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 text-white transition-all duration-300 hover:bg-gray-700 hover:scale-110"
      aria-label="Back to top"
    >
      <ChevronRight className="w-5 h-5 -rotate-90" />
      <div
        className={`absolute ${tooltipPosition === "left" ? "right-full mr-2" : "left-full ml-2"} top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
      >
        Back to top
      </div>
    </button>
  );

  return (
    <div style={positionStyles} className={`fixed ${className}`}>
      <div className={`flex ${directionClass}`}>
        {activeButtons.map((button) => {
          const Icon = IconMap[button.icon] ?? FaWhatsapp;
          return (
            <button
              key={button.id}
              onClick={() => handleButtonClick(button)}
              className={`group relative flex items-center justify-center ${getButtonSize(button.size)} ${getButtonShape(button.shape)} transition-all duration-300 hover:scale-110 ${animationClass[config.animation]}`}
              style={{
                backgroundColor: button.color,
                color: button.text_color,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = button.hover_color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = button.color;
              }}
              aria-label={button.label}
            >
              <Icon className="w-5 h-5" />
              {renderTooltip(button, tooltipPosition)}
            </button>
          );
        })}

        {activeButtons.length > 0 && backToTopBtn}
      </div>

      {/* Back to top standalone — when no other buttons are configured */}
      {activeButtons.length === 0 && backToTopBtn}
    </div>
  );
}
