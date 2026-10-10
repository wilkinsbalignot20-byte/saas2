// components/dashboard/orders/data-table/OrdersToolbar.tsx
import { Search } from "lucide-react";
import { PAYMENT_OPTIONS } from "./constants";

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  paymentFilter: string;
  onPaymentChange: (value: string) => void;
  hasActiveFilters: boolean;
  onClear: () => void;
}

export default function OrdersToolbar({
  searchTerm,
  onSearchChange,
  paymentFilter,
  onPaymentChange,
  hasActiveFilters,
  onClear,
}: Props) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
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