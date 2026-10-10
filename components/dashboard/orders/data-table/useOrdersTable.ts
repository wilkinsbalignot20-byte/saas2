// components/dashboard/orders/data-table/useOrdersTable.ts
"use client";

import { useMemo, useState } from "react";
import { PAGE_SIZE } from "./constants";
import { filterAndSortOrders } from "./utils";
import type { SerializedOrder, SortDir, SortKey } from "./types";

/** Lahat ng state, filtering, sorting, at pagination ng orders table */
export function useOrdersTable(orders: SerializedOrder[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  // Tab counts (hindi apektado ng search para stable ang numbers)
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const o of orders) c[o.shippingStatus] = (c[o.shippingStatus] ?? 0) + 1;
    return c;
  }, [orders]);

  const filtered = useMemo(
    () =>
      filterAndSortOrders(orders, {
        search: searchTerm,
        status: statusFilter,
        payment: paymentFilter,
        sortKey,
        sortDir,
      }),
    [orders, searchTerm, statusFilter, paymentFilter, sortKey, sortDir]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all" || paymentFilter !== "all";

  // Bawat pagbabago ng filter ay bumabalik sa page 1
  const changeSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };
  const changeStatus = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };
  const changePayment = (value: string) => {
    setPaymentFilter(value);
    setPage(1);
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setPage(1);
  };

  return {
    // filters
    searchTerm,
    statusFilter,
    paymentFilter,
    hasActiveFilters,
    changeSearch,
    changeStatus,
    changePayment,
    clearFilters,
    // sorting
    sortKey,
    sortDir,
    toggleSort,
    // data
    counts,
    totalFiltered: filtered.length,
    pageRows,
    // pagination
    currentPage,
    totalPages,
    start,
    goToPage: setPage,
  };
}