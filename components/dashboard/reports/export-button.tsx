 "use client";

import React, { useEffect, useRef, useState } from "react";
import ExcelJS from "exceljs";
import {
  ComplaintRow,
  InventoryRow,
  ReportTab,
  SalesRow,
  filterComplaints,
  filterInventory,
  filterSales,
} from "./report-utils";

interface ExportButtonProps {
  activeTab: ReportTab;
  selectedTenant: string;
  dateRange: string;
  salesData: SalesRow[];
  inventoryData: InventoryRow[];
  complaintsData: ComplaintRow[];
}

type Cell = string | number;

const TAB_LABEL: Record<ReportTab, string> = {
  sales: "Sales & Orders",
  inventory: "Inventory Ledger",
  complaints: "Customer Complaints",
};

export default function ExportButton({
  activeTab,
  selectedTenant,
  dateRange,
  salesData,
  inventoryData,
  complaintsData,
}: ExportButtonProps) {
  // 📝 PATANDAAN (BAGO): dropdown na ang Export — may Excel at CSV na pagpipilian.
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Isara kapag nag-click sa labas o pinindot ang Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Ihanda ang Data at Headers base sa Tab (parehong logic na dati, nilipat lang sa isang function
  // para iisa ang pinagkukunan ng Excel at CSV)
  const buildExport = () => {
    let headers: string[] = [];
    let rows: Cell[][] = [];

    const today = new Date().toISOString().slice(0, 10);
    const rangePart = activeTab === "inventory" ? "snapshot" : `last${dateRange}d`;
    const fileName = `${activeTab}-report-${selectedTenant}-${rangePart}-${today}`;

    if (activeTab === "sales") {
      headers = ["Order ID", "Date", "Tenant Store", "Customer", "Gross Amount", "Status"];
      rows = filterSales(salesData, selectedTenant, dateRange).map((r) => [r.id, r.date, r.tenant, r.customer, r.amount, r.status]);
    } else if (activeTab === "inventory") {
      headers = ["SKU Code", "Product Name", "Tenant Store", "Available Stock", "Stock Status"];
      rows = filterInventory(inventoryData, selectedTenant).map((r) => [r.sku, r.name, r.tenant, r.stock, r.status]);
    } else {
      headers = ["Ticket ID", "Date Logged", "Tenant Involved", "Customer", "Issue", "Status"];
      rows = filterComplaints(complaintsData, selectedTenant, dateRange).map((r) => [r.id, r.date, r.tenant, r.customer, r.issue, r.status]);
    }
    return { headers, rows, fileName };
  };

  const rowCount = buildExport().rows.length;

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /* ───────────── EXCEL (.xlsx) ───────────── */
  const handleExportExcel = async () => {
    setOpen(false);
    const { headers, rows, fileName } = buildExport();

    if (rows.length === 0) {
      alert("Walang data na pwedeng i-export.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Report Data");

    const headerRow = worksheet.addRow(headers);
    headerRow.height = 24;
    headerRow.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF047857" } };
      cell.font = { name: "Segoe UI", bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    rows.forEach((row, i) => {
      const excelRow = worksheet.addRow(row);
      excelRow.eachCell((cell) => {
        cell.font = { name: "Segoe UI", size: 10 };
        cell.alignment = { vertical: "middle" };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE5E7EB" } },
          bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
          left: { style: "thin", color: { argb: "FFE5E7EB" } },
          right: { style: "thin", color: { argb: "FFE5E7EB" } },
        };
        if (i % 2 === 1) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9FAFB" } };
        }
      });
    });

    if (activeTab === "sales") {
      const amountCol = worksheet.getColumn(5);
      amountCol.numFmt = '"₱"#,##0';
      amountCol.alignment = { horizontal: "right", vertical: "middle" };
    } else if (activeTab === "inventory") {
      worksheet.getColumn(4).alignment = { horizontal: "right", vertical: "middle" };
    }
    headerRow.eachCell((cell) => {
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    worksheet.views = [{ state: "frozen", ySplit: 1 }];
    worksheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } };

    worksheet.columns.forEach((column) => {
      let maxLen = 0;
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const value = cell.value ? cell.value.toString() : "";
        if (value.length > maxLen) maxLen = value.length;
      });
      column.width = maxLen < 12 ? 14 : maxLen + 4;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(
      new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
      `${fileName}.xlsx`
    );
  };

  /* ───────────── CSV (.csv) ───────────── */
  // 📝 PATANDAAN (BAGO): CSV export. May BOM (\uFEFF) para tama ang pagbasa ng Excel sa ₱ at
  // sa mga Tagalog na character, at naka-escape ang comma, quotes, at bagong linya sa loob ng data.
  const handleExportCsv = () => {
    setOpen(false);
    const { headers, rows, fileName } = buildExport();

    if (rows.length === 0) {
      alert("Walang data na pwedeng i-export.");
      return;
    }

    const escapeCell = (value: Cell) => {
      const text = String(value ?? "");
      return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    const csv = [headers, ...rows].map((r) => r.map(escapeCell).join(",")).join("\r\n");

    downloadBlob(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }), `${fileName}.csv`);
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Trigger — sumusunod sa itsura ng ibang buttons sa dashboard: puti, may border, berdeng icon */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={rowCount === 0}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-white"
      >
        <SheetIcon className="h-4 w-4 text-emerald-600" />
        Export
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path fillRule="evenodd" d="M5.22 7.22a.75.75 0 0 1 1.06 0L10 10.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
        >
          <p className="px-3 pb-2 pt-1.5 text-xs text-gray-500">
            <span className="font-semibold text-gray-700">{rowCount}</span> rows mula sa {TAB_LABEL[activeTab]}
          </p>

          <button
            role="menuitem"
            type="button"
            onClick={handleExportExcel}
            className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <SheetIcon className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-medium text-gray-900">Excel (.xlsx)</span>
              <span className="block text-xs text-gray-500">May kulay, filters, at naka-format na</span>
            </span>
          </button>

          <button
            role="menuitem"
            type="button"
            onClick={handleExportCsv}
            className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
              <DocIcon className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-medium text-gray-900">CSV (.csv)</span>
              <span className="block text-xs text-gray-500">Plain data para sa import o ibang system</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

function SheetIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="4" y="3" width="16" height="18" rx="2.5" />
      <path d="M8 8h2M14 8h2M8 12h2M14 12h2M8 16h2M14 16h2" />
    </svg>
  );
}

function DocIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  );
}