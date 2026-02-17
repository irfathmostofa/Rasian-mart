// components/FloatingButtons.tsx
"use client";

import { useEffect, useState } from "react";
import {
  FaWhatsapp,
  FaFacebookMessenger,
  FaPhone,
  FaEnvelope,
  FaArrowUp,
} from "react-icons/fa";
import { useThemeData } from "@/app/store/useThemeData";

// types/floating.types.ts
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
  showBackToTop?: boolean; // New prop to control back to top button
  backToTopOffset?: number; // Optional offset for back to top button
}

// Map fontawesome icon names to react-icons
const IconMap: Record<string, any> = {
  whatsapp: FaWhatsapp,
  messenger: FaFacebookMessenger,
  phone: FaPhone,
  email: FaEnvelope,
};

export default function FloatingButtons({
  className = "",
  showBackToTop = true, // Enable by default
  backToTopOffset = 300, // Show after scrolling 300px
}: FloatingButtonsProps) {
  const [config, setConfig] = useState<FloatingConfig | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showBackToTopBtn, setShowBackToTopBtn] = useState(false);
  const floatingConfig = (useThemeData("floating_buttons") ||
    {}) as FloatingConfig;

  useEffect(() => {
    // Fetch configuration
    setConfig(floatingConfig);

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Check schedule if enabled
    if (floatingConfig.schedule_enabled) {
      checkSchedule(floatingConfig.active_days);
    }

    // Handle scroll for back to top button
    const handleScroll = () => {
      if (showBackToTop) {
        setShowBackToTopBtn(window.scrollY > backToTopOffset);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [floatingConfig, showBackToTop, backToTopOffset]);

  const checkSchedule = (activeDays: string[]) => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "short" });
    setIsVisible(activeDays.includes(today));
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!config || !config.status || !isVisible) return null;

  // Check visibility based on device
  if (isMobile && !config.mobile_show) return null;
  if (!isMobile && !config.desktop_show) return null;

  const positionStyles = {
    [config.position === "right" ? "right" : "left"]:
      config.position === "right"
        ? config.offset_right || 20
        : config.offset_left || 20,
    bottom: config.offset_bottom,
    zIndex: config.z_index,
  };

  const animationClass = {
    none: "",
    pulse: "animate-pulse",
    bounce: "animate-bounce",
    slide: "animate-slide-in",
  }[config.animation];

  const getButtonSize = (size: string) => {
    switch (size) {
      case "sm":
        return "w-8 h-8 text-sm";
      case "lg":
        return "w-14 h-14 text-lg";
      default:
        return "w-12 h-12 text-base";
    }
  };

  const getButtonShape = (shape: string) => {
    switch (shape) {
      case "circle":
        return "rounded-full";
      case "square":
        return "rounded-none";
      default:
        return "rounded-lg";
    }
  };

  const handleButtonClick = (button: FloatingButton) => {
    let url = "";

    switch (button.type) {
      case "whatsapp":
        url = `https://wa.me/${button.phone_number?.replace(/[^0-9]/g, "")}`;
        break;
      case "messenger":
        url = "https://m.me/"; // Add your messenger username/page ID
        break;
      case "phone":
        url = `tel:${button.phone_number}`;
        break;
      case "email":
        url = `mailto:${button.link}`;
        break;
      default:
        url = button.link || "#";
    }

    if (button.open_in_new_tab) {
      window.open(url, "_blank");
    } else {
      window.location.href = url;
    }
  };

  const renderTooltip = (
    button: FloatingButton,
    position: "top" | "left" | "right" = "top",
  ) => {
    if (!button.tooltip) return null;

    const tooltipText =
      isMobile && button.tooltip_text_bn
        ? button.tooltip_text_bn
        : button.tooltip_text;

    // Position tooltip based on button position and direction
    const tooltipPositionClass = {
      top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
      left: "right-full mr-2 top-1/2 -translate-y-1/2",
      right: "left-full ml-2 top-1/2 -translate-y-1/2",
    }[position];

    return (
      <div
        className={`absolute whitespace-nowrap bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${tooltipPositionClass}`}
      >
        {tooltipText}
      </div>
    );
  };

  // Filter active buttons
  const activeButtons = config.buttons.filter((button) => button.status);

  // Determine tooltip position based on main button position
  const tooltipPosition = config.position === "right" ? "left" : "right";

  // Direction class for buttons container
  const directionClass =
    config.direction === "vertical"
      ? "flex-col space-y-2"
      : "flex-row space-x-2";

  return (
    <div style={positionStyles} className={`fixed ${className}`}>
      <div className={`flex ${directionClass}`}>
        {/* Render configured buttons */}
        {activeButtons.map((button) => {
          const IconComponent = IconMap[button.icon] || FaWhatsapp;

          return (
            <button
              key={button.id}
              onClick={() => handleButtonClick(button)}
              className={`group relative flex items-center justify-center ${getButtonSize(button.size)} ${getButtonShape(button.shape)} transition-all duration-300 hover:scale-110 ${animationClass}`}
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
              <IconComponent className="w-5 h-5" />
              {renderTooltip(button, tooltipPosition)}
            </button>
          );
        })}

        {/* Back to Top Button - Only shown when scrolling and enabled */}
        {showBackToTop && showBackToTopBtn && (
          <button
            onClick={scrollToTop}
            className={`group relative flex items-center justify-center ${
              activeButtons.length > 0 ? getButtonSize("md") : "w-12 h-12"
            } rounded-full bg-gray-800 text-white transition-all duration-300 hover:bg-gray-700 hover:scale-110 ${
              config.animation === "none" ? "" : "animate-bounce"
            }`}
            style={{
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
            aria-label="Back to top"
          >
            <FaArrowUp className="w-5 h-5" />
            <div
              className={`absolute whitespace-nowrap bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
                tooltipPosition === "left"
                  ? "right-full mr-2"
                  : "left-full ml-2"
              } top-1/2 -translate-y-1/2`}
            >
              Back to top
            </div>
          </button>
        )}
      </div>

      {/* If no buttons configured but back to top is enabled, show only back to top */}
      {activeButtons.length === 0 && showBackToTop && showBackToTopBtn && (
        <button
          onClick={scrollToTop}
          className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 text-white transition-all duration-300 hover:bg-gray-700 hover:scale-110 animate-bounce"
          style={{
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
          aria-label="Back to top"
        >
          <FaArrowUp className="w-5 h-5" />
          <div
            className={`absolute whitespace-nowrap bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
              config.position === "right" ? "right-full mr-2" : "left-full ml-2"
            } top-1/2 -translate-y-1/2`}
          >
            Back to top
          </div>
        </button>
      )}
    </div>
  );
}
