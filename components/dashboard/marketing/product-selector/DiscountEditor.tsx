// components/dashboard/marketing/product-selector/DiscountEditor.tsx
"use client";

import { calcPromoPrice, formatMoney } from "./utils";
import type { SelectedRulePayload } from "./types";

interface Props {
  campaignType: string;
  rule: SelectedRulePayload;
  isMain: boolean;
  basePrice: number;
  onUpdate: (field: keyof SelectedRulePayload, value: any) => void;
}

/** Discount controls at live na "→ Promo: ₱xxx" para sa napiling produkto */
export default function DiscountEditor({ campaignType, rule, isMain, basePrice, onUpdate }: Props) {
  const isBogo = campaignType === "BUY_1_TAKE_1";
  const isBundleMain = campaignType === "BUNDLE" && isMain;

  const promo = isBogo
    ? 0
    : isBundleMain
    ? basePrice
    : calcPromoPrice(basePrice, rule.discountType, Number(rule.discountValue) || 0);

  return (
    <div className="flex flex-wrap items-center gap-2.5 pl-4 transition-all animate-in fade-in slide-in-from-top-1 duration-150">
      {isBogo ? (
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 ring-1 ring-inset ring-purple-600/20 h-7">
          <span>FREE (100% OFF on 2nd Item)</span>
        </div>
      ) : isBundleMain ? (
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-600/20 h-7">
          <span>Required Core Base Item</span>
        </div>
      ) : (
        <>
          <div className="relative flex items-center shrink-0">
            <select
              value={rule.discountType || "PERCENTAGE"}
              onChange={(e) => onUpdate("discountType", e.target.value)}
              className="rounded-lg border border-slate-200 bg-white pl-2 pr-7 py-1 text-xs font-semibold text-slate-700 h-7 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="PERCENTAGE">% OFF</option>
              <option value="FIXED">₱ OFF</option>
            </select>
          </div>
          <input
            type="number"
            value={rule.discountValue || ""}
            onChange={(e) => onUpdate("discountValue", e.target.value)}
            placeholder="10"
            className="w-16 h-7 rounded-lg border border-slate-200 px-2 text-xs font-bold text-slate-900 text-center focus:outline-none"
          />
        </>
      )}

      <span className="text-xs font-medium text-slate-400">
        &rarr; Promo:{" "}
        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{formatMoney(promo)}</span>
      </span>
    </div>
  );
}