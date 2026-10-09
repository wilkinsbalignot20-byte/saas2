// components/dashboard/marketing/product-selector/types.ts

// Patalasin ang mga properties base sa iyong database configuration
export interface Variant {
  id: string;
  name: string;
  price: number;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  images: string[];
  variants: Variant[];
  isLockedInFlashSale?: boolean;
}

export interface SelectedRulePayload {
  productId: string;
  variantId: string | null;
  promoPrice: number | null;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  requiredQuantity?: number; // para sa BUNDLE
  freeQuantity?: number; // para sa BUNDLE
}

export type BundleRole = "MAIN" | "ADDON";