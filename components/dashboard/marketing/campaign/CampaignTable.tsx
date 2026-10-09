// components/dashboard/marketing/campaign/CampaignTable.tsx
"use client";

import CampaignRow from "./CampaignRow";
import type { Campaign, CampaignTypeOption } from "./types";

interface Props {
  campaigns: Campaign[];
  typeMap: Record<string, CampaignTypeOption>;
  busyId: string | null;
  onDelete: (campaign: Campaign) => void;
}

export default function CampaignTable({ campaigns, typeMap, busyId, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-xs text-slate-500">
            <th scope="col" className="px-5 py-3 font-semibold sm:px-6">Campaign</th>
            <th scope="col" className="px-4 py-3 font-semibold">Type</th>
            <th scope="col" className="px-4 py-3 font-semibold">Schedule</th>
            <th scope="col" className="px-5 py-3 font-semibold sm:px-6">Status</th>
            <th scope="col" className="px-5 py-3 text-right font-semibold sm:px-6">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {campaigns.map((c) => (
            <CampaignRow
              key={c.id}
              campaign={c}
              typeOption={typeMap[c.type]}
              busy={busyId === c.id}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}