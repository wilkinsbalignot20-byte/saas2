 // components/dashboard/marketing/premium-boost/BoostReview.tsx
"use client";

import { Rocket, CreditCard } from "lucide-react"; // 👈 Idinagdag ang card icon para sa premium feel
import { btnPrimary, fmtDateTime } from "../shared";
import type { BoostCampaign } from "./types";

interface Props {
  campaign?: BoostCampaign;
  slotLabel: string;
  duration: number;
  saving: boolean;
}

/** Step 3: Buod bago i-boost. Ang submit button ay nasa loob ng parent form. */
export default function BoostReview({ campaign, slotLabel, duration, saving }: Props) {
  
  // 💡 MATALINONG DISKARTE: Iba ang presyo ng Hero Carousel sa Hot Deals Grid
  // Pwede mo itong palitan o i-adjust ang rates depende sa monetization plan mo
  const ratePerDay = slotLabel.toLowerCase().includes("hero") ? 500 : 250; 
  const totalCost = ratePerDay * duration;

  return (
    <aside className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
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
        <div>
          <dt className="text-xs text-slate-500">Duration</dt>
          <dd className="font-semibold text-slate-900">{duration} days</dd>
        </div>

        {/* 💡 BAGONG KULANG NA FEATURE: Ang Pricing Box para sa Transparency ng Tenant */}
        <div className="pt-2 border-t border-dashed border-slate-200">
          <dt className="text-xs text-slate-500 flex items-center gap-1">
            <CreditCard size={12} className="text-slate-400" />
            Estimated Cost
          </dt>
          <dd className="text-base font-bold text-emerald-600 mt-0.5">
            ₱{totalCost.toLocaleString()}
            <span className="text-xs font-normal text-slate-400 block">
              (₱{ratePerDay}/day for {slotLabel})
            </span>
          </dd>
        </div>
      </dl>

      <button type="submit" disabled={!campaign || saving} className={`${btnPrimary} w-full`}>
        <Rocket size={16} />
        {saving ? "Boosting..." : "Boost campaign"}
      </button>
    </aside>
  );
}
