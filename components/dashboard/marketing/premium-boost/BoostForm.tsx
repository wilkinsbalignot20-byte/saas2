// components/dashboard/marketing/premium-boost/BoostForm.tsx
"use client";

import { useId } from "react";
import CampaignPicker from "./CampaignPicker";
import SlotPicker from "./SlotPicker";
import BoostReview from "./BoostReview";
import type { BoostCampaign } from "./types";

interface Props {
  eligible: BoostCampaign[];
  selected?: BoostCampaign;
  selectedId: string;
  onSelectCampaign: (id: string) => void;
  slotType: string;
  slotLabel: string;
  onSelectSlot: (value: string) => void;
  saving: boolean;
  onSubmit: () => void;
}

export default function BoostForm({
  eligible,
  selected,
  selectedId,
  onSelectCampaign,
  slotType,
  slotLabel,
  onSelectSlot,
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
        <CampaignPicker uid={uid} campaigns={eligible} value={selectedId} onChange={onSelectCampaign} />
        <SlotPicker uid={uid} value={slotType} onChange={onSelectSlot} />
      </div>

      <BoostReview campaign={selected} slotLabel={slotLabel} saving={saving} />
    </form>
  );
}