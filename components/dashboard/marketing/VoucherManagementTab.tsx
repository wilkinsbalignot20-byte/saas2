 // components/dashboard/marketing/VoucherManagementTab.tsx
"use client";

import { useMemo, useState } from "react";
import { Ticket, Plus, X, Search } from "lucide-react";
import {
  Panel,
  PanelHeader,
  StatGrid,
  Notice,
  EmptyState,
  ListSkeleton,
  btnPrimary,
  btnSecondary,
  useList,
  sendJson,
} from "./shared";
import VoucherForm from "./voucher/VoucherForm";
import VoucherToolbar from "./voucher/VoucherToolbar";
import VoucherTable from "./voucher/VoucherTable";
import { voucherStatus } from "./voucher/utils";
import type { NoticeState, Voucher, VoucherPayload } from "./voucher/types";

export default function VoucherManagementTab({ tenantSlug }: { tenantSlug: string }) {
  const url = `/api/stores/${tenantSlug}/marketing/vouchers`;
  const { data: vouchers, setData, loading, error: loadError, reload } = useList<Voucher>(url);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<NoticeState>(null);

  // List controls
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
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

  const existingCodes = useMemo(() => vouchers.map((v) => v.code), [vouchers]);

  const handleCreate = async (payload: VoucherPayload) => {
    setSaving(true);
    setNotice(null);
    try {
      const created = await sendJson<Voucher>(url, "POST", payload);
      setData([created, ...vouchers]);
      setNotice({ kind: "success", text: `Voucher ${created.code} is now live.` });
      setShowForm(false);
    } catch (err: any) {
      setNotice({ kind: "error", text: err.message });
    } finally {
      setSaving(false);
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
            onClick={() => setShowForm((v) => !v)}
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

      {showForm && (
        <VoucherForm
          existingCodes={existingCodes}
          saving={saving}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {!loading && vouchers.length > 0 && (
        <VoucherToolbar
          filter={filter}
          onFilterChange={setFilter}
          search={search}
          onSearchChange={setSearch}
          counts={counts}
        />
      )}

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
        <VoucherTable vouchers={visible} busyId={busyId} onToggle={toggleActive} onDelete={removeVoucher} />
      )}
    </Panel>
  );
}