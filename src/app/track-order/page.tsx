"use client";

import { useState } from "react";
import { PackageSearch, Truck, CheckCircle2, Clock } from "lucide-react";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [orderData, setOrderData] = useState<any>({
    orderId: "ORD-12345",
    status: "Shipped",
    timeline: [
      { label: "Order Placed", date: "2025-08-01T10:00:00Z" },
      { label: "Order Picked", date: "2025-09-02T08:30:00Z" },
      { label: "Processing", date: "2025-10-02T08:30:00Z" },
      { label: "Shipped", date: "2025-10-04T14:00:00Z" },
    ],
    order: {
      items: [
        { name: "Wireless Mouse", price: 1200, qty: 1 },
        { name: "Keyboard", price: 2200, qty: 1 },
      ],
      total: 3400,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const STEPS = [
    "Order Placed",
    "Order Picked",
    "Processing",
    "Shipped",
    "Delivered",
  ];

  const handleTrackOrder = async () => {
    if (!orderId.trim()) {
      setError("Please enter a valid Order ID.");
      return;
    }
    setLoading(true);
    setError("");
    setOrderData(null);
    try {
      const res = await fetch("/api/order/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Order not found");
      setOrderData(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch order status.");
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (step: string) => {
    const currentIndex = STEPS.indexOf(orderData?.status);
    const stepIndex = STEPS.indexOf(step);
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

  const getStepDate = (step: string) => {
    const timelineStep = orderData.timeline.find(
      (t: any) => t.label.toLowerCase() === step.toLowerCase()
    );
    return timelineStep ? new Date(timelineStep.date).toLocaleString() : "";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Track Your Order 🚚
      </h1>

      {/* Input Section */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-10">
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Enter your Order ID (e.g. ORD-12345)"
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={handleTrackOrder}
          disabled={loading}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
        >
          {loading ? "Tracking..." : "Track Order"}
        </button>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {/* Result Section */}
      {orderData ? (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-6">
            Order ID: <span className="text-primary">{orderData.orderId}</span>
          </h2>

          {/* Vertical Timeline */}
          {/* Vertical Timeline */}
          <div className="relative ml-4 mb-8">
            {STEPS.map((step, index) => {
              const status = getStepStatus(step);
              const stepDate = getStepDate(step);
              return (
                <div key={index} className="mb-8 relative">
                  {/* Timeline Circle */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-4 ${
                      status === "completed"
                        ? "bg-green-500 border-green-500 text-white"
                        : status === "current"
                        ? "bg-primary border-primary text-white animate-pulse"
                        : "bg-gray-200 border-gray-200 text-gray-500"
                    }`}
                  >
                    {status === "completed" ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : status === "current" ? (
                      <Truck className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>

                  {/* Step Info */}
                  <div className="ml-12 mt-[-32px]">
                    <p
                      className={`font-medium ${
                        status === "completed"
                          ? "text-green-600"
                          : status === "current"
                          ? "text-primary"
                          : "text-gray-400"
                      }`}
                    >
                      {step}
                    </p>
                    {stepDate && (
                      <p className="text-sm text-gray-500 mt-1">{stepDate}</p>
                    )}
                  </div>

                  {/* Connecting Line */}
                  {index < STEPS.length - 1 && (
                    <div
                      className={`absolute left-4 top-8 w-0.5 h-full ${
                        status === "completed"
                          ? "bg-green-500"
                          : status === "current"
                          ? "bg-primary/50"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          {orderData.order && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Order Summary</h3>
              <ul className="space-y-1 text-gray-700">
                {orderData.order.items.map((it: any, i: number) => (
                  <li key={i} className="flex justify-between">
                    <span>
                      {it.name} × {it.qty}
                    </span>
                    <span>৳ {it.price * it.qty}</span>
                  </li>
                ))}
              </ul>
              <p className="font-bold text-right text-primary mt-3">
                Total: ৳ {orderData.order.total}
              </p>
            </div>
          )}
        </div>
      ) : (
        !loading &&
        !error && (
          <div className="flex flex-col items-center justify-center mt-10 text-gray-500">
            <PackageSearch className="w-12 h-12 mb-3 opacity-70" />
            <p>Enter your Order ID to track your order status.</p>
          </div>
        )
      )}
    </div>
  );
}
