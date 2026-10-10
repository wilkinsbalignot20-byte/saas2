 // components/dashboard/logistics/dispatch/types.ts
import type { Courier, Delivery } from "../utils";

export interface DispatchTabProps {
  slug: string;
  storeName: string;
  pickupAddress: string;
  deliveries: Delivery[];
  couriers: Courier[];
  loading: boolean;
  error: string | null;
  onChanged: () => Promise<void>;
  onGoToRiders: () => void;
  
}

export type DispatchView = "queue" | "transit" | "delivered";

export type NoticeState = { kind: "success" | "error"; text: string } | null;

/** Ang tatawagin ng action buttons para mag-PATCH sa API */
export type RunAction = (order: Delivery, body: Record<string, unknown>, successText: string) => void;
