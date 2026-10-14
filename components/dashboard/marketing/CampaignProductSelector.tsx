 // components/dashboard/marketing/CampaignProductSelector.tsx
"use client";

import { useMemo, useState } from "react";
import ProductSelectorModal from "./product-selector/ProductSelectorModal";
import ProductList from "./product-selector/ProductList";
import { useProductCatalog } from "./product-selector/useProductCatalog";
import { useRuleSelection } from "./product-selector/useRuleSelection";
import type { SelectedRulePayload } from "./product-selector/types";

// Re-export para hindi masira ang mga file na nag-i-import mula dito
export type { SelectedRulePayload } from "./product-selector/types";

interface CampaignProductSelectorProps {
  tenantSlug: string;
  campaignType: string; // Dynamic parameter: "BUY_1_TAKE_1", "MIX_AND_MATCH", o "FIXED_PACKAGE"
  onChange: (rules: SelectedRulePayload[]) => void;
}

export default function CampaignProductSelector({ tenantSlug, campaignType, onChange }: CampaignProductSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 🌟 LAYER UPDATE: Alamin kung bundle promotional campaign ang aktibong ginagawa ng admin
  const isBundleCampaign = campaignType === "MIX_AND_MATCH" || campaignType === "FIXED_PACKAGE";

  // 🌟 LAYER UPDATE: Ipasa ang operational mode parameter sa catalog bundle hook para mabago ang routing string sa endpoint fetcher
  // (Paki-siguro na i-extend din ang `useProductCatalog` para tumanggap ng query switcher gamit ang value na ito)
  const { products, loading, error } = useProductCatalog(
    tenantSlug, 
    isOpen, 
    isBundleCampaign ? "bundles" : "products"
  );

  const { selectedRules, toggleProduct, setBundleRole, updateRule } = useRuleSelection({
    campaignType,
    products,
    onChange,
  });

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) => p.name.toLowerCase().includes(term));
  }, [products, searchTerm]);

  return (
    <div className="space-y-2">
      {/* Trigger Area */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <div className="space-y-0.5">
          <span className="block text-sm font-semibold text-slate-900">
            {isBundleCampaign ? "Bundle Rules Setup" : "Product Rules Setup"}
          </span>
          <p className="text-xs text-slate-500">
            {selectedRules.length === 0
              ? isBundleCampaign 
                ? "No specific promotion bundles selected for this campaign rule yet."
                : "No specific items selected for this promo yet."
              : `Currently selected: ${selectedRules.length} ${isBundleCampaign ? "bundle campaign(s)" : "product(s)"} configured.`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
        >
          {isBundleCampaign ? "Select Target Bundles" : "Select Targeted Products"}
        </button>
      </div>

      {isOpen && (
        <ProductSelectorModal
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCount={selectedRules.length}
          onClose={() => setIsOpen(false)}
        >
          <ProductList
            products={filteredProducts}
            rules={selectedRules}
            campaignType={campaignType}
            loading={loading}
            error={error}
            onToggle={toggleProduct}
            onSetBundleRole={setBundleRole}
            onUpdateRule={updateRule}
          />
        </ProductSelectorModal>
      )}
    </div>
  );
}
