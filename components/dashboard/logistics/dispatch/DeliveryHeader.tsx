// components/dashboard/logistics/dispatch/DeliveryHeader.tsx
import { Wallet } from "lucide-react";
import { timeAgo, type Delivery } from "../utils";

interface Props {
  order: Delivery;
  unpaid: boolean;
  amount: string;
}

/** Itaas ng card: order number, customer, at payment badge */
export default function DeliveryHeader({ order, unpaid, amount }: Props) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-slate-900">{order.orderNumber}</span>
          <span className="text-xs text-slate-400">Ordered {timeAgo(order.createdAt)}</span>
        </div>
        <p className="mt-1 text-sm font-semibold text-slate-800">{order.customerName}</p>
      </div>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
          unpaid
            ? "bg-amber-50 text-amber-800 ring-amber-600/20"
            : "bg-emerald-50 text-emerald-700 ring-emerald-600/15"
        }`}
      >
        <Wallet size={13} />
        {unpaid ? `Collect ${amount}` : `Paid ${amount}`}
      </span>
    </div>
  );
}