// components/dashboard/VariantInventorySection.tsx
'use client';

import { Plus, Trash2 } from 'lucide-react';

interface VariantInput {
  name: string;
  sku: string;
  price: string;
  stock: string;
}

interface VariantInventorySectionProps {
  variants: VariantInput[];
  addVariantRow: () => void;
  removeVariantRow: (idx: number) => void;
  handleVariantChange: (idx: number, field: keyof VariantInput, val: string) => void;
}

export default function VariantInventorySection({
  variants,
  addVariantRow,
  removeVariantRow,
  handleVariantChange
}: VariantInventorySectionProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#1B211D]/5 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-[#1B211D]/5 pb-3">
        <div className="space-y-0.5">
          <h2 className="text-sm font-bold text-[#1B211D] font-display uppercase tracking-wider text-xs opacity-50">
            Inventory & Variants Control
          </h2>
          <p className="text-xs text-[#1B211D]/40">Specify options like size/colors, allocate internal business SKUs, and track stocks.</p>
        </div>
        
        <button
          type="button"
          onClick={addVariantRow}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#3E8F68] border border-[#3E8F68]/20 bg-[#3E8F68]/5 px-3 py-1.5 rounded-lg hover:bg-[#3E8F68]/10 transition-all select-none cursor-pointer"
        >
          <Plus size={14} />
          <span>Add Variant</span>
        </button>
      </div>

      {/* DYNAMIC LOOP OF VARIANTS */}
      <div className="space-y-3">
        {variants.map((variant, index) => (
          <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end bg-[#F6F5F1]/30 p-4 rounded-xl border border-[#1B211D]/5 relative animate-in fade-in duration-150">
            
            <div className="sm:col-span-3 space-y-1">
              <label className="text-[11px] font-bold text-[#1B211D]/50 uppercase tracking-tight">Variant Name</label>
              <input
                type="text"
                required
                value={variant.name}
                onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                placeholder="e.g., Red / Size 9"
                className="w-full bg-white border border-[#1B211D]/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#3E8F68]"
              />
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="text-[11px] font-bold text-[#1B211D]/50 uppercase tracking-tight">SKU Barcode *</label>
              <input
                type="text"
                required
                value={variant.sku}
                onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                placeholder="e.g., NK-AMAX-RED-9"
                className="w-full bg-white border border-[#1B211D]/10 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#3E8F68]"
              />
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="text-[11px] font-bold text-[#1B211D]/50 uppercase tracking-tight">Price (₱) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={variant.price}
                onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                className="w-full bg-white border border-[#1B211D]/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#3E8F68]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-[#1B211D]/50 uppercase tracking-tight">Initial Stock *</label>
              <input
                type="number"
                required
                min="0"
                value={variant.stock}
                onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                className="w-full bg-white border border-[#1B211D]/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#3E8F68]"
              />
            </div>

            <div className="sm:col-span-1 text-right sm:text-center pb-0.5">
              <button
                type="button"
                disabled={variants.length === 1}
                onClick={() => removeVariantRow(index)}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                title="Remove variant"
              >
                <Trash2 size={15} />
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
