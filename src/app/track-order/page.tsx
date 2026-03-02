"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PackageSearch, Truck, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useThemeData } from "../store/useThemeData";

// Create a wrapper component that uses useSearchParams
function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState("");

  const logistic = (useThemeData("logistics") || {}) as any;
  const redxConfig = logistic?.providers?.redx;

  const [trackingData, setTrackingData] = useState<any>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);

  // Map Redx tracking messages to our step system
  const mapRedxTrackingToSteps = (tracking: any[]) => {
    const stepMapping: { [key: string]: string } = {
      "Package is created successfully": "Order Placed",
      "Package is picked up": "Order Picked",
      "Package is in transit": "Processing",
      "Package is out for delivery": "Shipped",
      "Package is delivered": "Delivered",
    };

    return tracking.map((item) => ({
      label: stepMapping[item.message_en] || item.message_en,
      date: item.time,
      message_en: item.message_en,
      message_bn: item.message_bn,
    }));
  };

  useEffect(() => {
    const orderIdFromUrl = searchParams.get("orderId");
    if (orderIdFromUrl) {
      setOrderId(orderIdFromUrl);
      handleTrackOrder(orderIdFromUrl);
    }
    setInitialLoad(false);
  }, [searchParams]);

  const handleTrackOrder = async (id?: string) => {
    const trackingId = id || orderId;
    if (!trackingId.trim()) {
      setError("Please enter a valid Order ID.");
      return;
    }

    setLoading(true);
    setError("");
    setTrackingData(null);

    try {
      // Use Redx access token from theme data
      const accessToken = redxConfig?.access_token;

      if (!accessToken) {
        throw new Error("Redx configuration not found");
      }

      // Determine base URL based on environment
      const baseUrl =
        redxConfig?.environment === "sandbox"
          ? redxConfig?.sandbox_url
          : redxConfig?.base_url;

      // Call Redx tracking API
      const res = await fetch(`${baseUrl}/parcel/track/${trackingId}`, {
        method: "GET",
        headers: {
          "API-ACCESS-TOKEN": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok)
        throw new Error(data.message || "Tracking information not found");

      // Process tracking data
      const processedData = {
        trackingId: trackingId,
        tracking: data.tracking || [],
        timeline: mapRedxTrackingToSteps(data.tracking || []),
        status:
          data.tracking?.length > 0
            ? mapRedxTrackingToSteps([
                data.tracking[data.tracking.length - 1],
              ])[0]?.label
            : "Order Placed",
      };

      setTrackingData(processedData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch tracking information.");
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (stepLabel: string) => {
    if (!trackingData?.timeline || trackingData.timeline.length === 0) {
      return stepLabel === "Order Placed" ? "current" : "pending";
    }

    const currentStep =
      trackingData.timeline[trackingData.timeline.length - 1]?.label;

    if (stepLabel === currentStep) return "current";

    const stepIndex = trackingData.timeline.findIndex(
      (t: any) => t.label === stepLabel,
    );
    if (stepIndex >= 0 && stepIndex < trackingData.timeline.length - 1)
      return "completed";

    return "pending";
  };

  const getStepDate = (stepLabel: string) => {
    if (!trackingData?.timeline) return "";
    const step = trackingData.timeline.find((t: any) => t.label === stepLabel);
    return step ? new Date(step.date).toLocaleString() : "";
  };

  // Check if there's tracking data beyond order placed
  const hasTrackingData =
    trackingData?.tracking && trackingData.tracking.length > 1;
  const latestTracking =
    trackingData?.tracking?.[trackingData.tracking.length - 1];

  // Check if Redx is enabled
  const isRedxEnabled = redxConfig?.status === true;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Back button */}
      <Link
        href="/profile?tab=orders"
        className="inline-flex items-center text-sm text-gray-600 hover:text-primary mb-4"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Orders
      </Link>

      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Track Your Order 🚚
      </h1>

      {/* Redx Status Warning */}
      {!isRedxEnabled && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 text-center">
            ⚠️ Redx tracking is currently disabled. Please check back later.
          </p>
        </div>
      )}

      {/* Input Section */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-10">
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Enter your Redx Tracking ID"
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={!isRedxEnabled}
        />
        <button
          onClick={() => handleTrackOrder()}
          disabled={loading || !isRedxEnabled}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
        >
          {loading ? "Tracking..." : "Track Order"}
        </button>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Result Section */}
      {trackingData ? (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">
                Tracking ID:{" "}
                <span className="text-primary">{trackingData.trackingId}</span>
              </h2>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Redx Express
              </p>
            </div>
            {!hasTrackingData && trackingData.tracking.length === 1 && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                Order Confirmed
              </span>
            )}
          </div>

          {/* Current Status Message */}
          {latestTracking && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                <span>
                  <span className="font-semibold">Current Status:</span>{" "}
                  {latestTracking.message_en}
                  {latestTracking.message_bn && (
                    <span className="block text-sm mt-1">
                      ({latestTracking.message_bn})
                    </span>
                  )}
                </span>
              </p>
            </div>
          )}

          {/* Timeline */}
          <div className="relative ml-4 mb-8">
            {/* Always show Order Placed */}
            <div className="mb-8 relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-4 ${
                  trackingData.timeline.length > 0
                    ? "bg-green-500 border-green-500 text-white"
                    : "bg-primary border-primary text-white animate-pulse"
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="ml-12 mt-[-32px]">
                <p className="font-medium text-green-600">Order Placed</p>
                {trackingData.timeline[0]?.date && (
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(trackingData.timeline[0].date).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Show other tracking events */}
            {trackingData.timeline.slice(1).map((step: any, index: number) => {
              const isLast =
                index === trackingData.timeline.slice(1).length - 1;

              return (
                <div key={index} className="mb-8 relative">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-4 ${
                      isLast
                        ? "bg-primary border-primary text-white animate-pulse"
                        : "bg-green-500 border-green-500 text-white"
                    }`}
                  >
                    {isLast ? (
                      <Truck className="w-5 h-5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-12 mt-[-32px]">
                    <p
                      className={`font-medium ${isLast ? "text-primary" : "text-green-600"}`}
                    >
                      {step.message_en}
                    </p>
                    {step.message_bn && (
                      <p className="text-sm text-gray-600">{step.message_bn}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(step.date).toLocaleString()}
                    </p>
                  </div>

                  {/* Connecting Line */}
                  {!isLast && (
                    <div className="absolute left-4 top-8 w-0.5 h-full bg-green-500" />
                  )}
                </div>
              );
            })}

            {/* Show pending steps if no tracking data */}
            {trackingData.timeline.length === 1 && (
              <>
                <div className="border-l-2 border-dashed border-gray-300 h-24 ml-4"></div>
                <div className="ml-12 mt-[-80px]">
                  <p className="text-sm text-gray-400 italic">
                    Your order is confirmed. Redx tracking updates will appear
                    here once your package is picked up.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        !loading &&
        !error &&
        !initialLoad && (
          <div className="flex flex-col items-center justify-center mt-10 text-gray-500">
            <PackageSearch className="w-12 h-12 mb-3 opacity-70" />
            <p>Enter your Redx Tracking ID to track your order status.</p>
          </div>
        )
      )}
    </div>
  );
}

// Main component with Suspense
export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
