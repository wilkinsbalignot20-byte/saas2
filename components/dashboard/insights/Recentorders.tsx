// components/dashboard/insights/RecentOrders.tsx
import Link from "next/link";
import { ReceiptText } from "lucide-react";
import CardShell, { CardEmpty, SkeletonRows } from "./Cardshell";
import { fmtPeso } from "@/components/dashboard/marketing/shared";
import type { InsightsData } from "./types";

const PAYMENT: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  failed: "bg-red-50 text-red-700",
  refunded: "bg-violet-50 text-violet-700",
};
const SHIPPING: Record<string, string> = {
  unfulfilled: "bg-slate-100 text-slate-700",
  shipped: "bg-blue-50 text-blue-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function RecentOrders({
  orders,
  slug,
  loading,
}: {
  orders: InsightsData["recentOrders"] | undefined;
  slug: string;
  loading: boolean;
}) {
  return (
    <CardShell
      title="Recent orders"
      description="The latest orders from your store."
      icon={<ReceiptText size={18} />}
      action={
        <Link href={`/dashboard/${slug}/orders`} className="text-xs font-semibold text-slate-500 hover:text-slate-900">
          View all
        </Link>
      }
    >
      {loading ? (
        <SkeletonRows rows={4} />
      ) : !orders || orders.length === 0 ? (
        <CardEmpty>No orders yet.</CardEmpty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.id} className="transition-colors hover:bg-slate-50">
                  <td className="py-3 pr-3">
                    <Link href={`/dashboard/${slug}/orders/${o.id}`} className="font-semibold text-slate-900 hover:underline">
                      {o.orderNumber}
                    </Link>
                    <p className="truncate text-xs text-slate-500">{o.customerName}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-500">
                    {new Date(o.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${PAYMENT[o.paymentStatus] ?? "bg-slate-100 text-slate-600"}`}>
                      {cap(o.paymentStatus)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${SHIPPING[o.shippingStatus] ?? "bg-slate-100 text-slate-600"}`}>
                      {cap(o.shippingStatus)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-3 text-right font-semibold text-slate-900 tabular-nums">
                    {fmtPeso(o.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CardShell>
  );
}