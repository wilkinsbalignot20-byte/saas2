 // components/dashboard/orders/data-table/OrdersToolbar.tsx
import { Search, FileSpreadsheet } from "lucide-react";
import { PAYMENT_OPTIONS, FULFILLMENT_TABS } from "./constants";
import { exportOrdersToExcel } from "./excelUtils";
import type { SerializedOrder } from "./types";

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  paymentFilter: string;
  onPaymentChange: (value: string) => void;
  hasActiveFilters: boolean;
  onClear: () => void;
  // 🟢 BAGO: Ipinasa natin ang active data at active tab para sa Excel integration
  filteredRows: SerializedOrder[];
  statusFilter: string;
}

export default function OrdersToolbar({
  searchTerm,
  onSearchChange,
  paymentFilter,
  onPaymentChange,
  hasActiveFilters,
  onClear,
  filteredRows,
  statusFilter,
}: Props) {
  // Kunin ang pormal na pangalan ng kasalukuyang active tab para sa file naming layout (e.g., "Payment Review")
  const activeTabObj = FULFILLMENT_TABS.find((t) => t.key === statusFilter);
  const currentTabLabel = activeTabObj ? activeTabObj.label : "All";

  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
      {/* SEARCH BAR */}
      <div className="relative w-full sm:max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="search"
          placeholder="Search order #, customer, or email"
          aria-label="Search orders"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-950"
        />
      </div>

      {/* FILTERS & EXPORT ACTIONS */}
      <div className="flex items-center gap-2">
        <select
          value={paymentFilter}
          onChange={(e) => onPaymentChange(e.target.value)}
          aria-label="Filter by payment status"
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
        >
          {PAYMENT_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>

        {/* 📊 BAGO: ANG EXCEL EXPORT BUTTON (May Lucide Icon at match sa styling mo) */}
        <button
          type="button"
          onClick={() => exportOrdersToExcel(filteredRows, currentTabLabel)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          <FileSpreadsheet size={16} className="text-emerald-600 dark:text-emerald-500" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="h-10 rounded-lg px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
