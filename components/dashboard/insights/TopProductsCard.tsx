 // components/dashboard/insights/TopProductsCard.tsx
import { Award, Layers } from "lucide-react";
import CardShell, { CardEmpty, SkeletonRows } from "./Cardshell";
import { fmtPeso } from "@/components/dashboard/marketing/shared";
import type { InsightsData } from "./types";

export default function TopProductsCard({
  products,
  loading,
}: {
  products: InsightsData["topProducts"] | undefined;
  loading: boolean;
}) {
  const max = Math.max(1, ...(products ?? []).map((p) => p.revenue));

  return (
    <CardShell title="Best sellers" description="Top items by sales in this period." icon={<Award size={18} />} className="h-full">
      {loading ? (
        <SkeletonRows rows={5} />
      ) : !products || products.length === 0 ? (
        <CardEmpty>No product sales yet in this period.</CardEmpty>
      ) : (
        <ol className="space-y-4">
          {products.map((p, i) => (
            <li key={p.sku + i} className="space-y-1.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    {/* 🌟 LAYER UPDATE: Isinama natin ang dynamic badge checking layers */}
                    <div className="flex items-center flex-wrap gap-1.5">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{p.name}</p>
                      
                      {/* BUNDLE MINI BADGE INDICATOR */}
                      {p.isBundle && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-blue-50 px-1 py-0.5 text-[9px] font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
                          <Layers size={8} />
                          {p.bundleType === "MIX_AND_MATCH" ? "Mix & Match" : "Pack"}
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[11px] text-slate-400 dark:text-slate-500">{p.sku}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-slate-900 tabular-nums dark:text-slate-100">{fmtPeso(p.revenue)}</p>
                  <p className="text-[11px] text-slate-500 tabular-nums dark:text-slate-400">{p.unitsSold} sold</p>
                </div>
              </div>
              <div className="ml-9 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" aria-hidden>
                <div className="h-full rounded-full bg-[var(--brand,#0f172a)]" style={{ width: `${(p.revenue / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </CardShell>
  );
}
