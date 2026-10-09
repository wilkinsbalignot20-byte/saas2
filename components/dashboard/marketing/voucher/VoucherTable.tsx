// components/dashboard/marketing/voucher/VoucherTable.tsx
"use client";

import VoucherRow from "./VoucherRow";
import type { Voucher } from "./types";

interface Props {
  vouchers: Voucher[];
  busyId: string | null;
  onToggle: (voucher: Voucher) => void;
  onDelete: (voucher: Voucher) => void;
}

export default function VoucherTable({ vouchers, busyId, onToggle, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-xs text-slate-500">
            <th scope="col" className="px-5 py-3 font-semibold sm:px-6">Code</th>
            <th scope="col" className="px-4 py-3 font-semibold">Discount</th>
            <th scope="col" className="px-4 py-3 font-semibold">Minimum spend</th>
            <th scope="col" className="px-4 py-3 font-semibold">Claimed</th>
            <th scope="col" className="px-4 py-3 font-semibold">Expires</th>
            <th scope="col" className="px-5 py-3 font-semibold sm:px-6">Status</th>
            <th scope="col" className="px-5 py-3 text-right font-semibold sm:px-6">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {vouchers.map((v) => (
            <VoucherRow key={v.id} voucher={v} busy={busyId === v.id} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  );
}