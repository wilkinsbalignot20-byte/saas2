// components/dashboard/logistics/dispatch/useDispatch.ts
"use client";

import { useMemo, useState } from "react";
import { sendJson } from "@/components/dashboard/marketing/shared";
import { buildRiderMessage, type Courier, type Delivery } from "../utils";
import { filterDeliveries, getAssignableCouriers, groupDeliveries } from "./utils";
import type { DispatchView, NoticeState } from "./types";

interface Options {
  slug: string;
  storeName: string;
  pickupAddress: string;
  deliveries: Delivery[];
  couriers: Courier[];
  onChanged: () => Promise<void>;
}

/** Lahat ng state, derived lists, at actions ng Dispatch tab */
export function useDispatch({ slug, storeName, pickupAddress, deliveries, couriers, onChanged }: Options) {
  const [view, setView] = useState<DispatchView>("queue");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeState>(null);

  const url = `/api/stores/${slug}/deliveries`;

  const groups = useMemo(() => groupDeliveries(deliveries), [deliveries]);
  const visible = useMemo(() => filterDeliveries(groups[view], search), [groups, view, search]);
  const assignable = useMemo(() => getAssignableCouriers(couriers), [couriers]);
  const soleAvailable = assignable.filter((c) => c.status === "available");

  const run = async (order: Delivery, body: Record<string, unknown>, successText: string) => {
    setBusyId(order.id);
    setNotice(null);
    try {
      await sendJson(url, "PATCH", { orderId: order.id, ...body });
      setNotice({ kind: "success", text: successText });
      await onChanged();
    } catch (err: any) {
      setNotice({ kind: "error", text: err.message });
    } finally {
      setBusyId(null);
    }
  };

  const copyMessage = async (order: Delivery) => {
    try {
      await navigator.clipboard.writeText(buildRiderMessage(order, pickupAddress, storeName));
      setCopiedId(order.id);
      setTimeout(() => setCopiedId((id) => (id === order.id ? null : id)), 1800);
    } catch {
      setNotice({ kind: "error", text: "Couldn't copy to clipboard. Please allow clipboard access." });
    }
  };

  // Kung isa lang ang available na rider, automatic na siya ang pre-selected
  const riderFor = (order: Delivery) => selected[order.id] ?? (soleAvailable.length === 1 ? soleAvailable[0].id : "");
  const selectRider = (orderId: string, courierId: string) => setSelected((s) => ({ ...s, [orderId]: courierId }));

  return {
    view,
    setView,
    search,
    setSearch,
    notice,
    setNotice,
    groups,
    visible,
    assignable,
    busyId,
    copiedId,
    riderFor,
    selectRider,
    run,
    copyMessage,
  };
}