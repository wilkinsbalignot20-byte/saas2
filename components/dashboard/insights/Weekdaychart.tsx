// components/dashboard/insights/WeekdayChart.tsx
"use client";

import { CalendarDays } from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import CardShell, { CardEmpty } from "./Cardshell";
import type { InsightsData } from "./types";

const FULL: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

export default function WeekdayChart({
  weekday,
  color,
  loading,
}: {
  weekday: InsightsData["weekday"] | undefined;
  color: string;
  loading: boolean;
}) {
  const data = weekday ?? [];
  const best = data.reduce((a, b) => (b.orders > a.orders ? b : a), data[0] ?? { day: "", orders: 0, sales: 0 });
  const hasData = data.some((d) => d.orders > 0);

  return (
    <CardShell
      title="Busiest days"
      description={hasData ? `${FULL[best.day]} brings in the most orders.` : "Which days of the week get the most orders."}
      icon={<CalendarDays size={18} />}
      className="h-full"
    >
      <div className="h-56 w-full">
        {loading ? (
          <div className="h-full w-full animate-pulse rounded-lg bg-slate-100" />
        ) : !hasData ? (
          <CardEmpty>Not enough orders yet to show a weekly pattern.</CardEmpty>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                formatter={(v: any) => [`${v} orders`, ""]}
                labelFormatter={(l: any) => FULL[l] ?? l}
                separator=""
              />
              <Bar dataKey="orders" radius={[6, 6, 0, 0]} maxBarSize={36}>
                {data.map((d) => (
                  <Cell key={d.day} fill={d.day === best.day ? color : "#e2e8f0"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </CardShell>
  );
}