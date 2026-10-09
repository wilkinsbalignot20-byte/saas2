// components/dashboard/marketing/premium-boost/types.ts

export interface BoostCampaign {
  id: string;
  name: string;
  type: string;
  status: string;
  startDate?: string;
  endDate?: string;
  isPremiumBoosted: boolean;
  boostedSlotType: string | null;
}

export type NoticeState = { kind: "success" | "error"; text: string } | null;