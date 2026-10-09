// components/dashboard/marketing/voucher/VoucherPreview.tsx
"use client";

import { Ticket } from "lucide-react";
import { fmtPeso, fmtDate } from "../shared";
import type { DiscountType } from "./types";

interface Props {
  code: string;
  type: DiscountType;
  value: number;
  minSpend: number;
  limit: number | null;
  expiresDate: Date | null;
}

/** Live na itsura ng voucher habang ini-edit ang form */
export default function VoucherPreview({ code, type, value, minSpend, limit, expiresDate }: Props) {
  const discount = value > 0 ? (type === "FIXED" ? fmtPeso(value) : `${value}%`) : type === "FIXED" ? "₱0" : "0%";
  const min = minSpend > 0 ? `on orders of ${fmtPeso(minSpend)} or more` : "on any order";
  const fixedTooBig = type === "FIXED" && minSpend > 0 && value >= minSpend;

  return (
    <div className="flex items-stretch overflow-hidden rounded-xl border border-dashed border-slate-300 bg-white">
      <div className="flex items-center justify-center bg-[var(--brand,#0f172a)] px-5 text-white">
        <Ticket size={22} />
      </div>
      <div className="flex-1 px-4 py-3">
        <p className="font-mono text-base font-bold tracking-wide text-slate-900">{code || "YOURCODE"}</p>
        <p className="text-sm text-slate-600">
          Bawas <span className="font-semibold text-slate-900">{discount}</span> {min}.
        </p>
        {(limit || expiresDate) && (
          <p className="text-xs text-slate-500">
            {limit ? `Limited to the first ${limit} customers` : ""}
            {limit && expiresDate ? ", " : ""}
            {expiresDate && !Number.isNaN(expiresDate.getTime()) ? `valid until ${fmtDate(expiresDate.toISOString())}` : ""}.
          </p>
        )}
        {fixedTooBig && (
          <p className="mt-1 text-xs font-medium text-amber-700">
            Heads up: the discount is equal to or higher than the minimum spend.
          </p>
        )}
      </div>
    </div>
  );
}