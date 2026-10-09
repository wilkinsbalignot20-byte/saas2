// components/dashboard/marketing/voucher/VoucherToolbar.tsx
"use client";

import { Search } from "lucide-react";
import { FilterTabs, inputClass } from "../shared";

interface Props {
  filter: string;
  onFilterChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  counts: { all: number; active: number; inactive: number; ended: number };
}

export default function VoucherToolbar({ filter, onFilterChange, search, onSearchChange, counts }: Props) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <FilterTabs
        value={filter}
        onChange={onFilterChange}
        options={[
          { key: "all", label: "All", count: counts.all },
          { key: "active", label: "Active", count: counts.active },
          { key: "inactive", label: "Inactive", count: counts.inactive },
          { key: "ended", label: "Ended", count: counts.ended },
        ]}
      />
      <div className="relative w-full sm:max-w-xs">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by code"
          aria-label="Search vouchers by code"
          className={`${inputClass} pl-9`}
        />
      </div>
    </div>
  );
}