 // components/dashboard/logistics/DispatchTab.tsx
"use client";

import { Panel, Notice, ListSkeleton } from "@/components/dashboard/marketing/shared";
import DispatchToolbar from "./dispatch/DispatchToolbar";
import NoRidersBanner from "./dispatch/NoRidersBanner";
import DispatchEmptyState from "./dispatch/DispatchEmptyState";
import DeliveryCard from "./dispatch/DeliveryCard";
import { useDispatch } from "./dispatch/useDispatch";
import type { DispatchTabProps } from "./dispatch/types";

export default function DispatchTab({
  slug,
  storeName,
  pickupAddress,
  deliveries,
  couriers,
  loading,
  error,
  onChanged,
  // 1. Kumpirmadong BURADO na si onGoToRiders dito sa listahan
}: Omit<DispatchTabProps, 'onGoToRiders'>) { 
  const d = useDispatch({ slug, storeName, pickupAddress, deliveries, couriers, onChanged });

  return (
    <Panel>
      <DispatchToolbar
        view={d.view}
        onViewChange={d.setView}
        search={d.search}
        onSearchChange={d.setSearch}
        counts={{ queue: d.groups.queue.length, transit: d.groups.transit.length, delivered: d.groups.delivered.length }}
      />

      {d.notice && (
        <div className="px-4 pt-4 sm:px-5">
          <Notice kind={d.notice.kind} onClose={() => d.setNotice(null)}>
            {d.notice.text}
          </Notice>
        </div>
      )}

      {/* 2. Malinis na tinawag ang NoRidersBanner nang walang kahit anong props */}
      {d.view === "queue" && couriers.length === 0 && !loading && <NoRidersBanner />}

      {loading ? (
        <ListSkeleton />
      ) : error ? (
        <div className="p-4 sm:p-5">
          <Notice kind="error">{error}</Notice>
        </div>
      ) : d.visible.length === 0 ? (
        <DispatchEmptyState view={d.view} hasSearch={Boolean(d.search)} />
      ) : (
        <ul className="divide-y divide-slate-100">
          {d.visible.map((order) => (
            <DeliveryCard
              key={order.id}
              order={order}
              view={d.view}
              busy={d.busyId === order.id}
              copied={d.copiedId === order.id}
              assignable={d.assignable}
              riderId={d.riderFor(order)}
              pickupAddress={pickupAddress}
              storeName={storeName}
              onRiderChange={(courierId) => d.selectRider(order.id, courierId)}
              onRun={d.run}
              onCopy={() => d.copyMessage(order)}
            />
          ))}
        </ul>
      )}
    </Panel>
  );
}
