"use client";
import { useEffect, useState } from "react";
import { useCart } from "../store/useCart";
import { useUserStore } from "../store/useUserStore";
import api from "@/lib/api";
import {
  Home,
  AlertCircle,
  Loader2,
  CheckCircle,
  Truck,
  CreditCard,
  Landmark,
  Smartphone,
  Lock,
  Wallet,
  Globe,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useThemeData } from "../store/useThemeData";

interface PaymentGateway {
  id: string;
  name: string;
  status: boolean;
  environment: "sandbox" | "production";
  store_password?: string;
  store_id?: string;
  sandbox_url?: string;
  production_url?: string;
}

interface PaymentConfig {
  enable_review: {
    status: boolean;
    require_login: boolean;
    moderate_reviews: boolean;
  };
  online_payment: {
    status: boolean;
    gateways: PaymentGateway[];
    success_url: string;
    fail_url: string;
    ipn_url: string;
    cancel_url: string;
  };
  cash_on_delivery: {
    status: boolean;
  };
}

interface PaymentMethod {
  id: number;
  code: string;
  name: string;
  type: string;
  provider: string;
  status: string;
}

export default function CheckoutPage() {
  const { user: authUser } = useUserStore();
  const { cart, clearCart, initializeCart, isLoading: cartLoading } = useCart();
  const paymentConfig = (useThemeData("payment") || {}) as PaymentConfig;

  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<number | null>(null);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [freeShipping, setFreeShipping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addressList, setAddressList] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Get the current user
  const currentUser = authUser;

  useEffect(() => {
    if (currentUser?.id) {
      initializeCart(currentUser.id);
      fetchAddresses();
      fetchPaymentMethods();
    }
  }, [currentUser?.id, initializeCart]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = freeShipping || total > 1000 ? 0 : 50;

  // 🔹 Fetch Addresses only
  const fetchAddresses = async () => {
    if (!currentUser?.id) return;
    try {
      const resAddress = await api.get(
        `/users/get-customer-address/${currentUser.id}`,
      );
      setAddressList(resAddress?.data?.data || []);

      // Select first address by default
      if (resAddress?.data?.data?.length > 0) {
        setSelectedAddress(resAddress.data.data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    }
  };

  // 🔹 Fetch Payment Methods from API
  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const resPayment = await api.get(`/setup/get-payment-methods`);

      let methods = resPayment?.data?.data || [];

      // Filter based on payment config
      if (paymentConfig) {
        methods = methods.filter((method: PaymentMethod) => {
          if (method.type === "COD") {
            return paymentConfig.cash_on_delivery?.status === true;
          } else {
            // For non-COD methods (MOBILE, ONLINE, etc.), check if online payment is enabled
            return paymentConfig.online_payment?.status === true;
          }
        });
      }

      setPaymentMethods(methods);

      // Select first payment method by default
      if (methods.length > 0) {
        setSelectedPayment(methods[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch payment methods:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get payment method icon
  const getPaymentIcon = (method: PaymentMethod) => {
    if (method.type === "COD") {
      return <Truck className="w-5 h-5" />;
    }

    const icons: Record<string, any> = {
      SSLCOMMERZ: Landmark,
      Stripe: CreditCard,
      PayPal: Wallet,
      bKash: Smartphone,
      Nagad: Smartphone,
      Rocket: Smartphone,
    };
    const Icon = icons[method.name] || CreditCard;
    return <Icon className="w-5 h-5" />;
  };

  // Handle coupon
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

  // Handle online payment redirect
  const handleOnlinePayment = async (paymentMethod: PaymentMethod) => {
    const token = localStorage.getItem("token");

    try {
      setLoading(true);

      // Create order first
      const orderData = {
        customer_id: currentUser!.id,
        delivery_address_id: selectedAddress,
        delivery_method_id: 4,
        payment_method_id: paymentMethod.id, // Use the integer ID from database
        discount_amount: discount,
        is_cod: false,
        items: cart.map((item) => ({
          product_variant_id: item.primary_variant_id,
          quantity: item.quantity,
          unit_price: item.price,
          discount: 0,
        })),
      };

      const orderRes = await api.post("/order/create-order", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || "Failed to create order");
      }

      // Check if the response contains payment URL
      if (
        orderRes.data.data?.requiresPayment &&
        orderRes.data.data?.paymentUrl
      ) {
        // Redirect to payment gateway
        window.location.href = orderRes.data.data.paymentUrl;
      } else {
        // If no payment URL but order created successfully
        setOrderId(
          orderRes.data.data.order?.code || orderRes.data.data.order?.id,
        );
        setOrderPlaced(true);
        clearCart(currentUser!.id);
      }
    } catch (err: any) {
      console.error("Payment failed:", err);
      alert(`❌ ${err.response?.data?.message || "Failed to process payment"}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle COD order
  const handleCODOrder = async (paymentMethod: PaymentMethod) => {
    const token = localStorage.getItem("token");

    try {
      setLoading(true);

      const orderData = {
        customer_id: currentUser!.id,
        delivery_address_id: selectedAddress,
        delivery_method_id: 4,
        payment_method_id: paymentMethod.id, // Use the integer ID from database
        discount_amount: discount,
        is_cod: true,
        items: cart.map((item) => ({
          product_variant_id: item.primary_variant_id,
          quantity: item.quantity,
          unit_price: item.price,
          discount: 0,
        })),
      };

      const res = await api.post("/order/create-order", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setOrderId(res.data.data.order?.code || res.data.data.order?.id);
        setOrderPlaced(true);
        clearCart(currentUser!.id);
      } else {
        throw new Error(res.data.message || "Failed to place order");
      }
    } catch (err: any) {
      console.error("Order failed:", err);
      alert(`❌ ${err.response?.data?.message || "Failed to place order"}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle place order based on selected payment
  const handlePlaceOrder = async () => {
    if (!currentUser?.id) {
      alert("⚠️ You must be logged in to place an order!");
      return;
    }
    if (!selectedAddress) {
      alert("⚠️ Please select a shipping address!");
      return;
    }
    if (!selectedPayment) {
      alert("⚠️ Please select a payment method!");
      return;
    }

    const selectedPaymentMethod = paymentMethods.find(
      (p) => p.id === selectedPayment,
    );

    if (!selectedPaymentMethod) {
      alert("⚠️ Invalid payment method selected!");
      return;
    }

    if (selectedPaymentMethod.type === "COD") {
      await handleCODOrder(selectedPaymentMethod);
    } else {
      await handleOnlinePayment(selectedPaymentMethod);
    }
  };

  // Show login message if not authenticated
  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Please Login to Checkout 🔒</h2>
        <p className="text-gray-600 mb-6">
          You need to be logged in to proceed with checkout.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/account/login"
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
          >
            Login to Continue
          </Link>
          <Link
            href="/"
            className="border border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary/5"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (cartLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-gray-600">Loading checkout details...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="w-48 h-48 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Truck className="w-20 h-20 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Your cart is empty 🛒</h2>
        <p className="text-gray-600 mb-6">
          Add some products to your cart before checkout.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-20 h-20 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Order Placed Successfully! 🎉
        </h1>
        <p className="text-gray-600 mb-2">
          Thank you for your purchase, {currentUser.full_name}!
        </p>
        {orderId && (
          <p className="text-gray-800 font-medium mb-6">
            Order ID: <span className="text-primary">{orderId}</span>
          </p>
        )}
        <p className="text-gray-500 mb-8">
          {paymentMethods.find((p) => p.id === selectedPayment)?.type === "COD"
            ? "You will pay upon delivery. A confirmation email has been sent."
            : "You will be redirected to the payment gateway shortly."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/orders"
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
          >
            View My Orders
          </Link>
          <Link
            href="/"
            className="border border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary/5"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Section */}
      <div className="lg:col-span-2 space-y-8">
        {/* Shipping Address */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            Shipping Address
          </h2>
          {addressList.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No addresses found</p>
              <Link
                href="/profile/addresses"
                className="text-primary hover:underline"
              >
                Add a new address
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {addressList.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition ${
                    selectedAddress === addr.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedAddress(addr.id)}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddress === addr.id}
                    onChange={() => setSelectedAddress(addr.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{addr.label}</p>
                      {addr.is_default && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1">{addr.address_line}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {[addr.city, addr.area, addr.postal_code]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      📞 {addr.phone}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Payment Method - Based on Config */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Payment Method
          </h2>

          {paymentMethods.length > 0 ? (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition ${
                    selectedPayment === method.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedPayment(method.id)}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedPayment === method.id}
                    onChange={() => setSelectedPayment(method.id)}
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        method.type === "COD"
                          ? "bg-green-100"
                          : "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                      }`}
                    >
                      {getPaymentIcon(method)}
                    </div>
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-gray-500">
                        {method.type === "COD"
                          ? "Pay when you receive your order"
                          : "Secure online payment"}
                      </p>
                    </div>
                  </div>
                  {method.type === "COD" && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      COD
                    </span>
                  )}
                </label>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No payment methods available</p>
              <p className="text-sm text-gray-400 mt-2">
                Please contact support for assistance
              </p>
            </div>
          )}

          {/* Payment Info Cards */}
          {selectedPayment && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Payment Information
              </h3>
              {paymentMethods.find((p) => p.id === selectedPayment)?.type ===
              "COD" ? (
                <p className="text-xs text-blue-600">
                  💰 Pay in cash when your order arrives. Our delivery partner
                  will collect the payment.
                </p>
              ) : (
                <p className="text-xs text-blue-600">
                  🔒 You'll be redirected to a secure payment page. Your payment
                  information is encrypted and safe.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Section - Order Summary */}
      <div className="bg-white rounded-xl shadow-sm border p-6 h-fit sticky top-6">
        <h2 className="text-xl font-bold mb-6">Order Summary</h2>

        {/* Cart Items */}
        <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <Image
                src={item.image || "https://placehold.co/400"}
                alt={item.name || "Product image"}
                width={60}
                height={60}
                className="rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{item.name}</h3>
                <p className="text-sm text-gray-500">
                  Qty: {item.quantity} × ৳{item.price.toFixed(2)}
                </p>
              </div>
              <p className="font-semibold text-nowrap">
                ৳{(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Coupon */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Coupon Code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              onClick={handleApplyCoupon}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 text-sm font-medium"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Totals */}
        <div className="border-t pt-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
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
            <span className={freeShipping ? "text-green-600 font-medium" : ""}>
              {freeShipping || total > 1000
                ? "Free"
                : "৳ " + shippingCost.toFixed(2)}
            </span>
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">
                ৳ {(total - discount + shippingCost).toFixed(2)}
              </span>
            </div>
            {total > 1000 && !freeShipping && (
              <p className="text-sm text-green-600 mt-1">
                🎉 Free shipping applied!
              </p>
            )}
          </div>
        </div>

        {/* Place Order Button */}
        <button
          onClick={handlePlaceOrder}
          disabled={
            loading || cart.length === 0 || !selectedPayment || !selectedAddress
          }
          className="w-full mt-6 bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {paymentMethods.find((p) => p.id === selectedPayment)?.type ===
              "COD"
                ? "Placing Order..."
                : "Redirecting to Payment..."}
            </span>
          ) : (
            `Place Order (৳ ${(total - discount + shippingCost).toFixed(2)})`
          )}
        </button>
      </div>
    </div>
  );
}
