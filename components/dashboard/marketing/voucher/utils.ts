// components/dashboard/marketing/voucher/utils.ts
import { fmtPeso } from "../shared";
import type { Voucher } from "./types";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const generateCode = () =>
  "SAVE" + Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");

export const discountLabel = (v: Voucher) =>
  v.discountType === "FIXED" ? `${fmtPeso(Number(v.discountValue))} off` : `${Number(v.discountValue)}% off`;

/** ACTIVE | INACTIVE | EXPIRED | USED_UP */
export const voucherStatus = (v: Voucher) => {
  if (!v.isActive) return "INACTIVE";
  if (v.expiresAt && new Date(v.expiresAt) <= new Date()) return "EXPIRED";
  if (v.maxClaims != null && v.claimedCount >= v.maxClaims) return "USED_UP";
  return "ACTIVE";
};