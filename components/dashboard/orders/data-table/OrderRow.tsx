// components/dashboard/orders/data-table/OrderRow.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusBadge from "./StatusBadge";
import { PAYMENT_STYLES, SHIPPING_STYLES } from "./constants";
import { formatOrderDate, peso } from "./utils";
import type { SerializedOrder } from "./types";

interface Props {
  order: SerializedOrder;
  slug: string;
}

export default function OrderRow({ order, slug }: Props) {
  const router = useRouter();

  const href = `/dashboard/${slug}/orders/${order.id}`;
  const itemCount = order.orderItems.reduce((acc, item) => acc + item.quantity, 0);
  const initial = (order.customerName || "?").trim().charAt(0).toUpperCase();

  return (
    <tr
      onClick={() => router.push(href)}
      className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
    >
      <td className="whitespace-nowrap px-4 py-3.5 sm:px-6">
        <Link
          href={href}
          onClick={(e) => e.stopPropagation()}
          className="font-semibold text-slate-900 hover:underline dark:text-white"
        >
          {order.orderNumber}
        </Link>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {initial}
          </span>
          <div className="min-w-0">
            <div className="truncate font-medium text-slate-900 dark:text-slate-100">{order.customerName}</div>
            <div className="truncate text-xs text-slate-500 dark:text-slate-400">{order.customerEmail}</div>
          </div>
        </div>
      </td>
      <td className="hidden whitespace-nowrap px-4 py-3.5 text-slate-600 tabular-nums dark:text-slate-300 lg:table-cell">
        {itemCount} {itemCount === 1 ? "item" : "items"}
      </td>
      <td className="whitespace-nowrap px-4 py-3.5">
        <StatusBadge status={order.paymentStatus} styles={PAYMENT_STYLES} />
      </td>
      <td className="whitespace-nowrap px-4 py-3.5">
        <StatusBadge status={order.shippingStatus} styles={SHIPPING_STYLES} />
      </td>
      <td className="whitespace-nowrap px-4 py-3.5 text-right font-semibold text-slate-900 tabular-nums dark:text-slate-100">
        {peso.format(Number(order.totalAmount))}
      </td>
      <td
        className="whitespace-nowrap px-4 py-3.5 text-right text-slate-500 dark:text-slate-400 sm:px-6"
        suppressHydrationWarning
      >
        {formatOrderDate(order.createdAt)}
      </td>
    </tr>
  );
}