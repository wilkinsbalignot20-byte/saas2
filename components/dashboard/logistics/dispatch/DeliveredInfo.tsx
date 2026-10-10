// components/dashboard/logistics/dispatch/DeliveredInfo.tsx
import { PackageCheck } from "lucide-react";
import { timeAgo, type Delivery } from "../utils";

export default function DeliveredInfo({ order }: { order: Delivery }) {
  return (
    <p className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
      <PackageCheck size={16} className="text-emerald-600" />
      Delivered {timeAgo(order.deliveredAt)}
      {order.courier && <span>by {order.courier.name}</span>}
    </p>
  );
}