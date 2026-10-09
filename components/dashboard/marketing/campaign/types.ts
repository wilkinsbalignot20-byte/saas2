// components/dashboard/marketing/campaign/types.ts
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { SelectedRulePayload } from "../CampaignProductSelector";

export interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  isPremiumBoosted?: boolean;
}

export interface CampaignTypeOption {
  value: string;
  label: string;
  description: string;
  icon: LucideIcon;
  pill: string; // tailwind classes para sa type badge
  defaultHours?: number; // auto-fill ng end date
}

export interface CampaignManagerProps {
  tenantSlug: string;
  icon: ReactNode;
  title: string;
  description: string;
  createLabel: string;
  submitLabel: string;
  namePlaceholder: string;
  emptyTitle: string;
  emptyDescription: string;
  types: CampaignTypeOption[];
  presets: { label: string; hours: number }[];
  /** optional query string para sa API, hal. "?type=bundles" */
  listQuery?: string;
}

/** Ito ang ipapadala ng form papunta sa API */
export interface CampaignPayload {
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  rules: SelectedRulePayload[];
}

export type NoticeState = { kind: "success" | "error"; text: string } | null;