// components/dashboard/marketing/product-selector/ProductRow.tsx
"use client";

import BundleRoleButtons from "./BundleRoleButtons";
import DiscountEditor from "./DiscountEditor";
import { formatMoney, isAddOnRule, isLockedForCampaign, isMainRule } from "./utils";
import type { BundleRole, Product, SelectedRulePayload } from "./types";

interface Props {
  product: Product;
  rule?: SelectedRulePayload;
  campaignType: string;
  onToggle: (product: Product) => void;
  onSetBundleRole: (product: Product, role: BundleRole) => void;
  onUpdateRule: (productId: string, field: keyof SelectedRulePayload, value: any) => void;
}

export default function ProductRow({ product: p, rule, campaignType, onToggle, onSetBundleRole, onUpdateRule }: Props) {
  const firstVariant = p.variants?.[0];
  const basePrice = Number(firstVariant?.price || 0);
  const imgUrl = p.images?.[0] || null;

  const isChecked = Boolean(rule);
  const isLocked = isLockedForCampaign(p.isLockedInFlashSale, campaignType);
  const isMain = isMainRule(rule);
  const isAddOn = isAddOnRule(rule);

  return (
    <div className="py-3.5 first:pt-0 last:pb-0 space-y-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center justify-between gap-3">
        {/* Product info */}
        <div className="flex items-center gap-3 text-left flex-1">
          {imgUrl && (
            <img src={imgUrl} alt={p.name} className="w-9 h-9 rounded-lg object-cover border border-slate-100 shrink-0" />
          )}
          <div className="space-y-0.5">
            <span className="block text-sm font-semibold text-slate-900">{p.name}</span>
            <span className="block text-xs font-medium text-slate-400">
              SKU: {firstVariant?.sku || "N/A"} &bull; Reg. Price: {formatMoney(basePrice)}
            </span>
            {/* Lalabas lang kapag bawal patungan ang promo deal ng aytem */}
            {isLocked && (
              <span className="block text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md w-fit mt-0.5">
                ⚠️ Naka-kategorya sa kasalukuyang Flash Sale (Locked)
              </span>
            )}
          </div>
        </div>

        {/* Controls depende sa promo mode */}
        {campaignType === "BUNDLE" ? (
          <BundleRoleButtons
            locked={isLocked}
            isMain={isMain}
            isAddOn={isAddOn}
            onSelect={(role) => onSetBundleRole(p, role)}
          />
        ) : (
          <button
            type="button"
            disabled={isLocked}
            onClick={() => onToggle(p)}
            className={`rounded-lg border px-3 py-1 text-xs font-bold shadow-2xs transition ${
              isLocked
                ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60"
                : isChecked
                ? "border-[var(--brand,#0f172a)] bg-[var(--brand,#0f172a)] text-white cursor-pointer"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
            }`}
          >
            {isChecked ? "Selected ✓" : "Select Product"}
          </button>
        )}
      </div>

      {rule && (
        <DiscountEditor
          campaignType={campaignType}
          rule={rule}
          isMain={isMain}
          basePrice={basePrice}
          onUpdate={(field, value) => onUpdateRule(p.id, field, value)}
        />
      )}
    </div>
  );
}