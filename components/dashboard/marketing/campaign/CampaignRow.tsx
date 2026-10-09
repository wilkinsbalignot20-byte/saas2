// components/dashboard/marketing/campaign/CampaignRow.tsx
"use client";

import { Rocket } from "lucide-react";
import { StatusPill, DeleteButton, fmtDateTime, durationLabel, endsIn, startsIn } from "../shared";
import { bucket, splitCampaignName } from "./utils";
import type { Campaign, CampaignTypeOption } from "./types";

interface Props {
  campaign: Campaign;
  typeOption?: CampaignTypeOption;
  busy: boolean;
  onDelete: (campaign: Campaign) => void;
}

export default function CampaignRow({ campaign: c, typeOption: t, busy, onDelete }: Props) {
  const b = bucket(c.status);
  const { name: cleanName, imageUrl } = splitCampaignName(c.name);

  return (
    <tr className="transition-colors hover:bg-slate-50">
      <td className="px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3">
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Bundle Display Banner"
                className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
              />
            )}
            <span className="font-semibold text-slate-900">{cleanName}</span>
          </div>

          {c.isPremiumBoosted && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/15">
              <Rocket size={11} /> Boosted
            </span>
          )}
        </div>
      </td>

      <td className="whitespace-nowrap px-4 py-4">
        <span className={`rounded-md px-2 py-1 text-xs font-semibold ${t?.pill ?? "bg-slate-100 text-slate-700"}`}>
          {t?.label ?? c.type}
        </span>
      </td>

      <td className="whitespace-nowrap px-4 py-4">
        <div className="text-slate-700">
          {fmtDateTime(c.startDate)} <span className="text-slate-400">to</span> {fmtDateTime(c.endDate)}
        </div>
        <div className="text-xs text-slate-500">{durationLabel(c.startDate, c.endDate)}</div>
      </td>

      <td className="whitespace-nowrap px-5 py-4 sm:px-6">
        <StatusPill status={c.status} />
        {b === "ACTIVE" && <div className="mt-1 text-xs text-slate-500">{endsIn(c.endDate)}</div>}
        {b === "UPCOMING" && <div className="mt-1 text-xs text-slate-500">{startsIn(c.startDate)}</div>}
      </td>

      <td className="whitespace-nowrap px-5 py-4 text-right sm:px-6">
        <DeleteButton busy={busy} label={`Delete ${cleanName}`} onConfirm={() => onDelete(c)} />
      </td>
    </tr>
  );
}