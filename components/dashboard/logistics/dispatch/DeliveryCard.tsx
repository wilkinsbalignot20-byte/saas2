// components/dashboard/logistics/dispatch/DeliveryCard.tsx
"use client";

import { fmtPeso } from "@/components/dashboard/marketing/shared";
import DeliveryHeader from "./DeliveryHeader";
import DeliveryDetails from "./DeliveryDetails";
import QueueActions from "./QueueActions";
import TransitActions from "./TransitActions";
import DeliveredInfo from "./DeliveredInfo";
import { isUnpaid, type Courier, type Delivery } from "../utils";
import type { DispatchView, RunAction } from "./types";

interface Props {
  order: Delivery;
  view: DispatchView;
  busy: boolean;
  copied: boolean;
  assignable: Courier[];
  riderId: string;
  pickupAddress: string;
  storeName: string;
  onRiderChange: (courierId: string) => void;
  onRun: RunAction;
  onCopy: () => void;
}

/** Isang delivery: header + details + actions depende sa tab */
export default function DeliveryCard({
  order,
  view,
  busy,
  copied,
  assignable,
  riderId,
  pickupAddress,
  storeName,
  onRiderChange,
  onRun,
  onCopy,
}: Props) {
  const unpaid = isUnpaid(order);
  const amount = fmtPeso(Number(order.totalAmount));

  return (
    <li className="space-y-4 p-4 sm:p-5">
      <DeliveryHeader order={order} unpaid={unpaid} amount={amount} />
      <DeliveryDetails order={order} />

      {view === "queue" && (
        <QueueActions
          order={order}
          busy={busy}
          copied={copied}
          assignable={assignable}
          riderId={riderId}
          onRiderChange={onRiderChange}
          onRun={onRun}
          onCopy={onCopy}
        />
      )}
      {view === "transit" && (
        <TransitActions
          order={order}
          busy={busy}
          copied={copied}
          unpaid={unpaid}
          amount={amount}
          pickupAddress={pickupAddress}
          storeName={storeName}
          onRun={onRun}
          onCopy={onCopy}
        />
      )}
      {view === "delivered" && <DeliveredInfo order={order} />}
    </li>
  );
}