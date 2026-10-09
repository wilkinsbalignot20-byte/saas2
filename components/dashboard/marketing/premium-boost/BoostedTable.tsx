// components/dashboard/marketing/premium-boost/BoostedTable.tsx
"use client";

import { Rocket, Megaphone } from "lucide-react";
import { StatusPill, EmptyState } from "../shared";
import { TYPE_LABELS, slotLabel } from "./constants";
import type { BoostCampaign } from "./types";

interface Props {
  campaigns: BoostCampaign[];
  onRemove: (campaign: BoostCampaign) => void;
}

/** Listahan ng mga naka-boost na campaign */
export default function BoostedTable({ campaigns, onRemove }: Props) {
  return (
    <div>
      <div className="px-5 pb-3 pt-5 sm:px-6">
        <h4 className="text-sm font-bold text-slate-900">Boosted campaigns</h4>
      </div>

      {campaigns.length === 0 ? (
        <EmptyState
          icon={<Megaphone size={22} />}
          title="No boosted campaigns"
          description="Boosted campaigns will appear here once they're placed on the Marketplace."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50/80 text-xs text-slate-500">
                <th scope="col" className="px-5 py-3 font-semibold sm:px-6">Campaign</th>
                <th scope="col" className="px-4 py-3 font-semibold">Ad spot</th>
                <th scope="col" className="px-5 py-3 font-semibold sm:px-6">Status</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold sm:px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-5 py-4 sm:px-6">
                    <div className="font-semibold text-slate-900">{c.name}</div>
                    <div className="text-xs text-slate-500">{TYPE_LABELS[c.type] ?? c.type}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                      <Rocket size={12} /> {slotLabel(c.boostedSlotType)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                    <StatusPill status={c.status} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right sm:px-6">
                    <button
                      type="button"
                      onClick={() => onRemove(c)}
                      className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      Remove boost
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}