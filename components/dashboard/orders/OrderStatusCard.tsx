 // components/dashboard/orders/OrderStatusCard.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Courier {
  id: string;
  name: string;
  vehicleType: string;
  status: string;
}

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
  
  // 🛡️ Ligtas na pag-normalize sa uppercase upang makasiguro na laging tugma sa database enums
  const [paymentStatus, setPaymentStatus] = useState((currentPaymentStatus || "").toUpperCase());
  const [shippingStatus, setShippingStatus] = useState((currentShippingStatus || "").toUpperCase());
  
  // LOGISTICS RECONCILER STATE MANAGEMENT
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [selectedCourierId, setSelectedCourierId] = useState<string>("");
  const [loadingCouriers, setLoadingCouriers] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // FETCHING LOGIC PARA SA MGA COURIERS NG TENANT (Binago sa UPPERCASE "SHIPPED")
  useEffect(() => {
    async function fetchAvailableCouriers() {
      if (shippingStatus === "SHIPPED") {
        try {
          setLoadingCouriers(true);
          const res = await fetch(`/api/stores/${slug}/couriers?slug=${slug}`);
          if (res.ok) {
            const data = await res.json();
            // Salain lamang ang mga riders na kasalukuyang pwedeng bumyahe (available)
            const availableRiders = data.filter((c: Courier) => c.status === "available");
            setCouriers(availableRiders);
          }
        } catch (err) {
          console.error("Failed to load storefront couriers via context layer:", err);
        } finally {
          setLoadingCouriers(false);
        }
      }
    }
    fetchAvailableCouriers();
  }, [shippingStatus, slug]);

  // SYSTEM MUTATION DISPATCH TRIGGER
  const handleUpdateStatus = async () => {
    // Validation check: kapag SHIPPED ang pinili ngunit walang courier na naselect
    if (shippingStatus === "SHIPPED" && !selectedCourierId) {
      setMessage({ type: "error", text: "Please assign an available courier rider to dispatch this order." });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/stores/${slug}/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentStatus,
          shippingStatus,
          courierId: shippingStatus === "SHIPPED" ? selectedCourierId : null, // I-pasa ang courier map selection
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Something went wrong");
      }

      setMessage({ type: "success", text: "Order logistics and status successfully updated!" });
      router.refresh(); 
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to update status." });
    } finally {
      setIsLoading(false);
    }
  };

  // Button blocker check condition
  const isDataUnchanged = paymentStatus === currentPaymentStatus.toUpperCase() && shippingStatus === currentShippingStatus.toUpperCase();
  const isCourierUnselected = shippingStatus === "SHIPPED" && !selectedCourierId;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Order Fulfillment Status</h3>
      <p className="text-xs text-slate-400 mb-6">Update the order&apos;s financial and delivery lifecycle.</p>

      <div className="space-y-4">
        {/* 💳 PAYMENT STATUS DROPDOWN (UPPERCASE VALUES & NEW STATES ADDED) */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Payment Status</label>
          <select
            value={paymentStatus}
            disabled={isLoading}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          >
            <option value="PENDING">⏳ Pending</option>
            <option value="PAYMENT_REVIEW">🔍 Payment Review (Verify Receipt)</option>
            <option value="PAID">✅ Paid</option>
            <option value="FAILED">❌ Failed</option>
            <option value="REFUNDED">🔄 Refunded</option>
          </select>
        </div>

        {/* 📦 SHIPPING / FULFILLMENT STATUS DROPDOWN (UPPERCASE VALUES & NEW STATES ADDED) */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Fulfillment Status</label>
          <select
            value={shippingStatus}
            disabled={isLoading}
            onChange={(e) => setShippingStatus(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          >
            <option value="DRAFT">📝 Draft (Internal Order)</option>
            <option value="UNFULFILLED">📦 Unfulfilled (Processing)</option>
            <option value="SHIPPED">🚚 Shipped (Out for Delivery)</option>
            <option value="DELIVERED">🏠 Delivered</option>
            <option value="RETURN_REQUESTED">⚠️ Return Requested</option>
            <option value="RETURNED">⏪ Returned to Warehouse</option>
            <option value="CANCELLED">🚫 Cancelled</option>
          </select>
        </div>

        {/* 🚚 DYNAMIC COURIER DISPATCH SELECTOR */}
        {shippingStatus === "SHIPPED" && (
          <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-lg border border-slate-100 dark:bg-slate-900/40 dark:border-slate-800/60 animate-in slide-in-from-top-2 duration-200">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Assign Courier Rider *</label>
            {loadingCouriers ? (
              <p className="text-xs text-slate-400">Scanning available tenant fleet...</p>
            ) : couriers.length === 0 ? (
              <p className="text-xs text-amber-600 font-medium">⚠️ No riders available. Register or change rider status in Logistics control first.</p>
            ) : (
              <select
                value={selectedCourierId}
                onChange={(e) => setSelectedCourierId(e.target.value)}
                className="w-full mt-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="">-- Choose Rider --</option>
                {couriers.map((courier) => (
                  <option key={courier.id} value={courier.id}>
                    🏍️ {courier.name} ({courier.vehicleType})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

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
          disabled={isLoading || (isDataUnchanged && !isCourierUnselected)}
          className="w-full inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: themeColor }}
        >
          {isLoading ? "Executing transaction layer..." : "Save Status Updates"}
        </button>
      </div>
    </div>
  );
}
