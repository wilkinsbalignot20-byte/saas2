 // components/dashboard/marketing/premium-boost/BoostForm.tsx
"use client";

import { useId } from "react"; 
import CampaignPicker from "./CampaignPicker";
import SlotPicker from "./SlotPicker";
import BoostReview from "./BoostReview";
import type { BoostCampaign } from "./types";

// 💡 MAHALAGA: I-import ang Field at inputClass para magkapareho ang UI style sa ibang inputs mo
import { Field, inputClass } from "../shared";

interface Props {
  tenantSlug: string;
  eligible: BoostCampaign[];
  selected?: BoostCampaign;
  selectedId: string;
  onSelectCampaign: (id: string) => void;
  slotType: string;
  slotLabel: string;
  onSelectSlot: (value: string) => void;
  duration: number; 
  onSelectDuration: (days: number) => void;
  saving: boolean;
  onSubmit: () => void;
}

export default function BoostForm({
  tenantSlug,
  eligible,
  selected,
  selectedId,
  onSelectCampaign,
  slotType,
  slotLabel,
  onSelectSlot,
  duration,
  onSelectDuration,
  saving,
  onSubmit,
}: Props) {
  const uid = useId();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="grid gap-6 border-b border-slate-200 bg-slate-50/70 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_320px]"
    >
      <div className="space-y-5">
        <CampaignPicker 
          uid={uid} 
          campaigns={eligible} 
          value={selectedId} 
          onChange={onSelectCampaign}
          tenantSlug={tenantSlug}
        />
        
        <SlotPicker uid={uid} value={slotType} onChange={onSelectSlot} />
        
        {/* 💡 BAGONG MATALINONG FEATURE: Duration Picker Input Control */}
        <Field
          id={`${uid}-duration`}
          label="2. Choose duration"
          hint="Piliin kung gaano katagal mananatili ang iyong ad campaign sa napiling pwesto."
        >
          <select
            id={`${uid}-duration`}
            value={duration}
            onChange={(e) => onSelectDuration(Number(e.target.value))}
            className={inputClass}
            required
          >
            {/* Mga karaniwang opsyon na pinipili ng mga madidiskarteng negosyante */}
            <option value={3}>3 Days (Short test boost)</option>
            <option value={7}>7 Days (Standard weekly run)</option>
            <option value={14}>14 Days (Extended brand push)</option>
            <option value={30}>30 Days (Maximum campaign value)</option>
          </select>
        </Field>
      </div>

      <BoostReview 
        campaign={selected} 
        slotLabel={slotLabel} 
        duration={duration} 
        saving={saving} 
      />
    </form>
  );
}
