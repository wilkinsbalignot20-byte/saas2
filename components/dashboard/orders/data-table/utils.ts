// components/dashboard/orders/data-table/utils.ts
import type { SerializedOrder, SortDir, SortKey } from "./types";

export const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

export const formatOrderDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });

interface FilterOptions {
  search: string;
  status: string;
  payment: string;
  sortKey: SortKey;
  sortDir: SortDir;
}

/** Search + filter + sort ng orders (pure function, madaling i-test) */
export function filterAndSortOrders(orders: SerializedOrder[], opts: FilterOptions) {
  const term = opts.search.trim().toLowerCase();

  const rows = orders.filter((o) => {
    const matchesSearch =
      !term ||
      o.orderNumber.toLowerCase().includes(term) ||
      o.customerName.toLowerCase().includes(term) ||
      o.customerEmail.toLowerCase().includes(term);
    const matchesStatus = opts.status === "all" || o.shippingStatus === opts.status;
    const matchesPayment = opts.payment === "all" || o.paymentStatus === opts.payment;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  rows.sort((a, b) => {
    const av = opts.sortKey === "date" ? Date.parse(a.createdAt) : Number(a.totalAmount);
    const bv = opts.sortKey === "date" ? Date.parse(b.createdAt) : Number(b.totalAmount);
    return opts.sortDir === "asc" ? av - bv : bv - av;
  });

  return rows;
}