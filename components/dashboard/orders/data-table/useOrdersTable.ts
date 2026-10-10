 // components/dashboard/orders/data-table/useOrdersTable.ts
"use client";

import { useMemo, useState } from "react";
import { PAGE_SIZE } from "./constants";
import { filterAndSortOrders } from "./utils"; // Siguraduhing na-update mo rin ang utils.ts sa ibaba nito
import type { SerializedOrder, SortDir, SortKey } from "./types";

/** Lahat ng state, filtering, sorting, at pagination ng orders table */
export function useOrdersTable(orders: SerializedOrder[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  // Tab counts (Smart tracking para sa mga bago at lumang tabs)
  const counts = useMemo(() => {
    const c: Record<string, number> = {
      all: orders.length,
      DRAFT: 0,
      PENDING_ORDER: 0,
      PAYMENT_REVIEW: 0,
      FAILED: 0,
      UNFULFILLED: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      RETURN_BAR: 0,
      CANCELLED: 0,
    };

    for (const o of orders) {
      // Mag-ingat sa capitalization ng incoming string from DB
      const shipping = (o.shippingStatus || "").toUpperCase();
      const payment = (o.paymentStatus || "").toUpperCase();

      // 1. Core structural assignments
      if (shipping === "DRAFT") c.DRAFT++;
      if (shipping === "SHIPPED") c.SHIPPED++;
      if (shipping === "DELIVERED") c.DELIVERED++;
      if (shipping === "CANCELLED") c.CANCELLED++;

      // 2. Specialized Tab Counting
      if (payment === "PAYMENT_REVIEW") {
        c.PAYMENT_REVIEW++;
      }
      if (payment === "FAILED") {
        c.FAILED++;
      }
      
      // Pending Tab: Unfulfilled ang delivery pero pending pa ang payment at hindi draft
      if (payment === "PENDING" && shipping === "UNFULFILLED") {
        c.PENDING_ORDER++;
      }

      // Unfulfilled Tab: Yung mga kailangan i-pack/ship pero hindi bagsak o for review ang bayad
      if (shipping === "UNFULFILLED" && payment !== "FAILED" && payment !== "PAYMENT_REVIEW") {
        c.UNFULFILLED++;
      }

      // Return Tab: Pinagsamang REQUESTED at RETURNED states
      if (shipping === "RETURN_REQUESTED" || shipping === "RETURNED") {
        c.RETURN_BAR++;
      }
    }
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
    searchTerm,
    statusFilter,
    paymentFilter,
    hasActiveFilters,
    changeSearch,
    changeStatus,
    changePayment,
    clearFilters,
    sortKey,
    sortDir,
    toggleSort,
    counts,
    totalFiltered: filtered.length,
    pageRows,
    currentPage,
    totalPages,
    start,
    goToPage: setPage,
  };
}
