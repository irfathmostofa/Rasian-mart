"use client";
import { useEffect, useState } from "react";
import { useUserStore } from "@/app/store/useUserStore";
import api from "@/lib/api";
import {
  Loader2,
  Truck,
  XCircle,
  Repeat,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface OrderItem {
  id: number;
  product_variant_id: number;
  product_name: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  discount: number;
  subtotal: number;
}

interface Order {
  id: number;
  code: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_status: string;
  payment_status: string;
  delivery_method_name: string;
  payment_method_name: string;
  created_at: string;
  items: OrderItem[];
}

export default function ProfileOrders() {
  const { user } = useUserStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchOrders = async (pageNumber = 1) => {
    if (!user?.id) {
      setOrders([]);
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/order/get-all-order", {
        page: pageNumber,
        limit,
        customer_id: user.id,
        order_status: orderStatus || null,
        payment_status: paymentStatus || null,
        from_date: fromDate || null,
        to_date: toDate || null,
      });
      setOrders(res?.data?.data || []);
      setTotalPages(res?.data?.pagination?.totalPages || 1);
      setPage(pageNumber);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1); // Reset to page 1 whenever user or filters change
  }, [user?.id, orderStatus, paymentStatus, fromDate, toDate]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-gray-600">Loading Orders...</span>
      </div>
    );
  }

  if (!orders.length)
    return <p className="text-gray-500">No orders found yet.</p>;

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center ">
        <select
          className="border border-gray-300 rounded-md p-2 text-sm"
          value={orderStatus}
          onChange={(e) => setOrderStatus(e.target.value)}
        >
          <option value="">All Order Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="canceled">Canceled</option>
        </select>

        <select
          className="border border-gray-300 rounded-md p-2 text-sm"
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
        >
          <option value="">All Payment Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>

        <input
          type="date"
          className="border border-gray-300 rounded-md p-2 text-sm"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />

        <input
          type="date"
          className="border border-gray-300 rounded-md p-2 text-sm"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />

        <button
          className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
          onClick={() => fetchOrders(1)}
        >
          Apply
        </button>
      </div>

      {/* Orders */}
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 border-b border-gray-100 pb-2">
            <div className="text-gray-700 font-medium flex gap-2">
              Order #{order.code}{" "}
              <span
                className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(
                  order.order_status
                )}`}
              >
                {order.order_status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {new Date(order.created_at).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="flex flex-col gap-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border-b border-gray-100 py-1 text-sm"
              >
                <div>
                  {item.product_name}{" "}
                  {item.variant_name && `(${item.variant_name})`} x{" "}
                  {item.quantity}
                </div>
                <div className="font-medium">৳ {item.subtotal.toFixed(2)}</div>
              </div>
            ))}
          </div>

          {/* Total and Actions */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-3 gap-2">
            <div className="text-gray-800 font-semibold">
              Total: ৳{" "}
              {order.items
                .reduce((sum, item) => sum + Number(item.subtotal), 0)
                .toFixed(2)}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              <button className="flex items-center gap-1 px-3 py-1 text-sm rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                <Truck className="w-4 h-4" /> Track
              </button>
              <button className="flex items-center gap-1 px-3 py-1 text-sm rounded-md bg-red-50 text-red-700 hover:bg-red-100">
                <XCircle className="w-4 h-4" /> Cancel
              </button>
              <button className="flex items-center gap-1 px-3 py-1 text-sm rounded-md bg-green-50 text-green-700 hover:bg-green-100">
                <Repeat className="w-4 h-4" /> Reorder
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Pagination */}
      <div className="flex justify-center items-center gap-3 mt-4">
        <button
          onClick={() => fetchOrders(page - 1)}
          disabled={page === 1}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <span className="text-sm text-gray-700">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => fetchOrders(page + 1)}
          disabled={page === totalPages}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
