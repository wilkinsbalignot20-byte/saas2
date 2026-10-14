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
    return <p className="text-center text-xs text-slate-400 py-12">No inventory items found matching your search term.</p>;
  }

  // 🌟 LAYER UPDATE: I-normalize ang bundle data para sumakto sa structure na hinahanap ng ProductRow
  const normalizedProducts = products.map((p: any) => {
    // Kung ito ay isang bundle campaign object (may tiers o choices)
    if (p.bundleType || p.tiers || p.choices) {
      // Kuhanin ang larawan mula sa unang pricing tier, o sa unang choice item, o gumamit ng placeholder
      const bundleImage = p.tiers?.[0]?.images || p.choices?.[0]?.imageUrl || "";
      
      // Kuhanin ang panimulang presyo mula sa unang tier para hindi maging ₱0.00 ang Display Price
      const bundlePrice = p.tiers?.[0]?.price ? String(p.tiers[0].price) : "0";

      return {
        ...p,
        // I-override ang fields para awtomatikong mabasa ng existing ProductRow configuration mo
        image: p.image || bundleImage,
        imageUrl: p.imageUrl || bundleImage,
        price: p.price || bundlePrice,
        sku: p.sku || "BUNDLE", // Palitan ang N/A ng malinis na indicator text
      };
    }
    return p;
  });

  return (
    <div className="divide-y divide-slate-100">
      {normalizedProducts.map((p) => (
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
