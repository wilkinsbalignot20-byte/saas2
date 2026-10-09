// components/dashboard/marketing/product-selector/ProductList.tsx
"use client";

import ProductRow from "./ProductRow";
import type { BundleRole, Product, SelectedRulePayload } from "./types";

interface Props {
  products: Product[];
  rules: SelectedRulePayload[];
  campaignType: string;
  loading: boolean;
  error: string | null;
  onToggle: (product: Product) => void;
  onSetBundleRole: (product: Product, role: BundleRole) => void;
  onUpdateRule: (productId: string, field: keyof SelectedRulePayload, value: any) => void;
}

export default function ProductList({
  products,
  rules,
  campaignType,
  loading,
  error,
  onToggle,
  onSetBundleRole,
  onUpdateRule,
}: Props) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-[var(--brand,#0f172a)] rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Syncing storefront inventory...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl p-4">{error}</p>;
  }

  if (products.length === 0) {
    return <p className="text-center text-xs text-slate-400 py-12">No inventory products found matching your search term.</p>;
  }

  return (
    <div className="divide-y divide-slate-100">
      {products.map((p) => (
        <ProductRow
          key={p.id}
          product={p}
          rule={rules.find((r) => r.productId === p.id)}
          campaignType={campaignType}
          onToggle={onToggle}
          onSetBundleRole={onSetBundleRole}
          onUpdateRule={onUpdateRule}
        />
      ))}
    </div>
  );
}