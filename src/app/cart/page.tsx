"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "../store/useCart";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-bold">Your cart is empty 🛒</h2>
        <Link
          href="/"
          className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded-lg"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      <div className="space-y-4">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 bg-white p-4 rounded-lg shadow"
          >
            <Image
              src={item.image}
              alt={item.name}
              width={80}
              height={80}
              className="rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-gray-500">৳ {item.price.toFixed(2)}</p>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(item.id, Number(e.target.value))
                  }
                  className="w-16 border rounded p-1 text-center"
                />
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
            <p className="font-semibold">
              ৳ {(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 border rounded-lg bg-gray-50">
        <p className="text-lg font-bold">Total: ৳ {total.toFixed(2)}</p>
        <div className="flex gap-3 mt-4">
          <button
            onClick={clearCart}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-center text-[14px]"
          >
            Clear Cart
          </button>
          <Link
            href="/checkout"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 text-center text-[14px]"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
