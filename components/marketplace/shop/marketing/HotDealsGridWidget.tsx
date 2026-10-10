// components/marketplace/shop/marketing/HotDealsGridWidget.tsx
"use client";

import { Flame } from "lucide-react";

export default function HotDealsGridWidget({ boosts, themeColor }: { boosts: any[]; themeColor: string }) {
  return (
    <div className="p-6 rounded-2xl border bg-white space-y-4 shadow-xs" style={{ borderColor: `${themeColor}30` }}>
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
          <Flame size={20} className="animate-bounce" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Mga Mainit na Patok ngayon (Hot Deals)</h3>
          <p className="text-xs text-slate-400">Ang mga pinakamalalaking patalastas at diskwento na tinatangkilik ngayon.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {boosts.map((campaign) => {
          const [cleanName, imageUrl] = campaign.name.split("||IMAGE||");
          return (
            <div key={campaign.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 flex gap-3 items-center group hover:bg-white hover:shadow-xs transition duration-200">
              {imageUrl && (
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-white">
                  <img src={imageUrl} alt={cleanName} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-slate-700">{cleanName}</h4>
                <span className="inline-block text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                  🔥 Naka-Boost
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
