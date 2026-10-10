 // components/dashboard/orders/OrdersDataTable.tsx
"use client";

import FulfillmentTabs from "./data-table/FulfillmentTabs";
import OrdersToolbar from "./data-table/OrdersToolbar";
import OrdersTable from "./data-table/OrdersTable";
import OrdersPagination from "./data-table/OrdersPagination";
import { useOrdersTable } from "./data-table/useOrdersTable";
import type { OrdersDataTableProps } from "./data-table/types";

// Re-export para hindi masira ang mga file na nag-i-import ng types mula dito
export type { SerializedOrder, SerializedOrderItem, OrdersDataTableProps } from "./data-table/types";

export function OrdersDataTable({ orders, themeColor, slug }: OrdersDataTableProps) {
  const t = useOrdersTable(orders);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <FulfillmentTabs value={t.statusFilter} counts={t.counts} themeColor={themeColor} onChange={t.changeStatus} />

      <OrdersToolbar
        searchTerm={t.searchTerm}
        onSearchChange={t.changeSearch}
        paymentFilter={t.paymentFilter}
        onPaymentChange={t.changePayment}
        hasActiveFilters={t.hasActiveFilters}
        onClear={t.clearFilters}
      />

      <OrdersTable
        rows={t.pageRows}
        slug={slug}
        themeColor={themeColor}
        hasOrders={orders.length > 0}
        hasActiveFilters={t.hasActiveFilters}
        sortKey={t.sortKey}
        sortDir={t.sortDir}
        onToggleSort={t.toggleSort}
        onClearFilters={t.clearFilters}
      />

      {t.totalFiltered > 0 && (
        <OrdersPagination
          start={t.start}
          total={t.totalFiltered}
          currentPage={t.currentPage}
          totalPages={t.totalPages}
          onPageChange={t.goToPage}
        />
      )}
    </div>
  );
}