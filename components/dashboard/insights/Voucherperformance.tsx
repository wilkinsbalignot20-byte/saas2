// components/dashboard/insights/VoucherPerformance.tsx
import Link from "next/link";
import { Ticket } from "lucide-react";
import CardShell, { CardEmpty, SkeletonRows } from "./Cardshell";
import { fmtPeso } from "@/components/dashboard/marketing/shared";
import type { InsightsData } from "./types";

type Voucher = InsightsData["vouchers"][number];

function state(v: Voucher): { label: string; cls: string } {
  if (!v.isActive) return { label: "Inactive", cls: "bg-slate-100 text-slate-600" };
  if (v.expiresAt && new Date(v.expiresAt) <= new Date()) return { label: "Expired", cls: "bg-slate-100 text-slate-600" };
  if (v.maxClaims != null && v.claims >= v.maxClaims) return { label: "Fully claimed", cls: "bg-amber-50 text-amber-700" };
  return { label: "Active", cls: "bg-emerald-50 text-emerald-700" };
}

export default function VoucherPerformance({
  vouchers,
  slug,
  loading,
}: {
  vouchers: InsightsData["vouchers"] | undefined;
  slug: string;
  loading: boolean;
}) {
  return (
    <CardShell
      title="Voucher performance"
      description="Your most-used discount codes (all time)."
      icon={<Ticket size={18} />}
      className="h-full"
      action={
        <Link href={`/dashboard/${slug}/marketing`} className="text-xs font-semibold text-slate-500 hover:text-slate-900">
          Manage
        </Link>
      }
    >
      {loading ? (
        <SkeletonRows rows={4} />
      ) : !vouchers || vouchers.length === 0 ? (
        <CardEmpty>No vouchers yet. Create one in Marketing to track how it performs.</CardEmpty>
      ) : (
        <ul className="divide-y divide-slate-100">
          {vouchers.map((v) => {
            const s = state(v);
            const pct = v.maxClaims ? Math.min(100, (v.claims / v.maxClaims) * 100) : null;
            return (
              <li key={v.code} className="space-y-2 py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-2 py-0.5 font-mono text-xs font-bold text-slate-900">
                      {v.code}
                    </span>
                    <span className="truncate text-xs text-slate-500">
                      {v.type === "PERCENTAGE" ? `${v.value}% off` : `${fmtPeso(v.value)} off`}
                    </span>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.cls}`}>{s.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  {pct !== null && (
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100" aria-hidden>
                      <div className="h-full rounded-full bg-[var(--brand,#0f172a)]" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                  <span className="ml-auto text-xs font-semibold text-slate-700 tabular-nums">
                    {v.claims}
                    {v.maxClaims != null ? ` / ${v.maxClaims}` : ""} claimed
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </CardShell>
  );
}