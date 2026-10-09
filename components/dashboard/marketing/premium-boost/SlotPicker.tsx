// components/dashboard/marketing/premium-boost/SlotPicker.tsx
"use client";

import { Check } from "lucide-react";
import { SLOTS } from "./constants";

interface Props {
  uid: string;
  value: string;
  onChange: (value: string) => void;
}

/** Step 2: Pumili ng ad spot */
export default function SlotPicker({ uid, value, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <span className="block text-sm font-medium text-slate-700" id={`${uid}-slot`}>
        2. Choose an ad spot
      </span>
      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-labelledby={`${uid}-slot`}>
        {SLOTS.map((s) => {
          const active = value === s.value;
          const Icon = s.icon;
          return (
            <button
              key={s.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(s.value)}
              className={`relative flex flex-col gap-2 rounded-xl border bg-white p-4 text-left transition ${
                active
                  ? "border-[var(--brand,#0f172a)] ring-2 ring-[var(--brand,#0f172a)]/15"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <Icon size={18} />
                </span>
                {active && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand,#0f172a)] text-white">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-900">{s.label}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{s.description}</span>
              </span>
              <span className="w-fit rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/15">
                {s.tag}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}