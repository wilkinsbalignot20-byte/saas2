// components/dashboard/orders/data-table/SortHeader.tsx
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import type { SortDir } from "./types";

interface Props {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  align?: "left" | "right";
}

export default function SortHeader({ label, active, dir, onClick, align = "left" }: Props) {
  const Icon = !active ? ChevronsUpDown : dir === "asc" ? ChevronUp : ChevronDown;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 font-semibold transition-colors hover:text-slate-900 dark:hover:text-white ${
        align === "right" ? "flex-row-reverse" : ""
      } ${active ? "text-slate-900 dark:text-white" : ""}`}
    >
      {label}
      <Icon size={14} className={active ? "opacity-100" : "opacity-40"} aria-hidden />
    </button>
  );
}