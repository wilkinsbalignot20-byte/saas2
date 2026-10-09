// components/dashboard/marketing/product-selector/BundleRoleButtons.tsx
"use client";

import type { BundleRole } from "./types";

interface Props {
  locked: boolean;
  isMain: boolean;
  isAddOn: boolean;
  onSelect: (role: BundleRole) => void;
}

const base = "px-2.5 py-1 text-xs font-bold rounded-md transition border";
const lockedCls = "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60";
const idleCls = "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer";

export default function BundleRoleButtons({ locked, isMain, isAddOn, onSelect }: Props) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={locked}
        onClick={() => onSelect("MAIN")}
        className={`${base} ${
          locked ? lockedCls : isMain ? "bg-indigo-600 border-indigo-600 text-white shadow-xs cursor-pointer" : idleCls
        }`}
      >
        ⭐ Main Product
      </button>
      <button
        type="button"
        disabled={locked}
        onClick={() => onSelect("ADDON")}
        className={`${base} ${
          locked ? lockedCls : isAddOn ? "bg-emerald-600 border-emerald-600 text-white shadow-xs cursor-pointer" : idleCls
        }`}
      >
        ➕ Add-on Deal
      </button>
    </div>
  );
}