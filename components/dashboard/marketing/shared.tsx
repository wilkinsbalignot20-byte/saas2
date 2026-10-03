 // components/dashboard/marketing/shared.tsx

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, X, Trash2 } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Formatters                                                          */
/* ------------------------------------------------------------------ */

const pesoFmt = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const fmtPeso = (n: number) => pesoFmt.format(Number.isFinite(n) ? n : 0);

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

/** Date -> value na tanggap ng <input type="datetime-local"> (local time) */
export const toLocalInput = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export const addHoursLocal = (local: string, hours: number) =>
  toLocalInput(new Date(new Date(local).getTime() + hours * 3_600_000));

export const durationLabel = (startIso: string, endIso: string) => {
  const hours = Math.max(0, (new Date(endIso).getTime() - new Date(startIso).getTime()) / 3_600_000);
  if (hours >= 48) return `${Math.round(hours / 24)} days`;
  if (hours >= 1) return `${Math.round(hours)} hrs`;
  return `${Math.max(1, Math.round(hours * 60))} mins`;
};

const spanLabel = (ms: number) => {
  const mins = Math.floor(ms / 60_000);
  const d = Math.floor(mins / 1440);
  const h = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

export const endsIn = (endIso: string) => {
  const ms = new Date(endIso).getTime() - Date.now();
  return ms > 0 ? `Ends in ${spanLabel(ms)}` : "Ended";
};

export const startsIn = (startIso: string) => {
  const ms = new Date(startIso).getTime() - Date.now();
  return ms > 0 ? `Starts in ${spanLabel(ms)}` : "Starting now";
};

/* ------------------------------------------------------------------ */
/* Data helpers                                                        */
/* ------------------------------------------------------------------ */

export async function sendJson<T>(url: string, method: "POST" | "PATCH" | "DELETE", body?: unknown): Promise<T> {
  const hasBody = body !== undefined;
  const res = await fetch(url, {
    method,
    headers: hasBody ? { "Content-Type": "application/json" } : undefined,
    body: hasBody ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || json?.message || "Something went wrong. Please try again.");
  return json as T;
}

export function useList<T>(url: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || json?.message || "Failed to load data.");
      setData(Array.isArray(json) ? json : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, setData, loading, error, reload: load };
}

/* ------------------------------------------------------------------ */
/* Class tokens (brand color galing sa --brand CSS variable)            */
/* ------------------------------------------------------------------ */

export const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 disabled:bg-slate-50 disabled:text-slate-400";

export const btnPrimary =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--brand,#0f172a)] px-4 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

export const btnSecondary =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

/* ------------------------------------------------------------------ */
/* UI primitives                                                       */
/* ------------------------------------------------------------------ */

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </section>
  );
}

export function PanelHeader({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </span>
        <div>
          <h3 className="text-base font-bold tracking-tight text-slate-900">{title}</h3>
          <p className="mt-0.5 max-w-xl text-sm text-slate-500">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

export function StatGrid({ stats }: { stats: { label: string; value: string | number }[] }) {
  return (
    <div className="grid grid-cols-2 gap-px border-y border-slate-200 bg-slate-200 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-white px-5 py-4 sm:px-6">
          <p className="text-xs font-medium text-slate-500">{s.label}</p>
          <p className="mt-1 text-xl font-bold tracking-tight text-slate-900 tabular-nums">{s.value}</p>
        </div>
      ))}
    </div>
  );
}

export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

const PILLS: Record<string, { label: string; cls: string; dot: string }> = {
  ACTIVE: { label: "Active", cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/15", dot: "bg-emerald-500" },
  UPCOMING: { label: "Upcoming", cls: "bg-blue-50 text-blue-700 ring-blue-600/15", dot: "bg-blue-500" },
  ENDED: { label: "Ended", cls: "bg-slate-100 text-slate-600 ring-slate-500/15", dot: "bg-slate-400" },
  EXPIRED: { label: "Expired", cls: "bg-slate-100 text-slate-600 ring-slate-500/15", dot: "bg-slate-400" },
  INACTIVE: { label: "Inactive", cls: "bg-slate-100 text-slate-600 ring-slate-500/15", dot: "bg-slate-400" },
  USED_UP: { label: "Fully claimed", cls: "bg-amber-50 text-amber-700 ring-amber-600/15", dot: "bg-amber-500" },
  DRAFT: { label: "Draft", cls: "bg-amber-50 text-amber-700 ring-amber-600/15", dot: "bg-amber-500" },
};

export function StatusPill({ status }: { status: string }) {
  const key = (status || "").toUpperCase();
  const p = PILLS[key] ?? { label: status || "Unknown", cls: "bg-slate-100 text-slate-600 ring-slate-500/15", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${p.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} aria-hidden />
      {p.label}
    </span>
  );
}

export function Notice({
  kind,
  children,
  onClose,
}: {
  kind: "success" | "error";
  children: ReactNode;
  onClose?: () => void;
}) {
  const ok = kind === "success";
  return (
    <div
      role={ok ? "status" : "alert"}
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
        ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {ok ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <AlertCircle size={18} className="mt-0.5 shrink-0" />}
      <div className="flex-1">{children}</div>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Dismiss" className="shrink-0 opacity-60 transition hover:opacity-100">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export function FilterTabs({
  options,
  value,
  onChange,
}: {
  options: { key: string; label: string; count: number }[];
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
      {options.map((o) => {
        const active = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            aria-pressed={active}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {o.label}
            <span className={`tabular-nums ${active ? "text-white/70" : "text-slate-400"}`}>{o.count}</span>
          </button>
        );
      })}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">{icon}</span>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="max-w-sm text-sm text-slate-500">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-y divide-slate-100" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 sm:px-6">
          <div className="h-4 w-1/4 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-1/5 animate-pulse rounded bg-slate-100" />
          <div className="ml-auto h-6 w-20 animate-pulse rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
        checked ? "bg-emerald-500" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

/** Trash button na may inline na "Delete? Yes / No" confirmation */
export function DeleteButton({
  onConfirm,
  busy,
  label,
}: {
  onConfirm: () => void;
  busy?: boolean;
  label: string;
}) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs">
        <span className="font-medium text-slate-600">Delete?</span>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setConfirming(false);
            onConfirm();
          }}
          className="rounded-md bg-red-600 px-2 py-1 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-md px-2 py-1 font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          No
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => setConfirming(true)}
      aria-label={label}
      title={label}
      className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
    >
      <Trash2 size={16} />
    </button>
  );
}