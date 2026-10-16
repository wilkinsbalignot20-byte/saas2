 "use client";

import React from "react";
import {
  ComplaintRow,
  InventoryRow,
  ReportTab,
  SalesRow,
  filterComplaints,
  filterInventory,
  filterSales,
  peso,
} from "./report-utils";

interface ReportTableProps {
  activeTab: ReportTab;
  // 📝 PATANDAAN (BAGO): kailangan na ang tenant at dateRange para mag-filter ang table
  // gaya ng export.
  selectedTenant: string;
  dateRange: string;
  salesData: SalesRow[];
  inventoryData: InventoryRow[];
  complaintsData: ComplaintRow[];
}

type Tone = "green" | "red" | "amber" | "blue";

const TONES: Record<Tone, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/25",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
};

function StatusBadge({ tone, label }: { tone: Tone; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  );
}

const th = "sticky top-0 z-10 border-b border-gray-200 bg-gray-50 px-5 py-3.5 text-xs font-semibold text-gray-600";
const tr = "transition-colors hover:bg-emerald-50/40";
const tdBase = "px-5 py-4";

function TableShell({
  children,
  shown,
  total,
}: {
  children: React.ReactNode;
  shown: number;
  total: number;
}) {
  return (
    <>
      <div className="min-h-[24rem] max-h-[70vh] overflow-auto">
        <table className="w-full border-collapse text-left text-sm">{children}</table>
      </div>
      <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-5 py-3 text-xs text-gray-500">
        <span>
          Showing <span className="font-semibold text-gray-700">{shown}</span> of {total} records
        </span>
      </div>
    </>
  );
}

// 📝 PATANDAAN (BAGO): Empty state — dati blangko lang ang table kapag walang resulta.
function EmptyRow({ cols }: { cols: number }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-14 text-center">
        <p className="text-sm font-medium text-gray-700">Walang records na tugma sa filters.</p>
        <p className="mt-1 text-xs text-gray-500">
          Subukang palawakin ang date range o piliin ang “All Tenants / Stores”.
        </p>
      </td>
    </tr>
  );
}

export default function ReportTable({
  activeTab,
  selectedTenant,
  dateRange,
  salesData,
  inventoryData,
  complaintsData,
}: ReportTableProps) {
  const sales = filterSales(salesData, selectedTenant, dateRange);
  const inventory = filterInventory(inventoryData, selectedTenant);
  const complaints = filterComplaints(complaintsData, selectedTenant, dateRange);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* SALES VIEW */}
      {activeTab === "sales" && (
        <TableShell shown={sales.length} total={salesData.length}>
          <thead>
            <tr>
              <th className={th}>Order ID</th>
              <th className={th}>Date</th>
              <th className={th}>Tenant Store</th>
              <th className={th}>Customer</th>
              <th className={`${th} text-right`}>Gross Amount</th>
              <th className={`${th} text-center`}>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sales.length === 0 && <EmptyRow cols={6} />}
            {sales.map((row) => (
              <tr key={row.id} className={tr}>
                <td className={`${tdBase} font-mono font-medium text-gray-900`}>{row.id}</td>
                <td className={`${tdBase} tabular-nums text-gray-500`}>{row.date}</td>
                <td className={`${tdBase} font-medium text-gray-800`}>{row.tenant}</td>
                <td className={`${tdBase} text-gray-600`}>{row.customer}</td>
                <td className={`${tdBase} text-right font-semibold tabular-nums text-gray-900`}>
                  {peso(row.amount)}
                </td>
                <td className={`${tdBase} text-center`}>
                  <StatusBadge tone={row.status === "Paid" ? "green" : "red"} label={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}

      {/* INVENTORY VIEW */}
      {activeTab === "inventory" && (
        <TableShell shown={inventory.length} total={inventoryData.length}>
          <thead>
            <tr>
              <th className={th}>SKU / Item Code</th>
              <th className={th}>Product Name</th>
              <th className={th}>Tenant Store</th>
              <th className={`${th} text-right`}>Available Stock</th>
              <th className={`${th} text-center`}>Stock Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {inventory.length === 0 && <EmptyRow cols={5} />}
            {inventory.map((row) => (
              <tr key={row.sku} className={tr}>
                <td className={`${tdBase} font-mono font-medium text-gray-900`}>{row.sku}</td>
                <td className={`${tdBase} font-medium text-gray-800`}>{row.name}</td>
                <td className={`${tdBase} text-gray-600`}>{row.tenant}</td>
                <td className={`${tdBase} text-right font-semibold tabular-nums text-gray-900`}>
                  {row.stock} left
                </td>
                <td className={`${tdBase} text-center`}>
                  <StatusBadge tone={row.status === "Low Stock" ? "amber" : "blue"} label={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}

      {/* COMPLAINTS VIEW */}
      {activeTab === "complaints" && (
        <TableShell shown={complaints.length} total={complaintsData.length}>
          <thead>
            <tr>
              <th className={th}>Ticket ID</th>
              <th className={th}>Date Logged</th>
              <th className={th}>Tenant Involved</th>
              <th className={th}>Customer</th>
              <th className={th}>Issue Description</th>
              <th className={`${th} text-center`}>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {complaints.length === 0 && <EmptyRow cols={6} />}
            {complaints.map((row) => (
              <tr key={row.id} className={tr}>
                <td className={`${tdBase} font-mono font-medium text-gray-900`}>{row.id}</td>
                <td className={`${tdBase} tabular-nums text-gray-500`}>{row.date}</td>
                <td className={`${tdBase} font-medium text-gray-800`}>{row.tenant}</td>
                <td className={`${tdBase} text-gray-600`}>{row.customer}</td>
                <td className={`${tdBase} font-medium text-red-700`}>{row.issue}</td>
                <td className={`${tdBase} text-center`}>
                  <StatusBadge tone={row.status === "Resolved" ? "green" : "amber"} label={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </div>
  );
}