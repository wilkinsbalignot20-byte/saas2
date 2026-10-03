 // components/dashboard/marketing/VoucherManagementTab.tsx
"use client";

import { useId, useMemo, useState } from "react";
import { Ticket, Plus, X, Search, Copy, Check, Shuffle } from "lucide-react";
import {
  Panel,
  PanelHeader,
  StatGrid,
  Field,
  Notice,
  StatusPill,
  FilterTabs,
  EmptyState,
  ListSkeleton,
  inputClass,
  btnPrimary,
  btnSecondary,
  useList,
  sendJson,
  fmtPeso,
  fmtDate,
  Toggle,
  DeleteButton,
} from "./shared";

interface Voucher {
  id: string;
  code: string;
  discountType: "FIXED" | "PERCENTAGE";
  discountValue: number | string;
  minSpend: number | string;
  maxClaims: number | null;
  claimedCount: number;
  expiresAt: string | null;
  isActive: boolean;
}

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const generateCode = () =>
  "SAVE" + Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");

const discountLabel = (v: Voucher) =>
  v.discountType === "FIXED" ? `${fmtPeso(Number(v.discountValue))} off` : `${Number(v.discountValue)}% off`;

/** ACTIVE | INACTIVE | EXPIRED | USED_UP */
const voucherStatus = (v: Voucher) => {
  if (!v.isActive) return "INACTIVE";
  if (v.expiresAt && new Date(v.expiresAt) <= new Date()) return "EXPIRED";
  if (v.maxClaims != null && v.claimedCount >= v.maxClaims) return "USED_UP";
  return "ACTIVE";
};

export default function VoucherManagementTab({ tenantSlug }: { tenantSlug: string }) {
  const url = `/api/stores/${tenantSlug}/marketing/vouchers`;
  const { data: vouchers, setData, loading, error: loadError, reload } = useList<Voucher>(url);

  const uid = useId();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  // Form
  const [code, setCode] = useState("");
  const [type, setType] = useState<"FIXED" | "PERCENTAGE">("FIXED");
  const [value, setValue] = useState("");
  const [minSpend, setMinSpend] = useState("0");
  const [maxClaims, setMaxClaims] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  // List controls
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c = { all: vouchers.length, active: 0, inactive: 0, ended: 0 };
    for (const v of vouchers) {
      const s = voucherStatus(v);
      if (s === "ACTIVE") c.active += 1;
      else if (s === "INACTIVE") c.inactive += 1;
      else c.ended += 1;
    }
    return c;
  }, [vouchers]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return vouchers.filter((v) => {
      const s = voucherStatus(v);
      const matchesFilter =
        filter === "all" || (filter === "ended" ? s === "EXPIRED" || s === "USED_UP" : s === filter.toUpperCase());
      return matchesFilter && (!term || v.code.toLowerCase().includes(term));
    });
  }, [vouchers, search, filter]);

  // Validation
  const cleanCode = code.toUpperCase().trim();
  const numValue = parseFloat(value);
  const numMin = parseFloat(minSpend || "0");
  const numLimit = maxClaims.trim() === "" ? null : Number(maxClaims);
  const expiresDate = expiresAt ? new Date(expiresAt) : null;

  const errors = {
    code: !cleanCode
      ? "Enter a promo code."
      : !/^[A-Z0-9_-]{3,20}$/.test(cleanCode)
      ? "Use 3 to 20 letters, numbers, - or _."
      : vouchers.some((v) => v.code.toUpperCase() === cleanCode)
      ? "This code already exists."
      : "",
    value:
      !(numValue > 0)
        ? "Enter a value greater than 0."
        : type === "PERCENTAGE" && numValue > 100
        ? "Percentage can't be more than 100."
        : "",
    minSpend: numMin < 0 || Number.isNaN(numMin) ? "Minimum spend can't be negative." : "",
    maxClaims:
      numLimit !== null && (!Number.isInteger(numLimit) || numLimit < 1) ? "Enter a whole number of 1 or more." : "",
    expiresAt: expiresDate && expiresDate <= new Date() ? "Expiry must be in the future." : "",
  };
  const hasErrors = Boolean(errors.code || errors.value || errors.minSpend || errors.maxClaims || errors.expiresAt);
  const showErr = (m: string) => (submitted ? m : "");

  // Live preview sentence
  const previewDiscount =
    numValue > 0 ? (type === "FIXED" ? fmtPeso(numValue) : `${numValue}%`) : type === "FIXED" ? "₱0" : "0%";
  const previewMin = numMin > 0 ? `on orders of ${fmtPeso(numMin)} or more` : "on any order";
  const fixedTooBig = type === "FIXED" && numMin > 0 && numValue >= numMin;

  const resetForm = () => {
    setCode("");
    setType("FIXED");
    setValue("");
    setMinSpend("0");
    setMaxClaims("");
    setExpiresAt("");
    setSubmitted(false);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (hasErrors) return;

    setSaving(true);
    setNotice(null);
    try {
      const created = await sendJson<Voucher>(url, "POST", {
        code: cleanCode,
        discountType: type,
        discountValue: numValue,
        minSpend: numMin || 0,
        maxClaims: numLimit,
        expiresAt: expiresDate ? expiresDate.toISOString() : null,
      });
      setData([created, ...vouchers]);
      setNotice({ kind: "success", text: `Voucher ${created.code} is now live.` });
      closeForm();
    } catch (err: any) {
      setNotice({ kind: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const copyCode = async (v: Voucher) => {
    try {
      await navigator.clipboard.writeText(v.code);
      setCopiedId(v.id);
      setTimeout(() => setCopiedId((id) => (id === v.id ? null : id)), 1500);
    } catch {
      /* clipboard blocked, ignore */
    }
  };

  const toggleActive = async (v: Voucher) => {
    setBusyId(v.id);
    setNotice(null);
    try {
      const updated = await sendJson<Voucher>(url, "PATCH", { voucherId: v.id, isActive: !v.isActive });
      setData((list) => list.map((x) => (x.id === v.id ? { ...x, ...updated } : x)));
    } catch (err: any) {
      setNotice({ kind: "error", text: err.message });
    } finally {
      setBusyId(null);
    }
  };

  const removeVoucher = async (v: Voucher) => {
    setBusyId(v.id);
    setNotice(null);
    try {
      await sendJson(`${url}?id=${encodeURIComponent(v.id)}`, "DELETE");
      setData((list) => list.filter((x) => x.id !== v.id));
      setNotice({ kind: "success", text: `Voucher ${v.code} was deleted.` });
    } catch (err: any) {
      setNotice({ kind: "error", text: err.message });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Panel>
      <PanelHeader
        icon={<Ticket size={20} />}
        title="Vouchers & Coupons"
        description="Create discount codes your customers can apply at checkout."
        action={
          <button
            type="button"
            onClick={() => (showForm ? closeForm() : setShowForm(true))}
            className={showForm ? btnSecondary : btnPrimary}
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Cancel" : "New voucher"}
          </button>
        }
      />

      <StatGrid
        stats={[
          { label: "Total vouchers", value: counts.all },
          { label: "Active", value: counts.active },
          { label: "Inactive", value: counts.inactive },
          { label: "Expired / claimed out", value: counts.ended },
        ]}
      />

      {notice && (
        <div className="px-5 pt-5 sm:px-6">
          <Notice kind={notice.kind} onClose={() => setNotice(null)}>
            {notice.text}
          </Notice>
        </div>
      )}

      {/* CREATE FORM */}
      {showForm && (
        <form onSubmit={handleSave} noValidate className="space-y-5 border-b border-slate-200 bg-slate-50/70 p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <Field id={`${uid}-code`} label="Promo code" hint="Customers type this at checkout." error={showErr(errors.code)}>
              <div className="flex gap-2">
                <input
                  id={`${uid}-code`}
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. LESS200"
                  maxLength={20}
                  className={`${inputClass} font-mono uppercase`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setCode(generateCode())}
                  className={`${btnSecondary} shrink-0 px-3`}
                  title="Generate a random code"
                  aria-label="Generate a random code"
                >
                  <Shuffle size={16} />
                </button>
              </div>
            </Field>

            <div className="space-y-1.5">
              <span className="block text-sm font-medium text-slate-700" id={`${uid}-type`}>
                Discount type
              </span>
              <div
                className="grid grid-cols-2 gap-1 rounded-lg bg-slate-200/70 p-1"
                role="radiogroup"
                aria-labelledby={`${uid}-type`}
              >
                {(
                  [
                    { v: "FIXED", label: "Fixed amount (₱)" },
                    { v: "PERCENTAGE", label: "Percentage (%)" },
                  ] as const
                ).map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    role="radio"
                    aria-checked={type === o.v}
                    onClick={() => setType(o.v)}
                    className={`h-8 rounded-md text-sm font-medium transition ${
                      type === o.v ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id={`${uid}-value`}
              label={type === "FIXED" ? "Discount amount (₱)" : "Discount percentage (%)"}
              error={showErr(errors.value)}
            >
              <input
                id={`${uid}-value`}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={type === "FIXED" ? "200" : "10"}
                className={inputClass}
              />
            </Field>
            <Field
              id={`${uid}-min`}
              label="Minimum spend (₱)"
              hint="Set 0 for no minimum."
              error={showErr(errors.minSpend)}
            >
              <input
                id={`${uid}-min`}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={minSpend}
                onChange={(e) => setMinSpend(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id={`${uid}-limit`}
              label="Usage limit (optional)"
              hint="Total number of customers who can claim it. Leave blank for unlimited."
              error={showErr(errors.maxClaims)}
            >
              <input
                id={`${uid}-limit`}
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={maxClaims}
                onChange={(e) => setMaxClaims(e.target.value)}
                placeholder="e.g. 50"
                className={inputClass}
              />
            </Field>
            <Field
              id={`${uid}-expires`}
              label="Expires on (optional)"
              hint="Leave blank if the voucher never expires."
              error={showErr(errors.expiresAt)}
            >
              <input
                id={`${uid}-expires`}
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          {/* Live voucher preview */}
          <div className="flex items-stretch overflow-hidden rounded-xl border border-dashed border-slate-300 bg-white">
            <div className="flex items-center justify-center bg-[var(--brand,#0f172a)] px-5 text-white">
              <Ticket size={22} />
            </div>
            <div className="flex-1 px-4 py-3">
              <p className="font-mono text-base font-bold tracking-wide text-slate-900">{cleanCode || "YOURCODE"}</p>
              <p className="text-sm text-slate-600">
                Bawas <span className="font-semibold text-slate-900">{previewDiscount}</span> {previewMin}.
              </p>
              {(numLimit || expiresDate) && (
                <p className="text-xs text-slate-500">
                  {numLimit ? `Limited to the first ${numLimit} customers` : ""}
                  {numLimit && expiresDate ? ", " : ""}
                  {expiresDate && !Number.isNaN(expiresDate.getTime()) ? `valid until ${fmtDate(expiresDate.toISOString())}` : ""}.
                </p>
              )}
              {fixedTooBig && (
                <p className="mt-1 text-xs font-medium text-amber-700">
                  Heads up: the discount is equal to or higher than the minimum spend.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={closeForm} className={btnSecondary}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={btnPrimary}>
              {saving ? "Publishing..." : "Publish voucher"}
            </button>
          </div>
        </form>
      )}

      {/* TOOLBAR */}
      {!loading && vouchers.length > 0 && (
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <FilterTabs
            value={filter}
            onChange={setFilter}
            options={[
              { key: "all", label: "All", count: counts.all },
              { key: "active", label: "Active", count: counts.active },
              { key: "inactive", label: "Inactive", count: counts.inactive },
              { key: "ended", label: "Ended", count: counts.ended },
            ]}
          />
          <div className="relative w-full sm:max-w-xs">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code"
              aria-label="Search vouchers by code"
              className={`${inputClass} pl-9`}
            />
          </div>
        </div>
      )}

      {/* LIST */}
      {loading ? (
        <ListSkeleton />
      ) : loadError ? (
        <div className="p-5 sm:p-6">
          <Notice kind="error">
            {loadError}{" "}
            <button type="button" onClick={reload} className="font-semibold underline underline-offset-2">
              Try again
            </button>
          </Notice>
        </div>
      ) : vouchers.length === 0 ? (
        <EmptyState
          icon={<Ticket size={22} />}
          title="No vouchers yet"
          description="Create your first discount code to reward loyal customers and boost checkout."
          action={
            !showForm && (
              <button type="button" onClick={() => setShowForm(true)} className={btnPrimary}>
                <Plus size={16} /> New voucher
              </button>
            )
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState icon={<Search size={20} />} title="No matches" description="Try a different search or status filter." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs text-slate-500">
                <th scope="col" className="px-5 py-3 font-semibold sm:px-6">Code</th>
                <th scope="col" className="px-4 py-3 font-semibold">Discount</th>
                <th scope="col" className="px-4 py-3 font-semibold">Minimum spend</th>
                <th scope="col" className="px-4 py-3 font-semibold">Claimed</th>
                <th scope="col" className="px-4 py-3 font-semibold">Expires</th>
                <th scope="col" className="px-5 py-3 font-semibold sm:px-6">Status</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold sm:px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((v) => (
                <tr key={v.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-2.5 py-1 font-mono text-sm font-bold tracking-wide text-slate-900">
                        {v.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyCode(v)}
                        aria-label={`Copy code ${v.code}`}
                        className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        {copiedId === v.id ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                      </button>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-emerald-700">{discountLabel(v)}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                    {Number(v.minSpend) > 0 ? fmtPeso(Number(v.minSpend)) : <span className="text-slate-400">No minimum</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span className="tabular-nums text-slate-700">
                      {v.claimedCount}
                      {v.maxClaims != null ? ` / ${v.maxClaims}` : ""}
                    </span>
                    {v.maxClaims != null && (
                      <div className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-slate-100" aria-hidden>
                        <div
                          className="h-full rounded-full bg-[var(--brand,#0f172a)]"
                          style={{ width: `${Math.min(100, (v.claimedCount / v.maxClaims) * 100)}%` }}
                        />
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                    {v.expiresAt ? fmtDate(v.expiresAt) : <span className="text-slate-400">No expiry</span>}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                    <StatusPill status={voucherStatus(v)} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                    <div className="flex items-center justify-end gap-3">
                      <Toggle
                        checked={v.isActive}
                        disabled={busyId === v.id}
                        onChange={() => toggleActive(v)}
                        label={v.isActive ? `Deactivate ${v.code}` : `Activate ${v.code}`}
                      />
                      <DeleteButton busy={busyId === v.id} label={`Delete ${v.code}`} onConfirm={() => removeVoucher(v)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}