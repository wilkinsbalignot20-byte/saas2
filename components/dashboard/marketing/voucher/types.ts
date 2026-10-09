// components/dashboard/marketing/voucher/types.ts

export type DiscountType = "FIXED" | "PERCENTAGE";

export interface Voucher {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number | string;
  minSpend: number | string;
  maxClaims: number | null;
  claimedCount: number;
  expiresAt: string | null;
  isActive: boolean;
}

/** Ito ang ipapadala ng form papunta sa API */
export interface VoucherPayload {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minSpend: number;
  maxClaims: number | null;
  expiresAt: string | null;
}

export type NoticeState = { kind: "success" | "error"; text: string } | null;