// components/dashboard/marketing/product-selector/utils.ts
import type { SelectedRulePayload } from "./types";

export const formatMoney = (n: number) =>
  `₱${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Kalkulahin ang promo price base sa discount type at value */
export const calcPromoPrice = (basePrice: number, type: SelectedRulePayload["discountType"], value: number) =>
  type === "PERCENTAGE" ? basePrice - (basePrice * value) / 100 : Math.max(0, basePrice - value);

/** Ang mga promo type na bawal gumamit ng produktong naka-lock sa Flash Sale */
export const isLockedForCampaign = (locked: boolean | undefined, campaignType: string) =>
  Boolean(locked) && (campaignType === "BUNDLE" || campaignType === "BUY_1_TAKE_1");

export const isMainRule = (r?: SelectedRulePayload) => r?.requiredQuantity === 1 && r?.freeQuantity === 0;
export const isAddOnRule = (r?: SelectedRulePayload) => r?.requiredQuantity === 0 && r?.freeQuantity === 1;