// components/dashboard/marketing/product-selector/ProductSelectorModal.tsx
"use client";

import type { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { inputClass, btnPrimary } from "../shared";

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCount: number;
  onClose: () => void;
  children: ReactNode;
}

/** Shell lang ng popup: backdrop, header, search, footer. Ang laman ay galing sa children. */
export default function ProductSelectorModal({ searchTerm, onSearchChange, selectedCount, onClose, children }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative flex h-full max-h-[640px] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Select Products for Promo</h3>
            <p className="text-xs text-slate-400">Configure distinct price drops for each stock listing rule</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
          <div className="relative w-full">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search item name by text filter keywords..."
              className={`${inputClass} h-9 pl-9 text-xs`}
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">{children}</div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 bg-slate-50/50 px-5 py-3">
          <button type="button" onClick={onClose} className={`${btnPrimary} h-8 text-xs px-4`}>
            Confirm Selection ({selectedCount})
          </button>
        </div>
      </div>
    </div>
  );
}