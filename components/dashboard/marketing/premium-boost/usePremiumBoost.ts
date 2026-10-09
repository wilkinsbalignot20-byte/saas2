// components/dashboard/marketing/premium-boost/usePremiumBoost.ts
"use client";

import { useMemo, useState } from "react";
import { useList, sendJson } from "../shared";
import { SLOTS } from "./constants";
import type { BoostCampaign, NoticeState } from "./types";

/** Lahat ng data at actions ng Premium Boost tab */
export function usePremiumBoost(tenantSlug: string) {
  const url = `/api/stores/${tenantSlug}/marketing/campaigns`;
  const { data: campaigns, setData, loading, error: loadError, reload } = useList<BoostCampaign>(url);

  const [selectedId, setSelectedId] = useState("");
  const [slotType, setSlotType] = useState<string>(SLOTS[0].value);
  const [duration, setDuration] = useState<number>(7);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<NoticeState>(null);

  // Ang mga tapos na campaign ay hindi na pwedeng i-boost
  const eligible = useMemo(
    () => campaigns.filter((c) => !c.isPremiumBoosted && !["ENDED", "EXPIRED"].includes((c.status || "").toUpperCase())),
    [campaigns]
  );
  const boosted = useMemo(() => campaigns.filter((c) => c.isPremiumBoosted), [campaigns]);
  const liveCount = boosted.filter((c) => (c.status || "").toUpperCase() === "ACTIVE").length;

  const selected = eligible.find((c) => c.id === selectedId);
  const slot = SLOTS.find((s) => s.value === slotType)!;

  const boost = async () => {
    if (!selected) return;

    setSaving(true);
    setNotice(null);
    try {
      // Paalala: dito isasabit ang payment gateway (Xendit / Maya / Stripe) sa susunod.
      await sendJson(url, "PATCH", {
        campaignId: selected.id,
        isPremiumBoosted: true,
        boostedSlotType: slotType,
        boostedDurationDays: duration,
      });
      setData((list) =>
        list.map((c) => (c.id === selected.id ? { ...c, isPremiumBoosted: true, boostedSlotType: slotType } : c))
      );
      setNotice({ kind: "success", text: `"${selected.name}" is now boosted in the ${slot.label}.` });
      setSelectedId("");
    } catch (err: any) {
      setNotice({ kind: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const removeBoost = async (c: BoostCampaign) => {
    setNotice(null);
    try {
      await sendJson(url, "PATCH", { campaignId: c.id, isPremiumBoosted: false });
      setData((list) => list.map((x) => (x.id === c.id ? { ...x, isPremiumBoosted: false, boostedSlotType: null } : x)));
      setNotice({ kind: "success", text: `Boost removed from "${c.name}".` });
    } catch (err: any) {
      setNotice({ kind: "error", text: err.message });
    }
  };

  return {
    // list state
    setDuration,
    duration,
    loading,
    loadError,
    reload,
    eligible,
    boosted,
    liveCount,
    // form state
    selected,
    selectedId,
    setSelectedId,
    slotType,
    setSlotType,
    slot,
    saving,
    // feedback
    notice,
    setNotice,
    // actions
    boost,
    removeBoost,
  };
}