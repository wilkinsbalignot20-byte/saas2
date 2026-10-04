// components/dashboard/insights/KpiCard.tsx
import type { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
  /** % pagbabago vs nakaraang period; null = walang basehan */
  delta: number | null;
  loading?: boolean;
}

export default function KpiCard({ label, value, hint, icon, delta, loading }: KpiCardProps) {
  const up = delta !== null && delta > 0.05;
  const down = delta !== null && delta < -0.05;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">{icon}</span>
      </div>

      {loading ? (
        <div className="mt-3 space-y-2">
          <div className="h-8 w-32 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
        </div>
      ) : (
        <>
          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-900 tabular-nums sm:text-3xl">{value}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            {delta === null ? (
              <span className="text-xs text-slate-400">No earlier data to compare</span>
            ) : (
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
                  up ? "bg-emerald-50 text-emerald-700" : down ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"
                }`}
              >
                {up ? <ArrowUpRight size={13} /> : down ? <ArrowDownRight size={13} /> : <Minus size={13} />}
                {Math.abs(delta).toFixed(1)}%
              </span>
            )}
            <span className="text-xs text-slate-400">{hint}</span>
          </div>
        </>
      )}
    </div>
  );
}