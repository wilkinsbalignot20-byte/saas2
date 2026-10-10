// components/dashboard/logistics/dispatch/DispatchEmptyState.tsx
"use client";

import { PackageCheck, Truck, Clock } from "lucide-react";
import { EmptyState } from "@/components/dashboard/marketing/shared";
import type { DispatchView } from "./types";

const COPY: Record<DispatchView, { icon: React.ReactNode; title: string; description: string }> = {
  queue: {
    icon: <PackageCheck size={22} />,
    title: "No orders waiting for a rider",
    description: "New orders that still need a rider will show up here automatically.",
  },
  transit: {
    icon: <Truck size={22} />,
    title: "Nothing out for delivery",
    description: "Orders you dispatch will appear here until they're delivered.",
  },
  delivered: {
    icon: <Clock size={22} />,
    title: "No recent deliveries",
    description: "Orders delivered in the last 3 days will appear here.",
  },
};

export default function DispatchEmptyState({ view, hasSearch }: { view: DispatchView; hasSearch: boolean }) {
  const c = COPY[view];
  return (
    <EmptyState
      icon={c.icon}
      title={hasSearch ? "No matches" : c.title}
      description={hasSearch ? "Try a different search." : c.description}
    />
  );
}