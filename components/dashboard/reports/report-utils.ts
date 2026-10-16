// 📝 PATANDAAN (BAGONG FILE): Shared types + filter helpers.
// Dati, ang Table ay hindi nagfi-filter pero ang Export ay oo — kaya mali ang
// nakikita sa screen vs. nasa Excel. Dito na lang pareho ang source ng filter.

export type ReportTab = "sales" | "inventory" | "complaints";

export const DEFAULT_TENANT = "all";
export const DEFAULT_RANGE = "30";

export interface SalesRow {
  id: string;
  date: string;
  tenant: string;
  customer: string;
  amount: number;
  status: string; // "Paid" | "Failed"
}

export interface InventoryRow {
  sku: string;
  name: string;
  tenant: string;
  stock: number;
  status: string; // "Low Stock" | "In Stock"
}

export interface ComplaintRow {
  id: string;
  date: string;
  tenant: string;
  customer: string;
  issue: string;
  status: string; // "Open" | "Resolved"
}

export const peso = (n: number) => `₱${n.toLocaleString()}`;

// Parehong logic na dati sa export: tenant name includes ang selected value
export function matchesTenant(row: { tenant: string }, selectedTenant: string) {
  return (
    selectedTenant === DEFAULT_TENANT ||
    row.tenant.toLowerCase().includes(selectedTenant)
  );
}

// 📝 PATANDAAN (BAGO): Walang gumagamit sa dateRange dati — dropdown lang.
// Ngayon, "Last N Days" ang binibilang mula ngayong araw.
export function withinDateRange(dateStr: string, days: string | number) {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return true; // huwag itago ang row kung sira ang date
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  const cutoff = new Date(startOfToday);
  cutoff.setDate(cutoff.getDate() - Number(days));
  return d >= cutoff && d < startOfTomorrow;
}

export function filterSales(rows: SalesRow[], tenant: string, range: string) {
  return rows.filter((r) => matchesTenant(r, tenant) && withinDateRange(r.date, range));
}

// 📝 PATANDAAN: Walang "date" ang inventory (snapshot ito ng stock ngayon),
// kaya tenant filter lang ang ina-apply. Kung gusto mo ng stock movement
// history, kailangan ng "updatedAt" na field.
export function filterInventory(rows: InventoryRow[], tenant: string) {
  return rows.filter((r) => matchesTenant(r, tenant));
}

export function filterComplaints(rows: ComplaintRow[], tenant: string, range: string) {
  return rows.filter((r) => matchesTenant(r, tenant) && withinDateRange(r.date, range));
}