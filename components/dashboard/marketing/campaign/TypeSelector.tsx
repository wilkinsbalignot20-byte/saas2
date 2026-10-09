// components/dashboard/marketing/campaign/TypeSelector.tsx
"use client";

import type { CampaignTypeOption } from "./types";

interface Props {
  uid: string;
  types: CampaignTypeOption[];
  value: string;
  onChange: (value: string) => void;
}

export default function TypeSelector({ uid, types, value, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <span className="block text-sm font-medium text-slate-700" id={`${uid}-type`}>
        Promo type
      </span>
      <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-labelledby={`${uid}-type`}>
        {types.map((t) => {
          const active = value === t.value;
          const Icon = t.icon;
          return (
            <button
              key={t.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(t.value)}
              className={`flex items-start gap-3 rounded-lg border bg-white p-3 text-left transition ${
                active
                  ? "border-[var(--brand,#0f172a)] ring-2 ring-[var(--brand,#0f172a)]/15"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <Icon size={18} className="mt-0.5 shrink-0 text-slate-600" />
              <span>
                <span className="block text-sm font-semibold text-slate-900">{t.label}</span>
                <span className="block text-xs text-slate-500">{t.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}