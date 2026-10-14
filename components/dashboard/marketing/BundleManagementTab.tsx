 // components/dashboard/marketing/BundleManagementTab.tsx
"use client";

import { Gift, Package, Boxes, LayoutGrid } from "lucide-react";
import CampaignManager, { type CampaignTypeOption } from "./CampaignManager";

const TYPES: CampaignTypeOption[] = [
  {
    value: "BUY_1_TAKE_1",
    label: "Buy 1 Take 1",
    description: "Customer buys one, gets one free.",
    icon: Gift,
    pill: "bg-purple-50 text-purple-700 dark:bg-purple-400/10 dark:text-purple-400",
    defaultHours: 24 * 7,
  },
  // 🌟 LAYER UPDATE: Ikonektat ang FIXED_PACKAGE strategy mula sa useBundleForm
  {
    value: "FIXED_PACKAGE",
    label: "Pre-packed Package Box",
    description: "Group pre-selected fixed products into a standard package tier.",
    icon: Package,
    pill: "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-400",
    defaultHours: 24 * 14,
  },
  // 🌟 LAYER UPDATE: Ikonekta ang MIX_AND_MATCH strategy mula sa useBundleForm
  {
    value: "MIX_AND_MATCH",
    label: "Flexible Mix & Match",
    description: "Allow customers to choose custom standalone items to build their pack.",
    icon: LayoutGrid,
    pill: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400",
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
      description="Increase order value with BOGO offers and dynamic product strategy bundles."
      createLabel="New bundle deal"
      submitLabel="Publish deal"
      namePlaceholder="e.g. Shirt Bundle Deal"
      emptyTitle="No bundle deals yet"
      emptyDescription="Create a Mix & Match or Pre-packed package promo to move more stock per order."
      types={TYPES}
      presets={PRESETS}
      // 🌟 LAYER UPDATE: Tiyakin na ang API params query ay mag-fe-fetch ng data na kasama ang dalawang bundle types mo
      listQuery="?type=bundles&strategies=MIX_AND_MATCH,FIXED_PACKAGE"
    />
  );
}
