// components/dashboard/insights/CardShell.tsx
import type { ReactNode } from "react";

interface CardShellProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Karaniwang balangkas ng bawat card sa Insights */
export default function CardShell({ title, description, icon, action, children, className = "" }: CardShellProps) {
  return (
    <section className={`flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <header className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
        <div className="flex items-start gap-3">
          {icon && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              {icon}
            </span>
          )}
          <div>
            <h3 className="text-sm font-bold tracking-tight text-slate-900">{title}</h3>
            {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
          </div>
        </div>
        {action}
      </header>
      <div className="flex-1 px-5 pb-5">{children}</div>
    </section>
  );
}

export function CardEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full min-h-[140px] items-center justify-center rounded-lg border border-dashed border-slate-200 px-4 text-center text-sm text-slate-400">
      {children}
    </div>
  );
}

export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-11 animate-pulse rounded-lg bg-slate-100" />
      ))}
    </div>
  );
}