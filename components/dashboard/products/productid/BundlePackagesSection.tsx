'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { BundleInput } from './product-form/types';

interface BundlePackagesSectionProps {
  bundles: BundleInput[];
  addBundleRow: () => void;
  removeBundleRow: (index: number) => void;
  handleBundleChange: (index: number, field: keyof BundleInput, value: string) => void;
}

export default function BundlePackagesSection({
  bundles,
  addBundleRow,
  removeBundleRow,
  handleBundleChange,
}: BundlePackagesSectionProps) {
  return (
    <div className="rounded-2xl border border-[#1B211D]/5 bg-white p-6 shadow-sm space-y-6">
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between border-b border-[#1B211D]/5 pb-4">
        <div>
          <h2 className="text-lg font-bold text-[#1B211D]">Wholesale Bundle Packages</h2>
          <p className="text-xs text-[#1B211D]/50">
            Set up special package pricing when tenants order in bulk quantities (e.g., Buy 3, Buy 5).
          </p>
        </div>
        <button
          type="button"
          onClick={addBundleRow}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-[#1B211D] hover:bg-[#1B211D]/90 transition-colors select-none"
        >
          <Plus size={14} />
          <span>Add Package Row</span>
        </button>
      </div>

      {/* BUNDLE LIST ROWS GRID CONTAINER */}
      {bundles.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-[#1B211D]/10 rounded-xl bg-[#F6F5F1]/30">
          <p className="text-sm text-[#1B211D]/40 font-medium">No wholesale bundle tiers configured yet.</p>
          <button
            type="button"
            onClick={addBundleRow}
            className="mt-2 text-xs font-bold text-[#1B211D] underline hover:text-[#1B211D]/70"
          >
            Create your first bundle option
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-[#1B211D]/5 text-xs font-bold text-[#1B211D]/50 uppercase tracking-wider">
                <th className="pb-3 pr-4">Package Name / Label</th>
                <th className="pb-3 px-4 w-[120px]">Quantity (Pcs)</th>
                <th className="pb-3 px-4 w-[160px]">Bundle Price</th>
                <th className="pb-3 pl-4 w-[50px] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B211D]/5 text-sm">
              {bundles.map((bundle, index) => (
                <tr key={index} className="group animate-in fade-in duration-200">
                  {/* BUNDLE NAME FIELD */}
                  <td className="py-3 pr-4">
                    <input
                      type="text"
                      value={bundle.name}
                      onChange={(e) => handleBundleChange(index, 'name', e.target.value)}
                      placeholder="e.g., Bundle of 3, Family Pack"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[#1B211D]/10 bg-transparent placeholder-[#1B211D]/30 focus:border-[#1B211D] focus:ring-1 focus:ring-[#1B211D] outline-none transition-all"
                    />
                  </td>

                  {/* BUNDLE QUANTITY FIELD */}
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min="1"
                      value={bundle.quantity}
                      onChange={(e) => handleBundleChange(index, 'quantity', e.target.value)}
                      placeholder="3"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[#1B211D]/10 bg-transparent focus:border-[#1B211D] focus:ring-1 focus:ring-[#1B211D] outline-none transition-all"
                    />
                  </td>

                  {/* BUNDLE PRICE FIELD */}
                  <td className="py-3 px-4">
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-[#1B211D]/40 text-sm select-none">₱</span>
                      <input
                        type="text"
                        value={bundle.price}
                        onChange={(e) => handleBundleChange(index, 'price', e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-7 pr-3 py-2 text-sm rounded-xl border border-[#1B211D]/10 bg-transparent focus:border-[#1B211D] focus:ring-1 focus:ring-[#1B211D] outline-none transition-all"
                      />
                    </div>
                  </td>

                  {/* ROW REMOVE ACTION */}
                  <td className="py-3 pl-4 text-right">
                    <button
                      type="button"
                      onClick={() => removeBundleRow(index)}
                      className="p-2 text-red-600 rounded-xl hover:bg-red-50 transition-colors opacity-80 hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
