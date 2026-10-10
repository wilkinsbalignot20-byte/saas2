// components/dashboard/orders/data-table/OrdersTable.tsx
"use client";

import OrderRow from "./OrderRow";
import OrdersEmptyState from "./OrdersEmptyState";
import SortHeader from "./SortHeader";
import type { SerializedOrder, SortDir, SortKey } from "./types";

interface Props {
  rows: SerializedOrder[];
  slug: string;
  themeColor: string;
  hasOrders: boolean;
  hasActiveFilters: boolean;
  sortKey: SortKey;
  sortDir: SortDir;
  onToggleSort: (key: SortKey) => void;
  onClearFilters: () => void;
}

export default function OrdersTable({
  rows,
  slug,
  themeColor,
  hasOrders,
  hasActiveFilters,
  sortKey,
  sortDir,
  onToggleSort,
  onClearFilters,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
            <th scope="col" className="px-4 py-3 font-semibold sm:px-6">Order</th>
            <th scope="col" className="px-4 py-3 font-semibold">Customer</th>
            <th scope="col" className="hidden px-4 py-3 font-semibold lg:table-cell">Items</th>
            <th scope="col" className="px-4 py-3 font-semibold">Payment</th>
            <th scope="col" className="px-4 py-3 font-semibold">Fulfillment</th>
            <th scope="col" className="px-4 py-3 text-right">
              <SortHeader label="Total" align="right" active={sortKey === "total"} dir={sortDir} onClick={() => onToggleSort("total")} />
            </th>
            <th scope="col" className="px-4 py-3 text-right sm:px-6">
              <SortHeader label="Date" align="right" active={sortKey === "date"} dir={sortDir} onClick={() => onToggleSort("date")} />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-16">
                <OrdersEmptyState
                  hasOrders={hasOrders}
                  hasActiveFilters={hasActiveFilters}
                  themeColor={themeColor}
                  onClear={onClearFilters}
                />
              </td>
            </tr>
          ) : (
            rows.map((order) => <OrderRow key={order.id} order={order} slug={slug} />)
          )}
        </tbody>
      </table>
    </div>
  );
}