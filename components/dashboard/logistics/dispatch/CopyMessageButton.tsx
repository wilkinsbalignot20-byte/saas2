// components/dashboard/logistics/dispatch/CopyMessageButton.tsx
"use client";

import { Check, Copy } from "lucide-react";
import { btnSecondary } from "@/components/dashboard/marketing/shared";

interface Props {
  copied: boolean;
  label: string;
  onClick: () => void;
  className?: string;
}

export default function CopyMessageButton({ copied, label, onClick, className = "" }: Props) {
  return (
    <button type="button" onClick={onClick} className={`${btnSecondary} ${className}`.trim()}>
      {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
      {copied ? "Copied" : label}
    </button>
  );
}