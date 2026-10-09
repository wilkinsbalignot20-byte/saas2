 // components/dashboard/marketing/CampaignManager.tsx
"use client";

import { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
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
import CampaignForm from "./campaign/CampaignForm";
import CampaignToolbar from "./campaign/CampaignToolbar";
import CampaignTable from "./campaign/CampaignTable";
import { bucket, splitCampaignName } from "./campaign/utils";
import type { Campaign, CampaignManagerProps, CampaignPayload, NoticeState } from "./campaign/types";

// Re-export para hindi masira ang mga file na nag-i-import mula dito
export type { Campaign, CampaignTypeOption } from "./campaign/types";

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

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<NoticeState>(null);

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

  const handleCreate = async (payload: CampaignPayload) => {
    setSaving(true);
    setNotice(null);
    try {
      const created = await sendJson<Campaign>(baseUrl, "POST", payload);
      const { name } = splitCampaignName(created.name);
      setData([created, ...data]);
      setNotice({ kind: "success", text: `"${name}" has been published.` });
      setShowForm(false);
    } catch (err: any) {
      setNotice({ kind: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const removeCampaign = async (c: Campaign) => {
    setBusyId(c.id);
    setNotice(null);
    try {
      await sendJson(`${baseUrl}?id=${encodeURIComponent(c.id)}`, "DELETE");
      setData((list) => list.filter((x) => x.id !== c.id));
      setNotice({ kind: "success", text: `"${splitCampaignName(c.name).name}" was deleted.` });
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
            onClick={() => setShowForm((v) => !v)}
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

      {showForm && (
        <CampaignForm
          tenantSlug={tenantSlug}
          types={types}
          presets={presets}
          namePlaceholder={namePlaceholder}
          submitLabel={submitLabel}
          saving={saving}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {!loading && campaigns.length > 0 && (
        <CampaignToolbar
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
        <CampaignTable campaigns={visible} typeMap={typeMap} busyId={busyId} onDelete={removeCampaign} />
      )}
    </Panel>
  );
}