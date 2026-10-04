// components/dashboard/insights/StatusBreakdown.tsx
import type { ReactNode } from "react";
import CardShell, { CardEmpty } from "./Cardshell";

export interface Segment {
  key: string;
  label: string;
  count: number;
  color: string; // tailwind bg class
}

export default function StatusBreakdown({
  title,
  description,
  icon,
  segments,
  loading,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  segments: Segment[];
  loading: boolean;
}) {
  const total = segments.reduce((n, s) => n + s.count, 0);

  return (
    <CardShell title={title} description={description} icon={icon}>
      {loading ? (
        <div className="space-y-3">
          <div className="h-3 animate-pulse rounded-full bg-slate-100" />
          <div className="h-16 animate-pulse rounded-lg bg-slate-100" />
        </div>
      ) : total === 0 ? (
        <CardEmpty>No orders in this period.</CardEmpty>
      ) : (
        <div className="space-y-4">
          <div className="flex h-3 overflow-hidden rounded-full bg-slate-100" role="img" aria-label={`${title} breakdown`}>
            {segments
              .filter((s) => s.count > 0)
              .map((s) => (
                <div key={s.key} className={s.color} style={{ width: `${(s.count / total) * 100}%` }} title={`${s.label}: ${s.count}`} />
              ))}
          </div>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
            {segments.map((s) => (
              <li key={s.key} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} aria-hidden />
                  {s.label}
                </span>
                <span className="font-semibold text-slate-900 tabular-nums">{s.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </CardShell>
  );
}