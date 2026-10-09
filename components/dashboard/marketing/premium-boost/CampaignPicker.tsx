// components/dashboard/marketing/premium-boost/CampaignPicker.tsx
"use client";

import { Field, inputClass } from "../shared";
import { TYPE_LABELS } from "./constants";
import type { BoostCampaign } from "./types";

interface Props {
  uid: string;
  campaigns: BoostCampaign[];
  value: string;
  onChange: (id: string) => void;
}

/** Step 1: Pumili ng campaign na ibo-boost */
export default function CampaignPicker({ uid, campaigns, value, onChange }: Props) {
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
      {empty && (
        <p className="mt-1.5 text-xs text-slate-500">Create a Flash Sale or Bundle first, then come back to boost it.</p>
      )}
    </Field>
  );
}