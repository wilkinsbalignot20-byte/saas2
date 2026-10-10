 // components/dashboard/orders/data-table/constants.ts
import type { StatusStyle } from "./types";

export const PAGE_SIZE = 10;

// 📑 FILTER TABS WITH UNIFORM UPPERCASE CODES TO MATCH DATABASE ENUMS
export const FULFILLMENT_TABS = [
  { key: "all", label: "All" },
  { key: "DRAFT", label: "Draft" },
  { key: "PENDING_ORDER", label: "Pending" },
  { key: "PAYMENT_REVIEW", label: "Payment Review" },
  { key: "FAILED", label: "Failed" },
  { key: "UNFULFILLED", label: "Unfulfilled" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "RETURN_BAR", label: "Return" },
  { key: "CANCELLED", label: "Cancelled" },
] as const;

// 💳 DROPDOWN OPTIONS WITH UPPERCASE MATCHING
export const PAYMENT_OPTIONS = [
  { key: "all", label: "All payments" },
  { key: "PAID", label: "Paid" },
  { key: "PENDING", label: "Pending" },
  { key: "FAILED", label: "Failed" },
  { key: "REFUNDED", label: "Refunded" },
] as const;

// 💳 PAYMENT STATUS VISUAL STYLING MAP (UPPERCASE KEY ALIGNED)
export const PAYMENT_STYLES: Record<string, StatusStyle> = {
  PAID: {
    label: "Paid",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20",
    dot: "bg-emerald-500",
  },
  PENDING: {
    label: "Pending",
    badge: "bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-400/20",
    dot: "bg-amber-500",
  },
  FAILED: {
    label: "Failed",
    badge: "bg-red-50 text-red-700 ring-red-600/15 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-400/20",
    dot: "bg-red-500",
  },
  PAYMENT_REVIEW: {
    label: "Payment Review",
    badge: "bg-purple-50 text-purple-700 ring-purple-600/15 dark:bg-purple-500/10 dark:text-purple-400 dark:ring-purple-400/20",
    dot: "bg-purple-500",
  },
  REFUNDED: {
    label: "Refunded",
    badge: "bg-violet-50 text-violet-700 ring-violet-600/15 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-400/20",
    dot: "bg-violet-500",
  },
};

// 🚚 SHIPPING STATUS VISUAL STYLING MAP (UPPERCASE KEY ALIGNED)
export const SHIPPING_STYLES: Record<string, StatusStyle> = {
  DRAFT: {
    label: "Draft",
    badge: "bg-zinc-100 text-zinc-700 ring-zinc-500/15 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-600/30",
    dot: "bg-zinc-400",
  },
  UNFULFILLED: {
    label: "Unfulfilled",
    badge: "bg-slate-100 text-slate-700 ring-slate-500/15 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600/30",
    dot: "bg-slate-400",
  },
  SHIPPED: {
    label: "Shipped",
    badge: "bg-blue-50 text-blue-700 ring-blue-600/15 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-400/20",
    dot: "bg-blue-500",
  },
  DELIVERED: {
    label: "Delivered",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20",
    dot: "bg-emerald-500",
  },
  RETURN_REQUESTED: {
    label: "Return Requested",
    badge: "bg-orange-50 text-orange-700 ring-orange-600/15 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-400/20",
    dot: "bg-orange-500",
  },
  RETURNED: {
    label: "Returned",
    badge: "bg-teal-50 text-teal-700 ring-teal-600/15 dark:bg-teal-500/10 dark:text-teal-400 dark:ring-teal-400/20",
    dot: "bg-teal-500",
  },
  CANCELLED: {
    label: "Cancelled",
    badge: "bg-red-50 text-red-700 ring-red-600/15 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-400/20",
    dot: "bg-red-400",
  },
};
