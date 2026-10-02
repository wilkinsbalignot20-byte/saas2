// components/dashboard/orders/OrderStatusCard.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface OrderStatusCardProps {
  orderId: string;
  slug: string;
  currentPaymentStatus: string;
  currentShippingStatus: string;
  themeColor: string;
}

export function OrderStatusCard({
  orderId,
  slug,
  currentPaymentStatus,
  currentShippingStatus,
  themeColor,
}: OrderStatusCardProps) {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [shippingStatus, setShippingStatus] = useState(currentShippingStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Function para mag-save ng status updates sa Backend API
  const handleUpdateStatus = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // 🚀 Tatama sa idadagdag nating API Route mamaya
      const response = await fetch(`/api/stores/${slug}/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentStatus,
          shippingStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage({ type: "success", text: "Order status successfully updated!" });
      router.refresh(); // I-refresh ang Server Component para updated ang buong page data
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to update status." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Order Fulfillment Status</h3>
      <p className="text-xs text-slate-400 mb-6">Update the order's financial and delivery lifecycle.</p>

      <div className="space-y-4">
        {/* 💳 PAYMENT STATUS DROPDOWN */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Payment Status</label>
          <select
            value={paymentStatus}
            disabled={isLoading}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          >
            <option value="pending">⏳ Pending</option>
            <option value="paid">✅ Paid</option>
            <option value="failed">❌ Failed</option>
            <option value="refunded">🔄 Refunded</option>
          </select>
        </div>

        {/* 📦 SHIPPING / FULFILLMENT STATUS DROPDOWN */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Fulfillment Status</label>
          <select
            value={shippingStatus}
            disabled={isLoading}
            onChange={(e) => setShippingStatus(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          >
            <option value="unfulfilled">📦 Unfulfilled (Processing)</option>
            <option value="shipped">🚚 Shipped</option>
            <option value="delivered">🏠 Delivered</option>
            <option value="cancelled">🚫 Cancelled</option>
          </select>
        </div>

        {/* NOTIFICATION FEEDBACK */}
        {message && (
          <div
            className={`rounded-lg p-3 text-xs font-medium ${
              message.type === "success"
                ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* SAVE CHANGES BUTTON */}
        <button
          onClick={handleUpdateStatus}
          disabled={isLoading || (paymentStatus === currentPaymentStatus && shippingStatus === currentShippingStatus)}
          className="w-full inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: themeColor }}
        >
          {isLoading ? "Saving changes..." : "Save Status Updates"}
        </button>
      </div>
    </div>
  );
}
