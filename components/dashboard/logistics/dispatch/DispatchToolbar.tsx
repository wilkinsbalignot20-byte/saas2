// components/dashboard/logistics/dispatch/DispatchToolbar.tsx
"use client";

import { Search } from "lucide-react";
import { FilterTabs, inputClass } from "@/components/dashboard/marketing/shared";
import type { DispatchView } from "./types";

interface Props {
  view: DispatchView;
  onViewChange: (view: DispatchView) => void;
  search: string;
  onSearchChange: (value: string) => void;
  counts: Record<DispatchView, number>;
}

export default function DispatchToolbar({ view, onViewChange, search, onSearchChange, counts }: Props) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <FilterTabs
        value={view}
        onChange={(k) => onViewChange(k as DispatchView)}
        options={[
          { key: "queue", label: "To dispatch", count: counts.queue },
          { key: "transit", label: "Out for delivery", count: counts.transit },
          { key: "delivered", label: "Delivered (3 days)", count: counts.delivered },
        ]}
      />
      <div className="relative w-full sm:max-w-xs">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search order, customer, address"
          aria-label="Search deliveries"
          className={`${inputClass} pl-9`}
        />
      </div>
    </div>
  );
}