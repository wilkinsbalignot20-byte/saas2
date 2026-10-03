 // components/dashboard/marketing/FlashSaleManagementTab.tsx
"use client";

import { Zap, CalendarRange } from "lucide-react";
import CampaignManager, { type CampaignTypeOption } from "./CampaignManager";

const TYPES: CampaignTypeOption[] = [
  {
    value: "FLASH_SALE",
    label: "Flash Sale",
    description: "Short, urgent sale with a countdown.",
    icon: Zap,
    pill: "bg-amber-50 text-amber-700",
    defaultHours: 6,
  },
  {
    value: "THREE_DAY_SALE",
    label: "3-Day Sale",
    description: "Weekend-style sale that runs for 3 days.",
    icon: CalendarRange,
    pill: "bg-sky-50 text-sky-700",
    defaultHours: 72,
  },
];

const PRESETS = [
  { label: "6 hours", hours: 6 },
  { label: "24 hours", hours: 24 },
  { label: "3 days", hours: 72 },
];

export default function FlashSaleManagementTab({ tenantSlug }: { tenantSlug: string }) {
  return (
    <CampaignManager
      tenantSlug={tenantSlug}
      icon={<Zap size={20} />}
      title="Flash & 3-Day Sales"
      description="Run time-limited sales with a clear start and end to drive urgency."
      createLabel="New campaign"
      submitLabel="Publish campaign"
      namePlaceholder="e.g. Midnight Flash Sale"
      emptyTitle="No sales yet"
      emptyDescription="Create your first flash or 3-day sale to start bringing in more orders."
      types={TYPES}
      presets={PRESETS}
      listQuery="?type=sales"
    />
  );
}