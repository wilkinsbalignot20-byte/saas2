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
  campaignType: string; // Halimbawa: "BUNDLE" o "BUY_1_TAKE_1"
  onChange: (rules: SelectedRulePayload[]) => void;
}

export default function CampaignProductSelector({ tenantSlug, campaignType, onChange }: CampaignProductSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { products, loading, error } = useProductCatalog(tenantSlug, isOpen);
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
      {/* Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <div className="space-y-0.5">
          <span className="block text-sm font-semibold text-slate-900">Product Rules Setup</span>
          <p className="text-xs text-slate-500">
            {selectedRules.length === 0
              ? "No specific items selected for this promo yet."
              : `Currently selected: ${selectedRules.length} product(s) configured.`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
        >
          Select Targeted Products
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