// components/dashboard/marketing/voucher/VoucherRow.tsx
"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { StatusPill, Toggle, DeleteButton, fmtPeso, fmtDate } from "../shared";
import { discountLabel, voucherStatus } from "./utils";
import type { Voucher } from "./types";

interface Props {
  voucher: Voucher;
  busy: boolean;
  onToggle: (voucher: Voucher) => void;
  onDelete: (voucher: Voucher) => void;
}

export default function VoucherRow({ voucher: v, busy, onToggle, onDelete }: Props) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(v.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked, ignore */
    }
  };

  return (
    <tr className="transition-colors hover:bg-slate-50">
      <td className="px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-2.5 py-1 font-mono text-sm font-bold tracking-wide text-slate-900">
            {v.code}
          </span>
          <button
            type="button"
            onClick={copyCode}
            aria-label={`Copy code ${v.code}`}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
          </button>
        </div>
      </td>

      <td className="whitespace-nowrap px-4 py-4 font-semibold text-emerald-700">{discountLabel(v)}</td>

      <td className="whitespace-nowrap px-4 py-4 text-slate-600">
        {Number(v.minSpend) > 0 ? fmtPeso(Number(v.minSpend)) : <span className="text-slate-400">No minimum</span>}
      </td>

      <td className="whitespace-nowrap px-4 py-4">
        <span className="tabular-nums text-slate-700">
          {v.claimedCount}
          {v.maxClaims != null ? ` / ${v.maxClaims}` : ""}
        </span>
        {v.maxClaims != null && (
          <div className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-slate-100" aria-hidden>
            <div
              className="h-full rounded-full bg-[var(--brand,#0f172a)]"
              style={{ width: `${Math.min(100, (v.claimedCount / v.maxClaims) * 100)}%` }}
            />
          </div>
        )}
      </td>

      <td className="whitespace-nowrap px-4 py-4 text-slate-600">
        {v.expiresAt ? fmtDate(v.expiresAt) : <span className="text-slate-400">No expiry</span>}
      </td>

      <td className="whitespace-nowrap px-5 py-4 sm:px-6">
        <StatusPill status={voucherStatus(v)} />
      </td>

      <td className="whitespace-nowrap px-5 py-4 sm:px-6">
        <div className="flex items-center justify-end gap-3">
          <Toggle
            checked={v.isActive}
            disabled={busy}
            onChange={() => onToggle(v)}
            label={v.isActive ? `Deactivate ${v.code}` : `Activate ${v.code}`}
          />
          <DeleteButton busy={busy} label={`Delete ${v.code}`} onConfirm={() => onDelete(v)} />
        </div>
      </td>
    </tr>
  );
}