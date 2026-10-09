// components/dashboard/logistics/utils.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { fmtPeso } from "@/components/dashboard/marketing/shared";

export interface Courier {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  plateNumber: string | null;
  status: "available" | "busy" | "inactive" | string;
  activeDeliveries?: number;
  deliveredCount?: number;
}

export interface DeliveryItem {
  id: string;
  productName: string;
  variantName: string;
  quantity: number;
}

export interface Delivery {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  notes: string | null;
  totalAmount: string;
  paymentStatus: string;
  shippingStatus: string;
  courierId: string | null;
  dispatchedAt: string | null;
  deliveredAt: string | null;
  courier: { id: string; name: string; phone: string } | null;
  orderItems: DeliveryItem[];
}

export const VEHICLES = ["Motorcycle", "Bicycle", "Tricycle", "E-bike", "Van"];

/** 09XXXXXXXXX | +639XXXXXXXXX | 639XXXXXXXXX | 9XXXXXXXXX -> 09XXXXXXXXX (o null kung invalid) */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, "");
  let local = digits;
  if (digits.startsWith("63") && digits.length === 12) local = "0" + digits.slice(2);
  else if (digits.length === 10 && digits.startsWith("9")) local = "0" + digits;
  return /^09\d{9}$/.test(local) ? local : null;
}

export function timeAgo(iso: string | null) {
  if (!iso) return "";
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export const itemLine = (i: DeliveryItem) =>
  `${i.quantity}x ${i.productName}${i.variantName && i.variantName !== "Standard" ? ` (${i.variantName})` : ""}`;

export const isUnpaid = (d: Delivery) => d.paymentStatus === "pending";

/** Mensaheng pwedeng i-paste sa Messenger / Viber / SMS ng rider */
export function buildRiderMessage(d: Delivery, pickupAddress: string, storeName: string) {
  const lines = [
    `${storeName} delivery ${d.orderNumber}`,
    `Pick up: ${pickupAddress}`,
    `Deliver to: ${d.customerName} (${d.customerPhone})`,
    d.shippingAddress,
    `Items: ${d.orderItems.map(itemLine).join(", ")}`,
    isUnpaid(d) ? `Collect: ${fmtPeso(Number(d.totalAmount))} (unpaid)` : "Already paid, no need to collect.",
  ];
  if (d.notes) lines.push(`Note: ${d.notes}`);
  return lines.join("\n");
}

/** Naglo-load ng listahan, nag-a-auto refresh kada 30s habang nakabukas ang tab, at may tahimik na refresh() */
export function useResource<T>(url: string, pollMs = 30_000) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to load data.");
      setData(Array.isArray(json) ? json : []);
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    // Balutin sa setTimeout na 0 para maging asynchronous ang unang takbo
    const timerId = setTimeout(() => {
      refresh();
    }, 0);

    const tick = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };

    const id = setInterval(tick, pollMs);
    document.addEventListener("visibilitychange", tick);

    return () => {
      clearTimeout(timerId);
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [refresh, pollMs]);

  return { data, setData, loading, error, refresh };
}