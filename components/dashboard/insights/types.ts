// components/dashboard/insights/types.ts
export type RangeKey = "7d" | "30d" | "90d";

export interface Metric {
  value: number;
  previous: number;
}

export interface InsightsData {
  range: RangeKey;
  days: number;
  kpis: { sales: Metric; collected: Metric; orders: Metric; aov: Metric };
  extras: {
    pendingAmount: number;
    pendingOrders: number;
    discountGiven: number;
    cancelledOrders: number;
    newCustomers: number;
    returningCustomers: number;
  };
  daily: { date: string; sales: number; orders: number }[];
  topProducts: { name: string; sku: string; unitsSold: number; revenue: number }[];
  fulfillment: { status: string; count: number }[];
  payment: { status: string; count: number }[];
  weekday: { day: string; orders: number; sales: number }[];
  vouchers: {
    code: string;
    claims: number;
    maxClaims: number | null;
    type: "FIXED" | "PERCENTAGE" | string;
    value: number;
    isActive: boolean;
    expiresAt: string | null;
  }[];
  lowStock: { productName: string; variantName: string; sku: string; stock: number }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    paymentStatus: string;
    shippingStatus: string;
    createdAt: string;
  }[];
}

/** % pagbabago kumpara sa nakaraang period. null kung walang pagbabasehan */
export const pctChange = (current: number, previous: number): number | null =>
  previous > 0 ? ((current - previous) / previous) * 100 : null;

/** ₱1.2k / ₱3.4M para sa chart axis */
export const compactPeso = (n: number) =>
  `₱${new Intl.NumberFormat("en-PH", { notation: "compact", maximumFractionDigits: 1 }).format(n)}`;