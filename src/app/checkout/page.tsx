"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useCart } from "../store/useCart";
import Image from "next/image";
import { useUserStore } from "../store/useUserStore";
import api from "@/lib/api";
import { Home } from "lucide-react";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user } = useUserStore();

  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<number | null>(null);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [freeShipping, setFreeShipping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addressList, setAddressList] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = freeShipping ? 0 : 50;

  // 🔹 Coupon
  const handleApplyCoupon = () => {
    const code = coupon.toUpperCase();
    if (code === "DISCOUNT10") {
      setDiscount(total * 0.1);
      setFreeShipping(false);
      alert("🎉 10% discount applied!");
    } else if (code === "FREESHIP") {
      setFreeShipping(true);
      setDiscount(0);
      alert("🚚 Free shipping applied!");
    } else {
      setDiscount(0);
      setFreeShipping(false);
      alert("❌ Invalid coupon code");
    }
  };

  // 🔹 Fetch Address & Payment methods
  const fetchData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [resAddress, resPayment] = await Promise.all([
        api.get(`/users/get-customer-address/${user.id}`),
        api.get(`/setup/get-payment-methods`),
      ]);

      setAddressList(resAddress?.data.data || []);
      setPaymentMethods(resPayment?.data.data || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // 🔹 Place Order
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert("⚠️ Please select a shipping address!");
      return;
    }
    if (!selectedPayment) {
      alert("⚠️ Please select a payment method!");
      return;
    }
    if (!user?.id) {
      alert("⚠️ You must be logged in to place an order!");
      return;
    }
    const token = localStorage.getItem("token");
    const orderData = {
      customer_id: user.id,
      delivery_address_id: selectedAddress,
      delivery_method_id: 3, // Replace if you later add delivery methods
      payment_method_id: selectedPayment,
      discount_amount: discount,
      is_cod:
        paymentMethods.find((p) => p.id === selectedPayment)?.type === "COD",
      items: cart.map((item) => ({
        product_variant_id: item.primary_variant_id,
        quantity: item.quantity,
        unit_price: item.price,
        discount: 0,
      })),
    };
 
    try {
      setLoading(true);
      const res = await api.post("/order/create-order", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Order created:", res);
      alert("✅ Order placed successfully!");
      clearCart();
    } catch (err) {
      console.error("Order failed:", err);
      alert("❌ Failed to place order");
    } finally {
      setLoading(false);
    }
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
      {/* Left Section */}
      <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
        {/* Shipping */}
        <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
        {loading && <p>Loading...</p>}
        {!loading && addressList.length === 0 && (
          <p className="text-gray-500">No addresses found.</p>
        )}
        <div className="space-y-3">
          {addressList.map((addr) => (
            <motion.label
              key={addr.id}
              className={`flex justify-between items-start p-3 border rounded-lg cursor-pointer transition ${
                selectedAddress === addr.id
                  ? "border-primary bg-primary/10"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
              onClick={() => setSelectedAddress(addr.id)}
            >
              <div>
                <p className="font-semibold flex items-center gap-1">
                  <Home className="w-4 h-4 text-primary" /> {addr.label}
                </p>
                <p className="text-sm text-gray-600">{addr.address_line}</p>
                <p className="text-xs text-gray-500">
                  {addr.city && `${addr.city}, `}
                  {addr.area && `${addr.area}, `}
                  {addr.postal_code}
                </p>
              </div>
              <input
                type="radio"
                checked={selectedAddress === addr.id}
                readOnly
              />
            </motion.label>
          ))}
        </div>

        {/* Payment */}
        <h2 className="text-xl font-bold mt-6 mb-4">Payment Method</h2>
        <div className="space-y-2">
          {paymentMethods.map((p) => (
            <label
              key={p.id}
              className={`flex items-center gap-2 cursor-pointer p-2 border rounded-lg ${
                selectedPayment === p.id
                  ? "border-primary bg-primary/10"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setSelectedPayment(p.id)}
            >
              <input
                type="radio"
                name="payment"
                value={p.id}
                checked={selectedPayment === p.id}
                onChange={() => setSelectedPayment(p.id)}
              />
              <span className="font-medium">{p.name}</span>
              <span className="text-xs text-gray-500">({p.type})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <Image
                src={item.image || "https://placehold.co/400"}
                alt={item.name || "Product image"}
                width={60}
                height={60}
                className="rounded-lg object-cover"
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

        {/* Coupon */}
        <div className="mt-4 flex">
          <input
            type="text"
            placeholder="Enter coupon code"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            className="border rounded-l-lg px-3 py-2 flex-1"
          />
          <button
            onClick={handleApplyCoupon}
            className="bg-gray-800 text-white px-4 py-2 rounded-r-lg hover:bg-gray-900"
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

        {/* Button */}
        <button
          disabled={loading}
          onClick={handlePlaceOrder}
          className="w-full mt-6 bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition"
        >
          {loading ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}
