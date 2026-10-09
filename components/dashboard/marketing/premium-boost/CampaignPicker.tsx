 // components/dashboard/marketing/premium-boost/CampaignPicker.tsx
"use client";

import Link from "next/link"; // 👈 Idinagdag para sa mabilis na paglipat ng tab
import { Field, inputClass } from "../shared";
import { TYPE_LABELS } from "./constants";
import type { BoostCampaign } from "./types";

interface Props {
  uid: string;
  campaigns: BoostCampaign[];
  value: string;
  onChange: (id: string) => void;
  tenantSlug: string;
}

/** Step 1: Pumili ng campaign na ibo-boost */
export default function CampaignPicker({ uid, campaigns, value, onChange, tenantSlug }: Props) {
  const empty = campaigns.length === 0;

  return (
    <Field
      id={`${uid}-campaign`}
      label="1. Choose a campaign"
      hint={empty ? undefined : "Only active and upcoming campaigns that aren't boosted yet."}
    >
      <select
        id={`${uid}-campaign`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={empty}
        className={inputClass}
        required
      >
        <option value="">{empty ? "No campaigns available" : "Select a campaign to promote"}</option>
        {campaigns.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} ({TYPE_LABELS[c.type] ?? c.type})
          </option>
        ))}
      </select>
      
      {/* 💡 MATALINONG DISKARTE: Clickable shortcuts para sa nagmamadaling negosyante */}
      {empty && (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-amber-600 font-medium">
            Walang available na kampanya sa ngayon.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-slate-500">Gumawa muna ng:</span>
            <Link 
              href={`/dashboard/${tenantSlug}/marketing?tab=flash-sales`} // 👈 Depende sa tab structure mo
              className="font-semibold text-sky-600 hover:underline"
            >
              ⚡ Flash Sale
            </Link>
            <span className="text-slate-300">|</span>
            <Link 
              href={`/dashboard/${tenantSlug}/marketing?tab=bundles`}
              className="font-semibold text-sky-600 hover:underline"
            >
              📦 Bundle Deal
            </Link>
          </div>
        </div>
      )}
    </Field>
  );
}
