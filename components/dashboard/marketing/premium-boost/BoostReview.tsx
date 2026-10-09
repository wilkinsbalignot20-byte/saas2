// components/dashboard/marketing/premium-boost/BoostReview.tsx
"use client";

import { Rocket } from "lucide-react";
import { btnPrimary, fmtDateTime } from "../shared";
import type { BoostCampaign } from "./types";

interface Props {
  campaign?: BoostCampaign;
  slotLabel: string;
  saving: boolean;
}

/** Step 3: Buod bago i-boost. Ang submit button ay nasa loob ng parent form. */
export default function BoostReview({ campaign, slotLabel, saving }: Props) {
  return (
    <aside className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <h4 className="text-sm font-bold text-slate-900">3. Review & boost</h4>
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-xs text-slate-500">Campaign</dt>
          <dd className={`font-semibold ${campaign ? "text-slate-900" : "text-slate-400"}`}>
            {campaign ? campaign.name : "Not selected"}
          </dd>
          {campaign?.startDate && campaign?.endDate && (
            <dd className="text-xs text-slate-500">
              {fmtDateTime(campaign.startDate)} to {fmtDateTime(campaign.endDate)}
            </dd>
          )}
        </div>
        <div>
          <dt className="text-xs text-slate-500">Ad spot</dt>
          <dd className="font-semibold text-slate-900">{slotLabel}</dd>
        </div>
      </dl>
      <button type="submit" disabled={!campaign || saving} className={`${btnPrimary} w-full`}>
        <Rocket size={16} />
        {saving ? "Boosting..." : "Boost campaign"}
      </button>
    </aside>
  );
}