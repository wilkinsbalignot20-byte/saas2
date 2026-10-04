// components/dashboard/logistics/DispatchTab.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Phone,
  Copy,
  Check,
  Truck,
  PackageCheck,
  RotateCcw,
  MessageSquare,
  Map as MapIcon,
  Bike,
  Clock,
  UserPlus,
  Wallet,
} from "lucide-react";
import {
  Panel,
  Notice,
  FilterTabs,
  EmptyState,
  ListSkeleton,
  inputClass,
  btnPrimary,
  btnSecondary,
  sendJson,
  fmtPeso,
} from "@/components/dashboard/marketing/shared";
import {
  buildRiderMessage,
  isUnpaid,
  itemLine,
  timeAgo,
  type Courier,
  type Delivery,
} from "./utils";

interface DispatchTabProps {
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

type View = "queue" | "transit" | "delivered";

export default function DispatchTab({
  slug,
  storeName,
  pickupAddress,
  deliveries,
  couriers,
  loading,
  error,
  onChanged,
  onGoToRiders,
}: DispatchTabProps) {
  const [view, setView] = useState<View>("queue");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const url = `/api/stores/${slug}/deliveries`;

  const groups = useMemo(() => {
    const queue = deliveries
      .filter((d) => d.shippingStatus === "unfulfilled")
      .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)); // pinakamatagal na naghihintay, una
    const transit = deliveries
      .filter((d) => d.shippingStatus === "shipped")
      .sort((a, b) => +new Date(a.dispatchedAt ?? a.createdAt) - +new Date(b.dispatchedAt ?? b.createdAt));
    const delivered = deliveries
      .filter((d) => d.shippingStatus === "delivered")
      .sort((a, b) => +new Date(b.deliveredAt ?? 0) - +new Date(a.deliveredAt ?? 0));
    return { queue, transit, delivered };
  }, [deliveries]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return groups[view].filter(
      (d) =>
        !term ||
        d.orderNumber.toLowerCase().includes(term) ||
        d.customerName.toLowerCase().includes(term) ||
        d.customerPhone.includes(term) ||
        d.shippingAddress.toLowerCase().includes(term) ||
        (d.courier?.name.toLowerCase().includes(term) ?? false)
    );
  }, [groups, view, search]);

  // Mga rider na pwedeng pagbigyan ng order (available muna sa listahan)
  const assignable = useMemo(
    () =>
      couriers
        .filter((c) => c.status !== "inactive")
        .sort((a, b) => (a.status === b.status ? a.name.localeCompare(b.name) : a.status === "available" ? -1 : 1)),
    [couriers]
  );
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

  const riderFor = (order: Delivery) =>
    selected[order.id] ?? (soleAvailable.length === 1 ? soleAvailable[0].id : "");

  return (
    <Panel>
      {/* TOOLBAR */}
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <FilterTabs
          value={view}
          onChange={(k) => setView(k as View)}
          options={[
            { key: "queue", label: "To dispatch", count: groups.queue.length },
            { key: "transit", label: "Out for delivery", count: groups.transit.length },
            { key: "delivered", label: "Delivered (3 days)", count: groups.delivered.length },
          ]}
        />
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order, customer, address"
            aria-label="Search deliveries"
            className={`${inputClass} pl-9`}
          />
        </div>
      </div>

      {notice && (
        <div className="px-4 pt-4 sm:px-5">
          <Notice kind={notice.kind} onClose={() => setNotice(null)}>
            {notice.text}
          </Notice>
        </div>
      )}

      {view === "queue" && couriers.length === 0 && !loading && (
        <div className="mx-4 mt-4 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 sm:mx-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-amber-900">
            You haven&apos;t added any riders yet. Add at least one rider so you can assign orders.
          </p>
          <button type="button" onClick={onGoToRiders} className={`${btnSecondary} shrink-0`}>
            <UserPlus size={16} /> Add a rider
          </button>
        </div>
      )}

      {loading ? (
        <ListSkeleton />
      ) : error ? (
        <div className="p-4 sm:p-5">
          <Notice kind="error">{error}</Notice>
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={view === "queue" ? <PackageCheck size={22} /> : view === "transit" ? <Truck size={22} /> : <Clock size={22} />}
          title={
            search
              ? "No matches"
              : view === "queue"
              ? "No orders waiting for a rider"
              : view === "transit"
              ? "Nothing out for delivery"
              : "No recent deliveries"
          }
          description={
            search
              ? "Try a different search."
              : view === "queue"
              ? "New orders that still need a rider will show up here automatically."
              : view === "transit"
              ? "Orders you dispatch will appear here until they're delivered."
              : "Orders delivered in the last 3 days will appear here."
          }
        />
      ) : (
        <ul className="divide-y divide-slate-100">
          {visible.map((order) => {
            const busy = busyId === order.id;
            const unpaid = isUnpaid(order);
            const amount = fmtPeso(Number(order.totalAmount));
            const items = order.orderItems.map(itemLine);
            const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.shippingAddress)}`;
            const smsUrl = order.courier
              ? `sms:${order.courier.phone}?body=${encodeURIComponent(buildRiderMessage(order, pickupAddress, storeName))}`
              : "";

            return (
              <li key={order.id} className="space-y-4 p-4 sm:p-5">
                {/* TOP: order + payment */}
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

                {/* DETAILS */}
                <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="flex items-start gap-2">
                      <MapPin size={15} className="mt-0.5 shrink-0 text-slate-400" />
                      <span className="line-clamp-3">{order.shippingAddress}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pl-[23px] text-xs font-medium">
                      <a href={`tel:${order.customerPhone}`} className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900">
                        <Phone size={12} /> {order.customerPhone}
                      </a>
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900">
                        <MapIcon size={12} /> Open in Maps
                      </a>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-400">
                      {order.orderItems.reduce((n, i) => n + i.quantity, 0)} item(s)
                    </p>
                    <p className="text-slate-700" title={items.join(", ")}>
                      {items.slice(0, 2).join(", ")}
                      {items.length > 2 && <span className="text-slate-400"> +{items.length - 2} more</span>}
                    </p>
                    {order.notes && <p className="text-xs italic text-slate-500">Note: {order.notes}</p>}
                  </div>
                </div>

                {/* ACTIONS */}
                {view === "queue" && (
                  <div className="flex flex-col gap-2 rounded-lg bg-slate-50 p-3 sm:flex-row sm:items-center">
                    <select
                      aria-label={`Choose a rider for ${order.orderNumber}`}
                      value={riderFor(order)}
                      onChange={(e) => setSelected((s) => ({ ...s, [order.id]: e.target.value }))}
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
                      disabled={busy || !riderFor(order)}
                      onClick={() => run(order, { action: "assign", courierId: riderFor(order) }, `${order.orderNumber} dispatched.`)}
                      className={btnPrimary}
                    >
                      <Truck size={16} />
                      {busy ? "Dispatching..." : "Dispatch"}
                    </button>
                    <button type="button" onClick={() => copyMessage(order)} className={`${btnSecondary} sm:ml-auto`}>
                      {copiedId === order.id ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                      {copiedId === order.id ? "Copied" : "Copy rider message"}
                    </button>
                  </div>
                )}

                {view === "transit" && (
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
                              run(order, { action: "deliver", cashCollected: true }, `${order.orderNumber} delivered. ${amount} marked as collected.`)
                            }
                            className={btnPrimary}
                          >
                            <PackageCheck size={16} /> Delivered, {amount} collected
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => run(order, { action: "deliver" }, `${order.orderNumber} marked as delivered.`)}
                            className={btnSecondary}
                          >
                            Delivered, not collected
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => run(order, { action: "deliver" }, `${order.orderNumber} marked as delivered.`)}
                          className={btnPrimary}
                        >
                          <PackageCheck size={16} /> Mark delivered
                        </button>
                      )}
                      <button type="button" onClick={() => copyMessage(order)} className={btnSecondary}>
                        {copiedId === order.id ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                        {copiedId === order.id ? "Copied" : "Copy message"}
                      </button>
                      {smsUrl && (
                        <a href={smsUrl} className={btnSecondary}>
                          <MessageSquare size={16} /> Text rider
                        </a>
                      )}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => run(order, { action: "unassign" }, `${order.orderNumber} returned to the queue.`)}
                        className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-slate-800 disabled:opacity-50 sm:ml-auto"
                      >
                        <RotateCcw size={15} /> Return to queue
                      </button>
                    </div>
                  </div>
                )}

                {view === "delivered" && (
                  <p className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <PackageCheck size={16} className="text-emerald-600" />
                    Delivered {timeAgo(order.deliveredAt)}
                    {order.courier && <span>by {order.courier.name}</span>}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}