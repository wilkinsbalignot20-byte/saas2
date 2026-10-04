// components/dashboard/logistics/RidersTab.tsx
"use client";

import { useId, useState } from "react";
import { Plus, X, Phone, Bike, Pencil, UserPlus } from "lucide-react";
import {
  Panel,
  PanelHeader,
  Field,
  Notice,
  EmptyState,
  ListSkeleton,
  Toggle,
  DeleteButton,
  inputClass,
  btnPrimary,
  btnSecondary,
  sendJson,
} from "@/components/dashboard/marketing/shared";
import { normalizePhone, VEHICLES, type Courier } from "./utils";

interface RidersTabProps {
  slug: string;
  couriers: Courier[];
  loading: boolean;
  error: string | null;
  onChanged: () => Promise<void>;
}

const STATUS_STYLES: Record<string, { label: string; cls: string; dot: string }> = {
  available: { label: "Available", cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/15", dot: "bg-emerald-500" },
  busy: { label: "On delivery", cls: "bg-amber-50 text-amber-700 ring-amber-600/15", dot: "bg-amber-500" },
  inactive: { label: "Off duty", cls: "bg-slate-100 text-slate-600 ring-slate-500/15", dot: "bg-slate-400" },
};

function RiderStatus({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.inactive;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden />
      {s.label}
    </span>
  );
}

export default function RidersTab({ slug, couriers, loading, error, onChanged }: RidersTabProps) {
  const url = `/api/stores/${slug}/couriers`;
  const uid = useId();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Courier | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("Motorcycle");
  const [plateNumber, setPlateNumber] = useState("");

  const showErr = (m: string) => (submitted ? m : "");

  const errors = {
    name: showErr(name.trim().length < 2 ? "Enter the rider's full name." : ""),
    phone: showErr(normalizePhone(phone) ? "" : "Enter a valid PH mobile number (e.g. 09171234567)."),
  };
  const hasErrors = Boolean(name.trim().length < 2 || !normalizePhone(phone));

  const resetForm = () => {
    setName("");
    setPhone("");
    setVehicleType("Motorcycle");
    setPlateNumber("");
    setEditing(null);
    setSubmitted(false);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const startEdit = (c: Courier) => {
    setEditing(c);
    setName(c.name);
    setPhone(c.phone);
    setVehicleType(c.vehicleType);
    setPlateNumber(c.plateNumber ?? "");
    setSubmitted(false);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (hasErrors) return;

    setSaving(true);
    setNotice(null);
    try {
      const payload = { name: name.trim(), phone, vehicleType, plateNumber: plateNumber.trim() || null };
      if (editing) {
        await sendJson(url, "PATCH", { courierId: editing.id, ...payload });
        setNotice({ kind: "success", text: `${payload.name} was updated.` });
      } else {
        await sendJson(url, "POST", payload);
        setNotice({ kind: "success", text: `${payload.name} was added to your riders.` });
      }
      closeForm();
      await onChanged();
    } catch (err: any) {
      setNotice({ kind: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const toggleDuty = async (c: Courier) => {
    setBusyId(c.id);
    setNotice(null);
    try {
      await sendJson(url, "PATCH", { courierId: c.id, status: c.status === "inactive" ? "available" : "inactive" });
      await onChanged();
    } catch (err: any) {
      setNotice({ kind: "error", text: err.message });
    } finally {
      setBusyId(null);
    }
  };

  const removeRider = async (c: Courier) => {
    setBusyId(c.id);
    setNotice(null);
    try {
      await sendJson(`${url}?id=${encodeURIComponent(c.id)}`, "DELETE");
      setNotice({ kind: "success", text: `${c.name} was removed.` });
      await onChanged();
    } catch (err: any) {
      setNotice({ kind: "error", text: err.message });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Panel>
      <PanelHeader
        icon={<Bike size={20} />}
        title="Your riders"
        description="Add the riders you book for deliveries. Turn off duty for riders who aren't working today."
        action={
          <button
            type="button"
            onClick={() => (showForm ? closeForm() : setShowForm(true))}
            className={showForm ? btnSecondary : btnPrimary}
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Cancel" : "Add rider"}
          </button>
        }
      />

      {notice && (
        <div className="px-5 pb-5 sm:px-6">
          <Notice kind={notice.kind} onClose={() => setNotice(null)}>
            {notice.text}
          </Notice>
        </div>
      )}

      {/* ADD / EDIT FORM */}
      {showForm && (
        <form onSubmit={handleSave} noValidate className="space-y-5 border-y border-slate-200 bg-slate-50/70 p-5 sm:p-6">
          <h4 className="text-sm font-bold text-slate-900">{editing ? `Edit ${editing.name}` : "New rider"}</h4>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id={`${uid}-name`} label="Full name" error={showErr(errors.name)}>
              <input
                id={`${uid}-name`}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Juan Dela Cruz"
                className={inputClass}
                autoFocus
              />
            </Field>
            <Field
              id={`${uid}-phone`}
              label="Mobile number"
              hint="Customers and you can call or text this number."
              error={showErr(errors.phone)}
            >
              <input
                id={`${uid}-phone`}
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09171234567"
                className={inputClass}
              />
            </Field>
            <Field id={`${uid}-vehicle`} label="Vehicle">
              <select id={`${uid}-vehicle`} value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className={inputClass}>
                {VEHICLES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            <Field id={`${uid}-plate`} label="Plate number (optional)">
              <input
                id={`${uid}-plate`}
                type="text"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                placeholder="e.g. ABC 1234"
                maxLength={12}
                className={`${inputClass} font-mono uppercase`}
              />
            </Field>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={closeForm} className={btnSecondary}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={btnPrimary}>
              {saving ? "Saving..." : editing ? "Save changes" : "Add rider"}
            </button>
          </div>
        </form>
      )}

      {/* ROSTER */}
      {loading ? (
        <ListSkeleton />
      ) : error ? (
        <div className="p-5 sm:p-6">
          <Notice kind="error">{error}</Notice>
        </div>
      ) : couriers.length === 0 ? (
        <EmptyState
          icon={<UserPlus size={22} />}
          title="No riders yet"
          description="Add the riders you use for deliveries so you can assign orders to them."
          action={
            !showForm && (
              <button type="button" onClick={() => setShowForm(true)} className={btnPrimary}>
                <Plus size={16} /> Add rider
              </button>
            )
          }
        />
      ) : (
        <div className="overflow-x-auto border-t border-slate-200">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs text-slate-500">
                <th scope="col" className="px-5 py-3 font-semibold sm:px-6">Rider</th>
                <th scope="col" className="px-4 py-3 font-semibold">Vehicle</th>
                <th scope="col" className="px-4 py-3 font-semibold">Deliveries</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold sm:px-6">On duty / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {couriers.map((c) => {
                const busy = busyId === c.id;
                return (
                  <tr key={c.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                          {c.name.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-slate-900">{c.name}</div>
                          <a
                            href={`tel:${c.phone}`}
                            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900"
                          >
                            <Phone size={11} /> {c.phone}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="text-slate-700">{c.vehicleType}</div>
                      <div className="font-mono text-xs text-slate-400">{c.plateNumber || "No plate"}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 tabular-nums">
                      <div className="text-slate-700">{c.activeDeliveries ?? 0} on the road</div>
                      <div className="text-xs text-slate-400">{c.deliveredCount ?? 0} delivered in total</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <RiderStatus status={c.status} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                      <div className="flex items-center justify-end gap-3">
                        <Toggle
                          checked={c.status !== "inactive"}
                          disabled={busy || c.status === "busy"}
                          onChange={() => toggleDuty(c)}
                          label={
                            c.status === "busy"
                              ? `${c.name} is on delivery`
                              : c.status === "inactive"
                              ? `Put ${c.name} on duty`
                              : `Set ${c.name} off duty`
                          }
                        />
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          aria-label={`Edit ${c.name}`}
                          title={`Edit ${c.name}`}
                          className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Pencil size={16} />
                        </button>
                        <DeleteButton busy={busy} label={`Remove ${c.name}`} onConfirm={() => removeRider(c)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}