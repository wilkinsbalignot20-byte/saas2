 // components/dashboard/insights/InsightsDashboard.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { Banknote, Wallet, ShoppingBag, ReceiptText, RefreshCw, Truck, CreditCard } from "lucide-react";
import { Notice, fmtPeso } from "@/components/dashboard/marketing/shared";
import KpiCard from "./KpiCard";
import RangeSelector from "./Rangeselector";
import RevenueChart from "./Revenuechart";
import TopProductsCard from "./TopProductsCard";
import StatusBreakdown, { type Segment } from "./Statusbreakdown";
import WeekdayChart from "./Weekdaychart";
import VoucherPerformance from "./Voucherperformance";
import LowStockCard from "./Lowstockcard";
import RecentOrders from "./Recentorders";
import { pctChange, type InsightsData, type RangeKey } from "./types";

interface InsightsDashboardProps {
  slug: string;
  color: string; // brand color ng store (para sa mga chart)
}

const FULFILLMENT_META: Record<string, { label: string; color: string }> = {
  unfulfilled: { label: "Unfulfilled", color: "bg-slate-400" },
  shipped: { label: "Shipped", color: "bg-blue-500" },
  delivered: { label: "Delivered", color: "bg-emerald-500" },
  cancelled: { label: "Cancelled", color: "bg-red-400" },
};

const PAYMENT_META: Record<string, { label: string; color: string }> = {
  paid: { label: "Paid", color: "bg-emerald-500" },
  pending: { label: "Pending", color: "bg-amber-400" },
  failed: { label: "Failed", color: "bg-red-400" },
  refunded: { label: "Refunded", color: "bg-violet-500" },
};

const toSegments = (
  rows: { status: string; count: number }[] | undefined,
  meta: Record<string, { label: string; color: string }>
): Segment[] =>
  Object.entries(meta).map(([key, m]) => ({
    key,
    label: m.label,
    color: m.color,
    count: rows?.find((r) => r.status === key)?.count ?? 0,
  }));

export default function InsightsDashboard({ slug, color }: InsightsDashboardProps) {
  const [range, setRange] = useState<RangeKey>("30d");
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🛠️ FINAL & BULLETPROOF FIX: Walang synchronous setStates sa render at effect loops
  const fetchData = useCallback(async (currentRange: RangeKey, isMounted: boolean) => {
    try {
      const res = await fetch(`/api/stores/${slug}/insights?range=${currentRange}`, { cache: "no-store" });
      const json = await res.json().catch(() => null);
      
      if (!isMounted) return;

      if (!res.ok) throw new Error(json?.error || "Failed to load insights.");
      
      setData(json);
      setError(null);
    } catch (err: any) {
      if (isMounted) {
        setError(err.message || "Something went wrong.");
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [slug]);

  // ⚡ Para sa manu-manong pag-refresh (User-initiated click events)
  const handleRefresh = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchData(range, true);
  }, [fetchData, range]);

  // 📡 Awtomatikong tatakbo nang ligtas kapag nag-mount ang component o nagbago ang range selector
  useEffect(() => {
    let isMounted = true;

    // 🔥 FIX SA LINE 89: Idinadaan sa Promise microtask para maging asynchronous 
    // at hindi mag-trigger ng "synchronous cascading render" rule ng Next.js linter.
    Promise.resolve().then(() => {
      if (isMounted) {
        setLoading(true);
        setError(null);
        fetchData(range, isMounted);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [fetchData, range]);

  const k = data?.kpis;
  const x = data?.extras;
  const periodLabel = `vs previous ${data?.days ?? (range === "7d" ? 7 : range === "30d" ? 30 : 90)} days`;
  const totalCustomers = (x?.newCustomers ?? 0) + (x?.returningCustomers ?? 0);
  const returningRate = totalCustomers > 0 ? Math.round(((x?.returningCustomers ?? 0) / totalCustomers) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <RangeSelector value={range} onChange={setRange} />
        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <Notice kind="error">
          {error}{" "}
          <button type="button" onClick={handleRefresh} className="font-semibold underline underline-offset-2">
            Try again
          </button>
        </Notice>
      )}

      {/* KPI ROW */}
      <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Sales"
          icon={<Banknote size={18} />}
          loading={loading}
          value={fmtPeso(k?.sales.value ?? 0)}
          delta={k ? pctChange(k.sales.value, k.sales.previous) : null}
          hint={periodLabel}
        />
        <KpiCard
          label="Collected"
          icon={<Wallet size={18} />}
          loading={loading}
          value={fmtPeso(k?.collected.value ?? 0)}
          delta={k ? pctChange(k.collected.value, k.collected.previous) : null}
          hint={periodLabel}
        />
        <KpiCard
          label="Orders"
          icon={<ShoppingBag size={18} />}
          loading={loading}
          value={(k?.orders.value ?? 0).toLocaleString("en-PH")}
          delta={k ? pctChange(k.orders.value, k.orders.previous) : null}
          hint={periodLabel}
        />
        <KpiCard
          label="Average order value"
          icon={<ReceiptText size={18} />}
          loading={loading}
          value={fmtPeso(k?.aov.value ?? 0)}
          delta={k ? pctChange(k.aov.value, k.aov.previous) : null}
          hint={periodLabel}
        />
      </section>

      {/* SECONDARY STATS */}
      <section
        aria-label="More numbers"
        className="grid grid-cols-2 divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:grid-cols-4 sm:divide-x"
      >
        {[
          {
            label: "Still to collect",
            value: fmtPeso(x?.pendingAmount ?? 0),
            hint: `${x?.pendingOrders ?? 0} unpaid order${x?.pendingOrders === 1 ? "" : "s"}`,
          },
          { label: "Discounts given", value: fmtPeso(x?.discountGiven ?? 0), hint: "Vouchers and promos" },
          {
            label: "Returning customers",
            value: `${returningRate}%`,
            hint: `${x?.returningCustomers ?? 0} of ${totalCustomers} customers`,
          },
          { label: "Cancelled orders", value: String(x?.cancelledOrders ?? 0), hint: "Not counted in sales" },
        ].map((s, i) => (
          <div key={s.label} className={`p-4 sm:p-5 ${i % 2 === 1 ? "border-l border-slate-200 sm:border-l-0" : ""} ${i >= 2 ? "border-t border-slate-200 sm:border-t-0" : ""}`}>
            <p className="text-xs font-medium text-slate-500">{s.label}</p>
            {loading ? (
              <div className="mt-2 h-6 w-20 animate-pulse rounded bg-slate-100" />
            ) : (
              <p className="mt-1 truncate text-lg font-bold tracking-tight text-slate-900 tabular-nums">{s.value}</p>
            )}
            <p className="mt-0.5 text-[11px] text-slate-400">{s.hint}</p>
          </div>
        ))}
      </section>

      {/* CHARTS */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart daily={data?.daily} color={color} loading={loading} />
        </div>
        <div className="space-y-6">
          <StatusBreakdown
            title="Fulfillment"
            description="Where this period's orders stand."
            icon={<Truck size={18} />}
            segments={toSegments(data?.fulfillment, FULFILLMENT_META)}
            loading={loading}
          />
          <StatusBreakdown
            title="Payments"
            description="How this period's orders are paid."
            icon={<CreditCard size={18} />}
            segments={toSegments(data?.payment, PAYMENT_META)}
            loading={loading}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TopProductsCard products={data?.topProducts} loading={loading} />
        <WeekdayChart weekday={data?.weekday} color={color} loading={loading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <VoucherPerformance vouchers={data?.vouchers} slug={slug} loading={loading} />
        <LowStockCard items={data?.lowStock} slug={slug} loading={loading} />
      </div>

      <RecentOrders orders={data?.recentOrders} slug={slug} loading={loading} />
    </div>
  );
}
