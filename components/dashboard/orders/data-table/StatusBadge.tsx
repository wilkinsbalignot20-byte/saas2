// components/dashboard/orders/data-table/StatusBadge.tsx
import type { StatusStyle } from "./types";

interface Props {
  status: string;
  styles: Record<string, StatusStyle>;
}

export default function StatusBadge({ status, styles }: Props) {
  const s = styles[status] ?? {
    label: status,
    badge: "bg-slate-100 text-slate-700 ring-slate-500/15 dark:bg-slate-800 dark:text-slate-300",
    dot: "bg-slate-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${s.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden />
      {s.label}
    </span>
  );
}