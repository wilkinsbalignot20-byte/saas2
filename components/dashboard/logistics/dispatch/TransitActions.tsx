// components/dashboard/logistics/dispatch/TransitActions.tsx
"use client";

import { Bike, MessageSquare, PackageCheck, RotateCcw } from "lucide-react";
import { btnPrimary, btnSecondary } from "@/components/dashboard/marketing/shared";
import CopyMessageButton from "./CopyMessageButton";
import { buildRiderMessage, timeAgo, type Delivery } from "../utils";
import type { RunAction } from "./types";

interface Props {
  order: Delivery;
  busy: boolean;
  copied: boolean;
  unpaid: boolean;
  amount: string;
  pickupAddress: string;
  storeName: string;
  onRun: RunAction;
  onCopy: () => void;
}

/** "Out for delivery" tab: mark delivered, text rider, o ibalik sa queue */
export default function TransitActions({
  order,
  busy,
  copied,
  unpaid,
  amount,
  pickupAddress,
  storeName,
  onRun,
  onCopy,
}: Props) {
  const smsUrl = order.courier
    ? `sms:${order.courier.phone}?body=${encodeURIComponent(buildRiderMessage(order, pickupAddress, storeName))}`
    : "";

  return (
    <div className="space-y-3 rounded-lg bg-slate-50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="inline-flex items-center gap-2 font-semibold text-slate-800">
          <Bike size={16} className="text-slate-500" />
          {order.courier?.name ?? "Unassigned"}
          {order.courier && (
            <a href={`tel:${order.courier.phone}`} className="text-xs font-medium text-slate-500 hover:text-slate-900">
              {order.courier.phone}
            </a>
          )}
        </span>
        <span className="text-xs text-slate-500">Out {timeAgo(order.dispatchedAt)}</span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {unpaid ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                onRun(order, { action: "deliver", cashCollected: true }, `${order.orderNumber} delivered. ${amount} marked as collected.`)
              }
              className={btnPrimary}
            >
              <PackageCheck size={16} /> Delivered, {amount} collected
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onRun(order, { action: "deliver" }, `${order.orderNumber} marked as delivered.`)}
              className={btnSecondary}
            >
              Delivered, not collected
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => onRun(order, { action: "deliver" }, `${order.orderNumber} marked as delivered.`)}
            className={btnPrimary}
          >
            <PackageCheck size={16} /> Mark delivered
          </button>
        )}

        <CopyMessageButton copied={copied} label="Copy message" onClick={onCopy} />

        {smsUrl && (
          <a href={smsUrl} className={btnSecondary}>
            <MessageSquare size={16} /> Text rider
          </a>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={() => onRun(order, { action: "unassign" }, `${order.orderNumber} returned to the queue.`)}
          className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-slate-800 disabled:opacity-50 sm:ml-auto"
        >
          <RotateCcw size={15} /> Return to queue
        </button>
      </div>
    </div>
  );
}