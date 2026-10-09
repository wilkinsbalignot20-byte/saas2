 // components/dashboard/marketing/PremiumBoostTab.tsx
"use client";

import { Rocket } from "lucide-react";
import { Panel, PanelHeader, StatGrid, Notice, ListSkeleton } from "./shared";
import BoostForm from "./premium-boost/BoostForm";
import BoostedTable from "./premium-boost/BoostedTable";
import { SLOTS } from "./premium-boost/constants";
import { usePremiumBoost } from "./premium-boost/usePremiumBoost";

export default function PremiumBoostTab({ tenantSlug }: { tenantSlug: string }) {
  const b = usePremiumBoost(tenantSlug);

  return (
    <Panel>
      <PanelHeader
        icon={<Rocket size={20} />}
        title="Premium Ad Boost"
        description="Feature your Flash Sale or Bundle on the main Marketplace page to reach more shoppers."
      />

      <StatGrid
        stats={[
          { label: "Boosted campaigns", value: b.boosted.length },
          { label: "Live on Marketplace", value: b.liveCount },
          { label: "Available to boost", value: b.eligible.length },
          { label: "Ad slots", value: SLOTS.length },
        ]}
      />

      {b.notice && (
        <div className="px-5 pt-5 sm:px-6">
          <Notice kind={b.notice.kind} onClose={() => b.setNotice(null)}>
            {b.notice.text}
          </Notice>
        </div>
      )}

      {b.loading ? (
        <ListSkeleton />
      ) : b.loadError ? (
        <div className="p-5 sm:p-6">
          <Notice kind="error">
            {b.loadError}{" "}
            <button type="button" onClick={b.reload} className="font-semibold underline underline-offset-2">
              Try again
            </button>
          </Notice>
        </div>
      ) : (
        <>
          <BoostForm
            tenantSlug={tenantSlug}
            eligible={b.eligible}
            selected={b.selected}
            selectedId={b.selectedId}
            onSelectCampaign={b.setSelectedId}
            slotType={b.slotType}
            slotLabel={b.slot.label}
            onSelectSlot={b.setSlotType}
            duration={b.duration}
            onSelectDuration={b.setDuration}
            saving={b.saving}
            onSubmit={b.boost}
          />
          <BoostedTable campaigns={b.boosted} onRemove={b.removeBoost} />
        </>
      )}
    </Panel>
  );
}