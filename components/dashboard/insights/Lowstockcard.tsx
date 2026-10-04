// components/dashboard/insights/LowStockCard.tsx
import Link from "next/link";
import { PackageX } from "lucide-react";
import CardShell, { CardEmpty, SkeletonRows } from "./Cardshell";
import type { InsightsData } from "./types";

export default function LowStockCard({
  items,
  slug,
  loading,
}: {
  items: InsightsData["lowStock"] | undefined;
  slug: string;
  loading: boolean;
}) {
  return (
    <CardShell
      title="Low stock"
      description="Published items with 5 or fewer left."
      icon={<PackageX size={18} />}
      className="h-full"
      action={
        <Link href={`/dashboard/${slug}/products`} className="text-xs font-semibold text-slate-500 hover:text-slate-900">
          Products
        </Link>
      }
    >
      {loading ? (
        <SkeletonRows rows={4} />
      ) : !items || items.length === 0 ? (
        <CardEmpty>All good. Nothing is running low right now.</CardEmpty>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((v) => (
            <li key={v.sku} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {v.productName}
                  {v.variantName && v.variantName !== "Standard" && (
                    <span className="font-normal text-slate-500"> ({v.variantName})</span>
                  )}
                </p>
                <p className="font-mono text-[11px] text-slate-400">{v.sku}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${
                  v.stock === 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                }`}
              >
                {v.stock === 0 ? "Out of stock" : `${v.stock} left`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </CardShell>
  );
}