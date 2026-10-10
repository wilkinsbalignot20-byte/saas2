// components/dashboard/logistics/dispatch/QueueActions.tsx
"use client";

import { Truck } from "lucide-react";
import { inputClass, btnPrimary } from "@/components/dashboard/marketing/shared";
import CopyMessageButton from "./CopyMessageButton";
import type { Courier, Delivery } from "../utils";
import type { RunAction } from "./types";

interface Props {
  order: Delivery;
  busy: boolean;
  copied: boolean;
  assignable: Courier[];
  riderId: string;
  onRiderChange: (courierId: string) => void;
  onRun: RunAction;
  onCopy: () => void;
}

/** "To dispatch" tab: pumili ng rider at i-dispatch */
export default function QueueActions({ order, busy, copied, assignable, riderId, onRiderChange, onRun, onCopy }: Props) {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-slate-50 p-3 sm:flex-row sm:items-center">
      <select
        aria-label={`Choose a rider for ${order.orderNumber}`}
        value={riderId}
        onChange={(e) => onRiderChange(e.target.value)}
        disabled={busy || assignable.length === 0}
        className={`${inputClass} sm:max-w-xs`}
      >
        <option value="">{assignable.length === 0 ? "No riders on duty" : "Choose a rider"}</option>
        {assignable.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} · {c.vehicleType}
            {c.status === "busy" ? ` (${c.activeDeliveries ?? 0} on the road)` : " (free)"}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={busy || !riderId}
        onClick={() => onRun(order, { action: "assign", courierId: riderId }, `${order.orderNumber} dispatched.`)}
        className={btnPrimary}
      >
        <Truck size={16} />
        {busy ? "Dispatching..." : "Dispatch"}
      </button>
      <CopyMessageButton copied={copied} label="Copy rider message" onClick={onCopy} className="sm:ml-auto" />
    </div>
  );
}