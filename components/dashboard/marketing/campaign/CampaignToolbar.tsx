// components/dashboard/marketing/campaign/CampaignToolbar.tsx
"use client";

import { Search } from "lucide-react";
import { FilterTabs, inputClass } from "../shared";

interface Props {
  filter: string;
  onFilterChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  counts: { all: number; ACTIVE: number; UPCOMING: number; ENDED: number };
}

export default function CampaignToolbar({ filter, onFilterChange, search, onSearchChange, counts }: Props) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <FilterTabs
        value={filter}
        onChange={onFilterChange}
        options={[
          { key: "all", label: "All", count: counts.all },
          { key: "ACTIVE", label: "Active", count: counts.ACTIVE },
          { key: "UPCOMING", label: "Upcoming", count: counts.UPCOMING },
          { key: "ENDED", label: "Ended", count: counts.ENDED },
        ]}
      />
      <div className="relative w-full sm:max-w-xs">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search campaigns"
          aria-label="Search campaigns"
          className={`${inputClass} pl-9`}
        />
      </div>
    </div>
  );
}