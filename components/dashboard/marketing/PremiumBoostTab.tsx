 // components/dashboard/marketing/PremiumBoostTab.tsx
"use client";

import { useId, useMemo, useState } from "react";
import { Rocket, Crown, Flame, Megaphone, Check } from "lucide-react";
import {
  Panel,
  PanelHeader,
  StatGrid,
  Field,
  Notice,
  StatusPill,
  EmptyState,
  ListSkeleton,
  inputClass,
  btnPrimary,
  useList,
  sendJson,
  fmtDateTime,
} from "./shared";

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  startDate?: string;
  endDate?: string;
  isPremiumBoosted: boolean;
  boostedSlotType: string | null;
}

const SLOTS = [
  {
    value: "HERO_CAROUSEL",
    label: "Hero Carousel",
    description: "Top of the Marketplace. Highest visibility, first thing shoppers see.",
    tag: "Top placement",
    icon: Crown,
  },
  {
    value: "HOT_DEALS_GRID",
    label: "Hot Deals Grid",
    description: "Trending deals section in the middle of the screen.",
    tag: "High traffic",
    icon: Flame,
  },
] as const;

const slotLabel = (v: string | null) => SLOTS.find((s) => s.value === v)?.label ?? v ?? "N/A";

const TYPE_LABELS: Record<string, string> = {
  FLASH_SALE: "Flash Sale",
  THREE_DAY_SALE: "3-Day Sale",
  BUY_1_TAKE_1: "Buy 1 Take 1",
  BUNDLE: "Bundle",
};

export default function PremiumBoostTab({ tenantSlug }: { tenantSlug: string }) {
  const url = `/api/stores/${tenantSlug}/marketing/campaigns`;
  const { data: campaigns, setData, loading, error: loadError, reload } = useList<Campaign>(url);

  const uid = useId();
  const [selectedId, setSelectedId] = useState("");
  const [slotType, setSlotType] = useState<string>(SLOTS[0].value);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  // Ang mga tapos na campaign ay hindi na pwedeng i-boost
  const eligible = useMemo(
    () => campaigns.filter((c) => !c.isPremiumBoosted && !["ENDED", "EXPIRED"].includes((c.status || "").toUpperCase())),
    [campaigns]
  );
  const boosted = useMemo(() => campaigns.filter((c) => c.isPremiumBoosted), [campaigns]);
  const liveCount = boosted.filter((c) => (c.status || "").toUpperCase() === "ACTIVE").length;

  const selected = eligible.find((c) => c.id === selectedId);
  const slot = SLOTS.find((s) => s.value === slotType)!;

  const handleBoost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    setSaving(true);
    setNotice(null);
    try {
      // Paalala: dito isasabit ang payment gateway (Xendit / Maya / Stripe) sa susunod.
      await sendJson(url, "PATCH", {
        campaignId: selected.id,
        isPremiumBoosted: true,
        boostedSlotType: slotType,
      });
      setData(campaigns.map((c) => (c.id === selected.id ? { ...c, isPremiumBoosted: true, boostedSlotType: slotType } : c)));
      setNotice({ kind: "success", text: `"${selected.name}" is now boosted in the ${slot.label}.` });
      setSelectedId("");
    } catch (err: any) {
      setNotice({ kind: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveBoost = async (c: Campaign) => {
    setNotice(null);
    try {
      await sendJson(url, "PATCH", { campaignId: c.id, isPremiumBoosted: false });
      setData((list) => list.map((x) => (x.id === c.id ? { ...x, isPremiumBoosted: false, boostedSlotType: null } : x)));
      setNotice({ kind: "success", text: `Boost removed from "${c.name}".` });
    } catch (err: any) {
      setNotice({ kind: "error", text: err.message });
    }
  };

  return (
    <Panel>
      <PanelHeader
        icon={<Rocket size={20} />}
        title="Premium Ad Boost"
        description="Feature your Flash Sale or Bundle on the main Marketplace page to reach more shoppers."
      />

      <StatGrid
        stats={[
          { label: "Boosted campaigns", value: boosted.length },
          { label: "Live on Marketplace", value: liveCount },
          { label: "Available to boost", value: eligible.length },
          { label: "Ad slots", value: SLOTS.length },
        ]}
      />

      {notice && (
        <div className="px-5 pt-5 sm:px-6">
          <Notice kind={notice.kind} onClose={() => setNotice(null)}>
            {notice.text}
          </Notice>
        </div>
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
      ) : (
        <>
          {/* BOOST SETUP */}
          <form onSubmit={handleBoost} className="grid gap-6 border-b border-slate-200 bg-slate-50/70 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              <Field
                id={`${uid}-campaign`}
                label="1. Choose a campaign"
                hint={eligible.length === 0 ? undefined : "Only active and upcoming campaigns that aren't boosted yet."}
              >
                <select
                  id={`${uid}-campaign`}
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  disabled={eligible.length === 0}
                  className={inputClass}
                  required
                >
                  <option value="">
                    {eligible.length === 0 ? "No campaigns available" : "Select a campaign to promote"}
                  </option>
                  {eligible.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({TYPE_LABELS[c.type] ?? c.type})
                    </option>
                  ))}
                </select>
                {eligible.length === 0 && (
                  <p className="mt-1.5 text-xs text-slate-500">
                    Create a Flash Sale or Bundle first, then come back to boost it.
                  </p>
                )}
              </Field>

              <div className="space-y-1.5">
                <span className="block text-sm font-medium text-slate-700" id={`${uid}-slot`}>
                  2. Choose an ad spot
                </span>
                <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-labelledby={`${uid}-slot`}>
                  {SLOTS.map((s) => {
                    const active = slotType === s.value;
                    const Icon = s.icon;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setSlotType(s.value)}
                        className={`relative flex flex-col gap-2 rounded-xl border bg-white p-4 text-left transition ${
                          active
                            ? "border-[var(--brand,#0f172a)] ring-2 ring-[var(--brand,#0f172a)]/15"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                            <Icon size={18} />
                          </span>
                          {active && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand,#0f172a)] text-white">
                              <Check size={12} strokeWidth={3} />
                            </span>
                          )}
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-slate-900">{s.label}</span>
                          <span className="mt-0.5 block text-xs text-slate-500">{s.description}</span>
                        </span>
                        <span className="w-fit rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/15">
                          {s.tag}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* REVIEW */}
            <aside className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-5">
              <h4 className="text-sm font-bold text-slate-900">3. Review & boost</h4>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-slate-500">Campaign</dt>
                  <dd className={`font-semibold ${selected ? "text-slate-900" : "text-slate-400"}`}>
                    {selected ? selected.name : "Not selected"}
                  </dd>
                  {selected?.startDate && selected?.endDate && (
                    <dd className="text-xs text-slate-500">
                      {fmtDateTime(selected.startDate)} to {fmtDateTime(selected.endDate)}
                    </dd>
                  )}
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Ad spot</dt>
                  <dd className="font-semibold text-slate-900">{slot.label}</dd>
                </div>
              </dl>
              <button type="submit" disabled={!selected || saving} className={`${btnPrimary} w-full`}>
                <Rocket size={16} />
                {saving ? "Boosting..." : "Boost campaign"}
              </button>
            </aside>
          </form>

          {/* BOOSTED TRACKER */}
          <div>
            <div className="px-5 pb-3 pt-5 sm:px-6">
              <h4 className="text-sm font-bold text-slate-900">Boosted campaigns</h4>
            </div>
            {boosted.length === 0 ? (
              <EmptyState
                icon={<Megaphone size={22} />}
                title="No boosted campaigns"
                description="Boosted campaigns will appear here once they're placed on the Marketplace."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead>
                    <tr className="border-y border-slate-200 bg-slate-50/80 text-xs text-slate-500">
                      <th scope="col" className="px-5 py-3 font-semibold sm:px-6">Campaign</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Ad spot</th>
                      <th scope="col" className="px-5 py-3 font-semibold sm:px-6">Status</th>
                      <th scope="col" className="px-5 py-3 text-right font-semibold sm:px-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {boosted.map((c) => (
                      <tr key={c.id} className="transition-colors hover:bg-slate-50">
                        <td className="px-5 py-4 sm:px-6">
                          <div className="font-semibold text-slate-900">{c.name}</div>
                          <div className="text-xs text-slate-500">{TYPE_LABELS[c.type] ?? c.type}</div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                            <Rocket size={12} /> {slotLabel(c.boostedSlotType)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                          <StatusPill status={c.status} />
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-right sm:px-6">
                          <button
                            type="button"
                            onClick={() => handleRemoveBoost(c)}
                            className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                          >
                            Remove boost
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </Panel>
  );
}