"use client";

import { useState } from "react";
import { useCart } from "../store/useCart";
import Image from "next/image";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();

  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const [payment, setPayment] = useState("cod");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [freeShipping, setFreeShipping] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = freeShipping ? 0 : 50;

  const handleApplyCoupon = () => {
    if (coupon.toUpperCase() === "DISCOUNT10") {
      setDiscount(total * 0.1);
      setFreeShipping(false);
      alert("🎉 10% discount applied!");
    } else if (coupon.toUpperCase() === "FREESHIP") {
      setFreeShipping(true);
      setDiscount(0);
      alert("🚚 Free shipping applied!");
    } else {
      setDiscount(0);
      setFreeShipping(false);
      alert("❌ Invalid coupon code");
    }
  };

  const handlePlaceOrder = () => {
    if (!shipping.name || !shipping.phone || !shipping.address) {
      alert("⚠️ Please fill in shipping details!");
      return;
    }

    const order = {
      shipping,
      payment,
      cart,
      total,
      discount,
      finalTotal: total - discount + shippingCost,
    };

    console.log("Order placed:", order);
    alert("✅ Order placed successfully!");
    clearCart();
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <h2 className="text-xl font-bold">Your cart is empty 🛒</h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Shipping Form */}
      <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={shipping.name}
            onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={shipping.phone}
            onChange={(e) =>
              setShipping({ ...shipping, phone: e.target.value })
            }
            className="border rounded-lg px-3 py-2"
          />
          <input
            type="text"
            placeholder="Address"
            value={shipping.address}
            onChange={(e) =>
              setShipping({ ...shipping, address: e.target.value })
            }
            className="border rounded-lg px-3 py-2 sm:col-span-2"
          />
          <input
            type="text"
            placeholder="City"
            value={shipping.city}
            onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          <input
            type="text"
            placeholder="Postal Code"
            value={shipping.postalCode}
            onChange={(e) =>
              setShipping({ ...shipping, postalCode: e.target.value })
            }
            className="border rounded-lg px-3 py-2"
          />
        </div>

        {/* Payment Options */}
        <h2 className="text-xl font-bold mt-6 mb-4">Payment Method</h2>
        <div className="flex gap-4">
          {["cod", "card", "bkash"].map((method) => (
            <label
              key={method}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="payment"
                value={method}
                checked={payment === method}
                onChange={() => setPayment(method)}
              />
              {method === "cod"
                ? "Cash on Delivery"
                : method === "card"
                ? "Card Payment"
                : "bKash"}
            </label>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <Image
                src={item.image}
                alt={item.name}
                width={60}
                height={60}
                className="rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-gray-500">
                  Qty: {item.quantity} × ৳{item.price.toFixed(2)}
                </p>
              </div>
              <p className="font-semibold">
                ৳{(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Coupon Section */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Enter coupon code"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            className="border rounded-lg px-3 py-2 w-2/3"
          />
          <button
            onClick={handleApplyCoupon}
            className="ml-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900"
          >
            Apply
          </button>
        </div>

        {/* Totals */}
        <div className="border-t mt-4 pt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>৳ {total.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600 font-medium">
              <span>Discount</span>
              <span>- ৳ {discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>
              {freeShipping ? "Free" : "৳ " + shippingCost.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>৳ {(total - discount + shippingCost).toFixed(2)}</span>
          </div>
        </div>

        {/* Place Order */}
        <button
          onClick={handlePlaceOrder}
          className="w-full mt-6 bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition"
        >
          Place Order
        </button>
      </div>
    </div>
  );
}
