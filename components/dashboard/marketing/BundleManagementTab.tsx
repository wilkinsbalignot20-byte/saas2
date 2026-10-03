 // components/dashboard/marketing/BundleManagementTab.tsx
"use client";

import { Gift, Package, Boxes } from "lucide-react";
import CampaignManager, { type CampaignTypeOption } from "./CampaignManager";

const TYPES: CampaignTypeOption[] = [
  {
    value: "BUY_1_TAKE_1",
    label: "Buy 1 Take 1",
    description: "Customer buys one, gets one free.",
    icon: Gift,
    pill: "bg-purple-50 text-purple-700",
    defaultHours: 24 * 7,
  },
  {
    value: "BUNDLE",
    label: "Package Bundle",
    description: "Group products into one discounted deal.",
    icon: Package,
    pill: "bg-indigo-50 text-indigo-700",
    defaultHours: 24 * 14,
  },
];

const PRESETS = [
  { label: "7 days", hours: 24 * 7 },
  { label: "14 days", hours: 24 * 14 },
  { label: "30 days", hours: 24 * 30 },
];

export default function BundleManagementTab({ tenantSlug }: { tenantSlug: string }) {
  return (
    <CampaignManager
      tenantSlug={tenantSlug}
      icon={<Boxes size={20} />}
      title="Bundles & Buy 1 Take 1"
      description="Increase order value with BOGO offers and discounted product bundles."
      createLabel="New bundle deal"
      submitLabel="Publish deal"
      namePlaceholder="e.g. Shirt Bundle Deal"
      emptyTitle="No bundle deals yet"
      emptyDescription="Create a Buy 1 Take 1 or bundle promo to move more stock per order."
      types={TYPES}
      presets={PRESETS}
      listQuery="?type=bundles"
    />
  );
}