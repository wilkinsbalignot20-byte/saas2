// components/dashboard/orders/data-table/FulfillmentTabs.tsx
import { FULFILLMENT_TABS } from "./constants";

interface Props {
  value: string;
  counts: Record<string, number>;
  themeColor: string;
  onChange: (key: string) => void;
}

export default function FulfillmentTabs({ value, counts, themeColor, onChange }: Props) {
  return (
    <div className="border-b border-slate-200 px-2 dark:border-slate-800" role="tablist" aria-label="Filter by fulfillment status">
      <div className="flex gap-1 overflow-x-auto">
        {FULFILLMENT_TABS.map((tab) => {
          const active = value === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.key)}
              className={`relative flex shrink-0 items-center gap-2 px-3 py-3.5 text-sm font-medium transition-colors ${
                active
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                  active
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {counts[tab.key] ?? 0}
              </span>
              {active && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full" style={{ backgroundColor: themeColor }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}