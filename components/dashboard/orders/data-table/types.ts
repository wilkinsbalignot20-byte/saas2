// components/dashboard/orders/data-table/types.ts

export interface SerializedOrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: string;
  productName: string;
  variantName: string;
  variantSku: string;
}

export interface SerializedOrder {
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

export interface OrdersDataTableProps {
  orders: SerializedOrder[];
  themeColor: string;
  slug: string;
}

export type SortKey = "date" | "total";
export type SortDir = "asc" | "desc";

export interface StatusStyle {
  label: string;
  badge: string;
  dot: string;
}