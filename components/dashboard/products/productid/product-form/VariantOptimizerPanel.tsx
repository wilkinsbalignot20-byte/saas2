// components/dashboard/products/product-form/VariantOptimizerPanel.tsx
"use client";

import { Plus, Wand2 } from "lucide-react";
import AttributeRow from "./AttributeRow";
import type { VariantOptimizerState } from "./useVariantOptimizer";

export default function VariantOptimizerPanel({ optimizer: o }: { optimizer: VariantOptimizerState }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#1B211D]/5 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-[#1B211D] font-display uppercase tracking-wider text-xs opacity-50">
            Product Variant Optimizer
          </h3>
          <p className="text-xs text-[#1B211D]/40 mt-0.5">
            Awtomatikong mag-generate ng maramihang variants gamit ang mga attributes (e.g., Model, Size, Features).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[#1B211D]/60 select-none cursor-pointer">Enable Optimizer</label>
          <input
            type="checkbox"
            checked={o.enabled}
            onChange={(e) => o.setEnabled(e.target.checked)}
            className="w-4 h-4 accent-[#3E8F68] cursor-pointer"
          />
        </div>
      </div>

      {o.enabled && (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#F6F5F1]/50 p-4 rounded-xl items-end border border-[#1B211D]/5">
            <div className="md:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-[#1B211D]/50 uppercase tracking-tight">Base Price Default (₱)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={o.basePrice}
                onChange={(e) => o.setBasePrice(e.target.value)}
                className="w-full bg-white border border-[#1B211D]/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#3E8F68]"
              />
            </div>
            <button
              type="button"
              onClick={o.generate}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#1B211D] text-white text-xs font-semibold h-[34px] px-4 rounded-lg hover:bg-slate-800 transition-colors shadow-sm cursor-pointer select-none"
            >
              <Wand2 size={14} />
              <span>Compile Combinations</span>
            </button>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-bold text-[#1B211D]/50 uppercase tracking-tight block">Attributes Input</label>

            {o.attributes.map((attr, idx) => (
              <AttributeRow
                key={idx}
                attribute={attr}
                canRemove={o.attributes.length > 1}
                onChange={(field, value) => o.changeAttribute(idx, field, value)}
                onRemove={() => o.removeAttribute(idx)}
              />
            ))}

            <button
              type="button"
              onClick={o.addAttribute}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#3E8F68] border border-[#3E8F68]/20 bg-[#3E8F68]/5 px-3 py-1.5 rounded-lg hover:bg-[#3E8F68]/10 transition-all select-none cursor-pointer"
            >
              <Plus size={14} />
              <span>Add More Attribute Type</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}