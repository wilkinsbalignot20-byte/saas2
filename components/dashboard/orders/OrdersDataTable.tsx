 // components/dashboard/orders/OrdersDataTable.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  PackageOpen,
} from "lucide-react";

interface SerializedOrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: string;
  productName: string;
  variantName: string;
  variantSku: string;
}

interface SerializedOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  totalAmount: string;
  paymentStatus: string;
  shippingStatus: string;
  customerName: string;
  customerEmail: string;
  orderItems: SerializedOrderItem[];
}

interface OrdersDataTableProps {
  orders: SerializedOrder[];
  themeColor: string;
  slug: string;
}

type SortKey = "date" | "total";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

const FULFILLMENT_TABS = [
  { key: "all", label: "All" },
  { key: "unfulfilled", label: "Unfulfilled" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
] as const;

const PAYMENT_OPTIONS = [
  { key: "all", label: "All payments" },
  { key: "paid", label: "Paid" },
  { key: "pending", label: "Pending" },
  { key: "failed", label: "Failed" },
  { key: "refunded", label: "Refunded" },
] as const;

const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

const PAYMENT_STYLES: Record<string, { label: string; badge: string; dot: string }> = {
  paid: {
    label: "Paid",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20",
    dot: "bg-emerald-500",
  },
  pending: {
    label: "Pending",
    badge: "bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-400/20",
    dot: "bg-amber-500",
  },
  failed: {
    label: "Failed",
    badge: "bg-red-50 text-red-700 ring-red-600/15 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-400/20",
    dot: "bg-red-500",
  },
  refunded: {
    label: "Refunded",
    badge: "bg-violet-50 text-violet-700 ring-violet-600/15 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-400/20",
    dot: "bg-violet-500",
  },
};

const SHIPPING_STYLES: Record<string, { label: string; badge: string; dot: string }> = {
  unfulfilled: {
    label: "Unfulfilled",
    badge: "bg-slate-100 text-slate-700 ring-slate-500/15 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600/30",
    dot: "bg-slate-400",
  },
  shipped: {
    label: "Shipped",
    badge: "bg-blue-50 text-blue-700 ring-blue-600/15 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-400/20",
    dot: "bg-blue-500",
  },
  delivered: {
    label: "Delivered",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20",
    dot: "bg-emerald-500",
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-red-50 text-red-700 ring-red-600/15 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-400/20",
    dot: "bg-red-400",
  },
};

function StatusBadge({
  status,
  styles,
}: {
  status: string;
  styles: Record<string, { label: string; badge: string; dot: string }>;
}) {
  const s = styles[status] ?? {
    label: status,
    badge: "bg-slate-100 text-slate-700 ring-slate-500/15 dark:bg-slate-800 dark:text-slate-300",
    dot: "bg-slate-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${s.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden />
      {s.label}
    </span>
  );
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  align?: "left" | "right";
}) {
  const Icon = !active ? ChevronsUpDown : dir === "asc" ? ChevronUp : ChevronDown;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 font-semibold transition-colors hover:text-slate-900 dark:hover:text-white ${
        align === "right" ? "flex-row-reverse" : ""
      } ${active ? "text-slate-900 dark:text-white" : ""}`}
    >
      {label}
      <Icon size={14} className={active ? "opacity-100" : "opacity-40"} aria-hidden />
    </button>
  );
}

export function OrdersDataTable({ orders, themeColor, slug }: OrdersDataTableProps) {
  const router = useRouter();
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

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const rows = orders.filter((o) => {
      const matchesSearch =
        !term ||
        o.orderNumber.toLowerCase().includes(term) ||
        o.customerName.toLowerCase().includes(term) ||
        o.customerEmail.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || o.shippingStatus === statusFilter;
      const matchesPayment = paymentFilter === "all" || o.paymentStatus === paymentFilter;
      return matchesSearch && matchesStatus && matchesPayment;
    });

    rows.sort((a, b) => {
      const av = sortKey === "date" ? Date.parse(a.createdAt) : Number(a.totalAmount);
      const bv = sortKey === "date" ? Date.parse(b.createdAt) : Number(b.totalAmount);
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return rows;
  }, [orders, searchTerm, statusFilter, paymentFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  };

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all" || paymentFilter !== "all";
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setPage(1);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      {/* Fulfillment tabs */}
      <div className="border-b border-slate-200 px-2 dark:border-slate-800" role="tablist" aria-label="Filter by fulfillment status">
        <div className="flex gap-1 overflow-x-auto">
          {FULFILLMENT_TABS.map((tab) => {
            const active = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setStatusFilter(tab.key);
                  setPage(1);
                }}
                className={`relative flex shrink-0 items-center gap-2 px-3 py-3.5 text-sm font-medium transition-colors ${
                  active
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                    active
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {counts[tab.key] ?? 0}
                </span>
                {active && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full" style={{ backgroundColor: themeColor }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            type="search"
            placeholder="Search order #, customer, or email"
            aria-label="Search orders"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-950"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(1);
            }}
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
              onClick={clearFilters}
              className="h-10 rounded-lg px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
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
                <SortHeader label="Total" align="right" active={sortKey === "total"} dir={sortDir} onClick={() => toggleSort("total")} />
              </th>
              <th scope="col" className="px-4 py-3 text-right sm:px-6">
                <SortHeader label="Date" align="right" active={sortKey === "date"} dir={sortDir} onClick={() => toggleSort("date")} />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                      <PackageOpen size={22} />
                    </span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {orders.length === 0 ? "No orders yet" : "No orders match your filters"}
                    </p>
                    <p className="max-w-xs text-sm text-slate-500 dark:text-slate-400">
                      {orders.length === 0
                        ? "New orders from your storefront will show up here."
                        : "Try a different search or clear the filters."}
                    </p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
                        style={{ backgroundColor: themeColor }}
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              pageRows.map((order) => {
                const href = `/dashboard/${slug}/orders/${order.id}`;
                const itemCount = order.orderItems.reduce((acc, item) => acc + item.quantity, 0);
                const initial = (order.customerName || "?").trim().charAt(0).toUpperCase();

                return (
                  <tr
                    key={order.id}
                    onClick={() => router.push(href)}
                    className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
                  >
                    <td className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                      <Link
                        href={href}
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold text-slate-900 hover:underline dark:text-white"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {initial}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-slate-900 dark:text-slate-100">{order.customerName}</div>
                          <div className="truncate text-xs text-slate-500 dark:text-slate-400">{order.customerEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3.5 text-slate-600 tabular-nums dark:text-slate-300 lg:table-cell">
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <StatusBadge status={order.paymentStatus} styles={PAYMENT_STYLES} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <StatusBadge status={order.shippingStatus} styles={SHIPPING_STYLES} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                      {peso.format(Number(order.totalAmount))}
                    </td>
                    <td
                      className="whitespace-nowrap px-4 py-3.5 text-right text-slate-500 dark:text-slate-400 sm:px-6"
                      suppressHydrationWarning
                    >
                      {new Date(order.createdAt).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / pagination */}
      {filtered.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:px-6">
          <p className="tabular-nums">
            Showing <span className="font-medium text-slate-900 dark:text-white">{start + 1}</span> to{" "}
            <span className="font-medium text-slate-900 dark:text-white">{Math.min(start + PAGE_SIZE, filtered.length)}</span> of{" "}
            <span className="font-medium text-slate-900 dark:text-white">{filtered.length}</span> orders
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                <ChevronLeft size={16} aria-hidden /> Prev
              </button>
              <span className="px-1 tabular-nums">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                Next <ChevronRight size={16} aria-hidden />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}