// components/dashboard/orders/data-table/OrdersEmptyState.tsx
import { PackageOpen } from "lucide-react";

interface Props {
  hasOrders: boolean;
  hasActiveFilters: boolean;
  themeColor: string;
  onClear: () => void;
}

export default function OrdersEmptyState({ hasOrders, hasActiveFilters, themeColor, onClear }: Props) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
        <PackageOpen size={22} />
      </span>
      <p className="text-sm font-semibold text-slate-900 dark:text-white">
        {hasOrders ? "No orders match your filters" : "No orders yet"}
      </p>
      <p className="max-w-xs text-sm text-slate-500 dark:text-slate-400">
        {hasOrders ? "Try a different search or clear the filters." : "New orders from your storefront will show up here."}
      </p>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: themeColor }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}