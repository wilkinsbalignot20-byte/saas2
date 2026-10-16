 "use client";

import React, { useState, use } from "react";
import ReportFilters from "@/components/dashboard/reports/report-filters";
import ExportButton from "@/components/dashboard/reports/export-button";
import ReportTable from "@/components/dashboard/reports/report-table";
import {
  ComplaintRow,
  DEFAULT_RANGE,
  DEFAULT_TENANT,
  InventoryRow,
  ReportTab,
  SalesRow,
  filterComplaints,
  filterInventory,
  filterSales,
  peso,
} from "@/components/dashboard/reports/report-utils";

// Mock Data para sa Multi-Tenant System
// 📝 PATANDAAN: Mock pa lang ito. Papalitan ng totoong fetch (Supabase/n8n) kapag handa na.
const mockSalesData: SalesRow[] = [
  { id: "ORD-2026-81149", date: "2026-10-02", tenant: "Alpha Store", customer: "Juan Dela Cruz", amount: 2040, status: "Paid" },
  { id: "ORD-2026-33064", date: "2026-10-02", tenant: "Beta Boutique", customer: "Juan Dela Cruz", amount: 2040, status: "Failed" },
  { id: "ORD-2026-12345", date: "2026-10-14", tenant: "Alpha Store", customer: "Maria Clara", amount: 1500, status: "Paid" },
];

const mockInventoryData: InventoryRow[] = [
  { sku: "MANI-CZ333", name: "Honda", tenant: "Alpha Store", stock: 3, status: "Low Stock" },
  { sku: "MANI-CZ1083", name: "Red Jacket", tenant: "Beta Boutique", stock: 4, status: "Low Stock" },
  { sku: "MANI-CZ1004", name: "Sasakayan", tenant: "Alpha Store", stock: 4, status: "Low Stock" },
  { sku: "MANI-CZ9999", name: "Green Premium Product", tenant: "Beta Boutique", stock: 45, status: "In Stock" },
];

const mockComplaintsData: ComplaintRow[] = [
  { id: "TKT-9910", date: "2026-10-05", tenant: "Alpha Store", customer: "Pedro Penduko", issue: "Delayed Delivery", status: "Open" },
  { id: "TKT-9911", date: "2026-10-10", tenant: "Beta Boutique", customer: "Maria Clara", issue: "Wrong Item Color", status: "Resolved" },
];

const TABS: { key: ReportTab; label: string }[] = [
  { key: "sales", label: "Sales & Orders" },
  { key: "inventory", label: "Inventory Ledger" },
  { key: "complaints", label: "Customer Complaints" },
];

export default function ReportsPage({ params }: { params: Promise<{ slug: string }> }) {
  // Safe unwrap ng Promise params para sa Next.js 15/16
  const unwrappedParams = use(params);

  const [activeTab, setActiveTab] = useState<ReportTab>("sales");
  const [selectedTenant, setSelectedTenant] = useState(DEFAULT_TENANT);
  const [dateRange, setDateRange] = useState(DEFAULT_RANGE);

  // 📝 PATANDAAN (BAGO): Summary numbers na sumusunod sa filters. Wala ito dati kaya kailangan
  // pang bilangin ng mano ang table.
  const sales = filterSales(mockSalesData, selectedTenant, dateRange);
  const inventory = filterInventory(mockInventoryData, selectedTenant);
  const complaints = filterComplaints(mockComplaintsData, selectedTenant, dateRange);

  // 📝 PATANDAAN: "Paid" lang ang binibilang sa kita; ang Failed orders ay hindi totoong benta.
  const paidTotal = sales.filter((s) => s.status === "Paid").reduce((sum, s) => sum + s.amount, 0);
  const failedCount = sales.filter((s) => s.status !== "Paid").length;
  const lowStockCount = inventory.filter((i) => i.status === "Low Stock").length;
  const openComplaints = complaints.filter((c) => c.status !== "Resolved").length;

  const tabCounts: Record<ReportTab, number> = {
    sales: sales.length,
    inventory: inventory.length,
    complaints: complaints.length,
  };

  const kpis = [
    { label: "Paid sales", value: peso(paidTotal), note: `${sales.length} orders sa napiling range` },
    { label: "Failed payments", value: String(failedCount), note: failedCount > 0 ? "Kailangang i-follow up" : "Walang failed" },
    { label: "Low stock items", value: String(lowStockCount), note: `sa ${inventory.length} na produkto` },
    { label: "Open complaints", value: String(openComplaints), note: `sa ${complaints.length} na tickets` },
  ];

  return (
    <div className="w-full space-y-6 p-6 text-gray-800 lg:p-8 xl:px-10">
      {/* Header Section */}
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Operational Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            I-download at suriin ang detalyadong data ng iyong marketplace ({unwrappedParams.slug})
          </p>
        </div>

        {/* 1. KONEKTADO NA ANG FILTERS COMPONENT */}
        <ReportFilters
          selectedTenant={selectedTenant}
          setSelectedTenant={setSelectedTenant}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
      </div>

      {/* Summary strip */}
      <dl className="grid grid-cols-2 divide-x divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm lg:grid-cols-4 lg:divide-y-0">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="px-6 py-5">
            <dt className="text-xs font-medium text-gray-500">{kpi.label}</dt>
            <dd className="mt-1.5 text-3xl font-semibold tabular-nums tracking-tight text-gray-900">{kpi.value}</dd>
            <p className="mt-0.5 text-xs text-gray-400">{kpi.note}</p>
          </div>
        ))}
      </dl>

      {/* Tabs + Export (magkatabi na para malinaw kung ano ang ie-export) */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-200">
        <div className="flex gap-6" role="tablist" aria-label="Report type">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.key)}
                className={`-mb-px flex items-center gap-2 border-b-2 pb-3 text-sm transition-colors focus:outline-none focus-visible:text-emerald-700 ${
                  isActive
                    ? "border-emerald-600 font-semibold text-emerald-700"
                    : "border-transparent font-medium text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                    isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {tabCounts[tab.key]}
                </span>
              </button>
            );
          })}
        </div>

        {/* 2. KONEKTADO NA ANG EXPORT BUTTON COMPONENT */}
        <div className="pb-2">
          <ExportButton
            activeTab={activeTab}
            selectedTenant={selectedTenant}
            dateRange={dateRange}
            salesData={mockSalesData}
            inventoryData={mockInventoryData}
            complaintsData={mockComplaintsData}
          />
        </div>
      </div>

      {/* 3. KONEKTADO NA ANG MAIN TABLE COMPONENT */}
      <ReportTable
        activeTab={activeTab}
        selectedTenant={selectedTenant}
        dateRange={dateRange}
        salesData={mockSalesData}
        inventoryData={mockInventoryData}
        complaintsData={mockComplaintsData}
      />
    </div>
  );
}