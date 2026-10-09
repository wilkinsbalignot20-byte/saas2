// components/dashboard/marketing/voucher/DiscountTypeToggle.tsx
"use client";

import type { DiscountType } from "./types";

const OPTIONS = [
  { v: "FIXED", label: "Fixed amount (₱)" },
  { v: "PERCENTAGE", label: "Percentage (%)" },
] as const;

interface Props {
  uid: string;
  value: DiscountType;
  onChange: (value: DiscountType) => void;
}

export default function DiscountTypeToggle({ uid, value, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <span className="block text-sm font-medium text-slate-700" id={`${uid}-type`}>
        Discount type
      </span>
      <div
        className="grid grid-cols-2 gap-1 rounded-lg bg-slate-200/70 p-1"
        role="radiogroup"
        aria-labelledby={`${uid}-type`}
      >
        {OPTIONS.map((o) => (
          <button
            key={o.v}
            type="button"
            role="radio"
            aria-checked={value === o.v}
            onClick={() => onChange(o.v)}
            className={`h-8 rounded-md text-sm font-medium transition ${
              value === o.v ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}