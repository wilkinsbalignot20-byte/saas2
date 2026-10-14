 // components/dashboard/orders/data-table/types.ts

export interface SerializedOrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: string;
  productName: string;
  variantName: string;
  variantSku: string;

  // 🌟 IDINAGDAG PARA SA BUNDLES INTEGRATION
  // Gagamit tayo ng optional (?) para ligtas pa rin ang mga lumang orders na hindi bundle
  isBundle?: boolean; 
  bundleType?: "MIX_AND_MATCH" | "FIXED_PACKAGE" | string;
  // Para sa mga piniling produkto ng customer kung MIX_AND_MATCH ang bundle strategy
  selectedChoices?: {
    name: string;
    imageUrl: string;
  }[];
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
