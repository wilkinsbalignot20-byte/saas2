
"use client";

import { useId } from "react";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import CardShell, { CardEmpty } from "./Cardshell";
import { compactPeso, type InsightsData } from "./types";

const fmtDay = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-PH", { month: "short", day: "numeric" });

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as { date: string; sales: number; orders: number };
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-slate-900">{fmtDay(p.date)}</p>
      <p className="mt-1 text-slate-600">
        Sales: <span className="font-semibold text-slate-900">₱{p.sales.toLocaleString("en-PH", { maximumFractionDigits: 2 })}</span>
      </p>
      <p className="text-slate-600">
        Orders: <span className="font-semibold text-slate-900">{p.orders}</span>
      </p>
    </div>
  );
}

export default function RevenueChart({
  daily,
  color,
  loading,
}: {
  daily: InsightsData["daily"] | undefined;
  color: string;
  loading: boolean;
}) {
  const gradientId = useId().replace(/:/g, "");
  const hasSales = (daily ?? []).some((d) => d.sales > 0);

  return (
    <CardShell
      title="Sales over time"
      description="Daily sales from orders that weren't cancelled, failed, or refunded."
      icon={<TrendingUp size={18} />}
      className="h-full"
    >
      <div className="h-72 w-full">
        {loading ? (
          <div className="h-full w-full animate-pulse rounded-lg bg-slate-100" />
        ) : !hasSales ? (
          <CardEmpty>No sales in this period yet. New orders will show up here.</CardEmpty>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={daily} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tickFormatter={fmtDay}
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                minTickGap={28}
              />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={compactPeso} width={56} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }} />
              <Area type="monotone" dataKey="sales" stroke={color} strokeWidth={2} fill={`url(#${gradientId})`} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </CardShell>
  );
}