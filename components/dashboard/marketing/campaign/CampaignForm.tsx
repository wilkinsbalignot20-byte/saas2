// components/dashboard/marketing/campaign/CampaignForm.tsx
"use client";

import { useId, useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";
import CampaignProductSelector, { type SelectedRulePayload } from "../CampaignProductSelector";
import { Field, inputClass, btnPrimary, btnSecondary, toLocalInput, addHoursLocal } from "../shared";
import BundleImageUpload from "./BundleImageUpload";
import TypeSelector from "./TypeSelector";
import { joinCampaignName } from "./utils";
import type { CampaignPayload, CampaignTypeOption } from "./types";

interface Props {
  tenantSlug: string;
  types: CampaignTypeOption[];
  presets: { label: string; hours: number }[];
  namePlaceholder: string;
  submitLabel: string;
  saving: boolean;
  onSubmit: (payload: CampaignPayload) => void;
  onCancel: () => void;
}

/**
 * Hawak ng form na ito ang sarili niyang state.
 * Kapag na-unmount (isinara ng parent), automatic na nare-reset lahat.
 */
export default function CampaignForm({
  tenantSlug,
  types,
  presets,
  namePlaceholder,
  submitLabel,
  saving,
  onSubmit,
  onCancel,
}: Props) {
  const uid = useId();

  const [name, setName] = useState("");
  const [type, setType] = useState(types[0].value);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [endTouched, setEndTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bundleImage, setBundleImage] = useState("");
  const [rules, setRules] = useState<SelectedRulePayload[]>([]);

  const typeMap = useMemo(() => Object.fromEntries(types.map((t) => [t.value, t])), [types]);

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
  const showErr = (msg: string) => (submitted ? msg : "");

  const handleTypeChange = (value: string) => {
    setType(value);
    const h = typeMap[value]?.defaultHours;
    if (start && h && !endTouched) setEnd(addHoursLocal(start, h));
  };

  const handleStartChange = (value: string) => {
    setStart(value);
    const h = typeMap[type]?.defaultHours;
    if (value && h && !endTouched) setEnd(addHoursLocal(value, h));
  };

  const applyPreset = (hours: number) => {
    const base = start || toLocalInput(new Date());
    if (!start) setStart(base);
    setEnd(addHoursLocal(base, hours));
    setEndTouched(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (hasErrors) return;

    const finalName = type === "BUNDLE" ? joinCampaignName(name.trim(), bundleImage) : name.trim();

    onSubmit({
      name: finalName,
      type,
      startDate: new Date(start).toISOString(),
      endDate: new Date(end).toISOString(),
      rules,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 border-b border-slate-200 bg-slate-50/70 p-5 sm:p-6">
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

        {type === "BUNDLE" && <BundleImageUpload value={bundleImage} onChange={setBundleImage} />}

        <TypeSelector uid={uid} types={types} value={type} onChange={handleTypeChange} />
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

      <div className="pt-2">
        <CampaignProductSelector tenantSlug={tenantSlug} campaignType={type} onChange={setRules} />
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className={btnSecondary}>
          Cancel
        </button>
        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving ? "Publishing..." : submitLabel}
        </button>
      </div>
    </form>
  );
}