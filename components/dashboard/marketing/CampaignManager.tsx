 // components/dashboard/marketing/CampaignManager.tsx
"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { Plus, Search, X, Rocket, CalendarClock, type LucideIcon } from "lucide-react";
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
  fmtDateTime,
  durationLabel,
  endsIn,
  startsIn,
  DeleteButton,
  toLocalInput,
  addHoursLocal,
} from "./shared";

export interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  isPremiumBoosted?: boolean;
}

export interface CampaignTypeOption {
  value: string;
  label: string;
  description: string;
  icon: LucideIcon;
  pill: string; // tailwind classes para sa type badge
  defaultHours?: number; // auto-fill ng end date
}

interface CampaignManagerProps {
  tenantSlug: string;
  icon: ReactNode;
  title: string;
  description: string;
  createLabel: string;
  submitLabel: string;
  namePlaceholder: string;
  emptyTitle: string;
  emptyDescription: string;
  types: CampaignTypeOption[];
  presets: { label: string; hours: number }[];
  /** optional query string para sa API, hal. "?type=bundles" */
  listQuery?: string;
}

const bucket = (status: string) => {
  const u = (status || "").toUpperCase();
  return u === "ACTIVE" || u === "UPCOMING" ? u : "ENDED";
};

export default function CampaignManager({
  tenantSlug,
  icon,
  title,
  description,
  createLabel,
  submitLabel,
  namePlaceholder,
  emptyTitle,
  emptyDescription,
  types,
  presets,
  listQuery = "",
}: CampaignManagerProps) {
  const baseUrl = `/api/stores/${tenantSlug}/marketing/campaigns`;
  const { data, setData, loading, error: loadError, reload } = useList<Campaign>(`${baseUrl}${listQuery}`);

  const uid = useId();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  // Form
  const [name, setName] = useState("");
  const [type, setType] = useState(types[0].value);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [endTouched, setEndTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // List controls
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Ipakita lang ang mga campaign na kabilang sa tab na ito
  const campaigns = useMemo(() => data.filter((c) => types.some((t) => t.value === c.type)), [data, types]);
  const typeMap = useMemo(() => Object.fromEntries(types.map((t) => [t.value, t])), [types]);

  const counts = useMemo(() => {
    const c = { all: campaigns.length, ACTIVE: 0, UPCOMING: 0, ENDED: 0, boosted: 0 };
    for (const x of campaigns) {
      c[bucket(x.status) as "ACTIVE" | "UPCOMING" | "ENDED"] += 1;
      if (x.isPremiumBoosted) c.boosted += 1;
    }
    return c;
  }, [campaigns]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return campaigns.filter(
      (c) => (filter === "all" || bucket(c.status) === filter) && (!term || c.name.toLowerCase().includes(term))
    );
  }, [campaigns, search, filter]);

  const errors = {
    name: name.trim().length < 3 ? "Use at least 3 characters." : "",
    start: !start ? "Choose a start date and time." : "",
    end: !end
      ? "Choose an end date and time."
      : start && new Date(end) <= new Date(start)
      ? "End must be after the start."
      : "",
  };
  const hasErrors = Boolean(errors.name || errors.start || errors.end);

  const defaultHoursFor = (value: string) => typeMap[value]?.defaultHours;

  const handleTypeChange = (value: string) => {
    setType(value);
    const h = defaultHoursFor(value);
    if (start && h && !endTouched) setEnd(addHoursLocal(start, h));
  };

  const handleStartChange = (value: string) => {
    setStart(value);
    const h = defaultHoursFor(type);
    if (value && h && !endTouched) setEnd(addHoursLocal(value, h));
  };

  const applyPreset = (hours: number) => {
    const base = start || toLocalInput(new Date());
    if (!start) setStart(base);
    setEnd(addHoursLocal(base, hours));
    setEndTouched(true);
  };

  const resetForm = () => {
    setName("");
    setType(types[0].value);
    setStart("");
    setEnd("");
    setEndTouched(false);
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
      const created = await sendJson<Campaign>(baseUrl, "POST", {
        name: name.trim(),
        type,
        startDate: new Date(start).toISOString(),
        endDate: new Date(end).toISOString(),
      });
      setData([created, ...data]);
      setNotice({ kind: "success", text: `"${created.name}" has been published.` });
      closeForm();
    } catch (err: any) {
      setNotice({ kind: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const showErr = (msg: string) => (submitted ? msg : "");

  const removeCampaign = async (c: Campaign) => {
    setBusyId(c.id);
    setNotice(null);
    try {
      await sendJson(`${baseUrl}?id=${encodeURIComponent(c.id)}`, "DELETE");
      setData((list) => list.filter((x) => x.id !== c.id));
      setNotice({ kind: "success", text: `"${c.name}" was deleted.` });
    } catch (err: any) {
      setNotice({ kind: "error", text: err.message });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Panel>
      <PanelHeader
        icon={icon}
        title={title}
        description={description}
        action={
          <button
            type="button"
            onClick={() => (showForm ? closeForm() : setShowForm(true))}
            className={showForm ? btnSecondary : btnPrimary}
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Cancel" : createLabel}
          </button>
        }
      />

      <StatGrid
        stats={[
          { label: "Total", value: counts.all },
          { label: "Active now", value: counts.ACTIVE },
          { label: "Upcoming", value: counts.UPCOMING },
          { label: "Boosted", value: counts.boosted },
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
            <Field id={`${uid}-name`} label="Campaign name" error={showErr(errors.name)}>
              <input
                id={`${uid}-name`}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={namePlaceholder}
                className={inputClass}
                autoFocus
              />
            </Field>

            <div className="space-y-1.5">
              <span className="block text-sm font-medium text-slate-700" id={`${uid}-type`}>
                Promo type
              </span>
              <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-labelledby={`${uid}-type`}>
                {types.map((t) => {
                  const active = type === t.value;
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => handleTypeChange(t.value)}
                      className={`flex items-start gap-3 rounded-lg border bg-white p-3 text-left transition ${
                        active
                          ? "border-[var(--brand,#0f172a)] ring-2 ring-[var(--brand,#0f172a)]/15"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <Icon size={18} className="mt-0.5 shrink-0 text-slate-600" />
                      <span>
                        <span className="block text-sm font-semibold text-slate-900">{t.label}</span>
                        <span className="block text-xs text-slate-500">{t.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id={`${uid}-start`} label="Starts" error={showErr(errors.start)}>
              <input
                id={`${uid}-start`}
                type="datetime-local"
                value={start}
                onChange={(e) => handleStartChange(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field id={`${uid}-end`} label="Ends" error={showErr(errors.end)}>
              <input
                id={`${uid}-end`}
                type="datetime-local"
                value={end}
                min={start || undefined}
                onChange={(e) => {
                  setEnd(e.target.value);
                  setEndTouched(true);
                }}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <CalendarClock size={14} /> Quick duration
            </span>
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p.hours)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={closeForm} className={btnSecondary}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={btnPrimary}>
              {saving ? "Publishing..." : submitLabel}
            </button>
          </div>
        </form>
      )}

      {/* TOOLBAR */}
      {!loading && campaigns.length > 0 && (
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <FilterTabs
            value={filter}
            onChange={setFilter}
            options={[
              { key: "all", label: "All", count: counts.all },
              { key: "ACTIVE", label: "Active", count: counts.ACTIVE },
              { key: "UPCOMING", label: "Upcoming", count: counts.UPCOMING },
              { key: "ENDED", label: "Ended", count: counts.ENDED },
            ]}
          />
          <div className="relative w-full sm:max-w-xs">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns"
              aria-label="Search campaigns"
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
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={icon}
          title={emptyTitle}
          description={emptyDescription}
          action={
            !showForm && (
              <button type="button" onClick={() => setShowForm(true)} className={btnPrimary}>
                <Plus size={16} /> {createLabel}
              </button>
            )
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState icon={<Search size={20} />} title="No matches" description="Try a different search or status filter." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs text-slate-500">
                <th scope="col" className="px-5 py-3 font-semibold sm:px-6">Campaign</th>
                <th scope="col" className="px-4 py-3 font-semibold">Type</th>
                <th scope="col" className="px-4 py-3 font-semibold">Schedule</th>
                <th scope="col" className="px-5 py-3 font-semibold sm:px-6">Status</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold sm:px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((c) => {
                const t = typeMap[c.type];
                const b = bucket(c.status);
                return (
                  <tr key={c.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-4 sm:px-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900">{c.name}</span>
                        {c.isPremiumBoosted && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/15">
                            <Rocket size={11} /> Boosted
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <span className={`rounded-md px-2 py-1 text-xs font-semibold ${t?.pill ?? "bg-slate-100 text-slate-700"}`}>
                        {t?.label ?? c.type}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="text-slate-700">
                        {fmtDateTime(c.startDate)} <span className="text-slate-400">to</span> {fmtDateTime(c.endDate)}
                      </div>
                      <div className="text-xs text-slate-500">{durationLabel(c.startDate, c.endDate)}</div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                      <StatusPill status={c.status} />
                      {b === "ACTIVE" && <div className="mt-1 text-xs text-slate-500">{endsIn(c.endDate)}</div>}
                      {b === "UPCOMING" && <div className="mt-1 text-xs text-slate-500">{startsIn(c.startDate)}</div>}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right sm:px-6">
                      <DeleteButton busy={busyId === c.id} label={`Delete ${c.name}`} onConfirm={() => removeCampaign(c)} />
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