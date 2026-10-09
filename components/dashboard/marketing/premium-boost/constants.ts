// components/dashboard/marketing/premium-boost/constants.ts
import { Crown, Flame } from "lucide-react";

export const SLOTS = [
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

export const TYPE_LABELS: Record<string, string> = {
  FLASH_SALE: "Flash Sale",
  THREE_DAY_SALE: "3-Day Sale",
  BUY_1_TAKE_1: "Buy 1 Take 1",
  BUNDLE: "Bundle",
};

export const slotLabel = (v: string | null) => SLOTS.find((s) => s.value === v)?.label ?? v ?? "N/A";