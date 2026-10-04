// components/dashboard/insights/TopProductsCard.tsx
import { Award } from "lucide-react";
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
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-600">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{p.name}</p>
                    <p className="font-mono text-[11px] text-slate-400">{p.sku}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-slate-900 tabular-nums">{fmtPeso(p.revenue)}</p>
                  <p className="text-[11px] text-slate-500 tabular-nums">{p.unitsSold} sold</p>
                </div>
              </div>
              <div className="ml-9 h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden>
                <div className="h-full rounded-full bg-[var(--brand,#0f172a)]" style={{ width: `${(p.revenue / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </CardShell>
  );
}