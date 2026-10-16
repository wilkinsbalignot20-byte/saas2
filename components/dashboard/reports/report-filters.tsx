 "use client";

import React from "react";
import { DEFAULT_RANGE, DEFAULT_TENANT } from "./report-utils";

interface ReportFiltersProps {
  selectedTenant: string;
  setSelectedTenant: (tenant: string) => void;
  dateRange: string;
  setDateRange: (range: string) => void;
}

const selectClass =
  "h-10 min-w-[11rem] rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 shadow-sm " +
  "transition-colors hover:border-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30";

export default function ReportFilters({
  selectedTenant,
  setSelectedTenant,
  dateRange,
  setDateRange,
}: ReportFiltersProps) {
  // 📝 PATANDAAN (BAGO): Reset button para mabilis bumalik sa default filters.
  const isFiltered = selectedTenant !== DEFAULT_TENANT || dateRange !== DEFAULT_RANGE;

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Tenant Dropdown */}
      <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
        Tenant / Store
        {/* 📝 PATANDAAN: Naka-hardcode pa ang listahan ng tenants. Dapat galing sa database
            para kusa itong lumaki kapag may bagong tenant. */}
        <select
          className={selectClass}
          value={selectedTenant}
          onChange={(e) => setSelectedTenant(e.target.value)}
        >
          <option value="all">All Tenants / Stores</option>
          <option value="alpha">Alpha Store</option>
          <option value="beta">Beta Boutique</option>
        </select>
      </label>

      {/* Date Range Dropdown */}
      <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
        Date range
        <select
          className={selectClass}
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </label>

      {isFiltered && (
        <button
          type="button"
          onClick={() => {
            setSelectedTenant(DEFAULT_TENANT);
            setDateRange(DEFAULT_RANGE);
          }}
          className="h-10 rounded-lg px-3 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40"
        >
          Reset filters
        </button>
      )}
    </div>
  );
}