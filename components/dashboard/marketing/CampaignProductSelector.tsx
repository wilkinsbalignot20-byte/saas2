 // components/dashboard/marketing/CampaignProductSelector.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, X, CheckSquare, Square, Percent, Banknote } from "lucide-react";
import { inputClass, btnPrimary, btnSecondary } from "./shared";

// Patalasin ang mga properties base sa iyong database configuration
interface Variant {
  id: string;
  name: string;
  price: number;
  sku: string;
}

interface Product {
  id: string;
  name: string;
  images: string[];
  variants: Variant[];
}

export interface SelectedRulePayload {
  productId: string;
  variantId: string | null;
  promoPrice: number | null;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
}

interface CampaignProductSelectorProps {
  tenantSlug: string;
  onChange: (rules: SelectedRulePayload[]) => void;
}

export default function CampaignProductSelector({ tenantSlug, onChange }: CampaignProductSelectorProps) {
  // Modal layout activation state boundary
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Searching & selections core filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRules, setSelectedRules] = useState<SelectedRulePayload[]>([]);

  // 1. AUTOMATIC DATA SYNCHRONIZATION FROM THE PRODUCTS API
  useEffect(() => {
    if (!isOpen) return;

    async function fetchStoreProducts() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/stores/${tenantSlug}/products`);
        if (!response.ok) throw new Error("Failed to load products from database.");
        const data = await response.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching products.");
      } finally {
        setLoading(false);
      }
    }

    fetchStoreProducts();
  }, [isOpen, tenantSlug]);

  // 2. DISPATCH STATE TO OWNER FORM WHENEVER SELECTIONS ALTER
  useEffect(() => {
    onChange(selectedRules);
  }, [selectedRules, onChange]);

  // 3. SEARCH UTILITY MATRIX HOOK
  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) => p.name.toLowerCase().includes(term));
  }, [products, searchTerm]);

  // 4. CHECKBOX STATE SELECTOR OVERRIDE TRACKER
  const handleToggleProduct = (product: Product) => {
    const isChecked = selectedRules.some((r) => r.productId === product.id);
    
    if (isChecked) {
      // Kapag in-uncheck, tanggalin sa rules array tracker list
      setSelectedRules((prev) => prev.filter((r) => r.productId !== product.id));
    } else {
      // Kapag ini-check, gawan ng default placeholder item configuration
      const firstVariant = product.variants?.[0];
      const defaultRule: SelectedRulePayload = {
        productId: product.id,
        variantId: firstVariant ? firstVariant.id : null,
        promoPrice: null,
        discountType: "PERCENTAGE",
        discountValue: 0
      };
      setSelectedRules((prev) => [...prev, defaultRule]);
    }
  };

  // 5. INNER CELL DISPATCHER FOR COMPONENT FIELD RE-WRITES
  const updateRule = (productId: string, field: keyof SelectedRulePayload, value: any) => {
    setSelectedRules((prev) =>
      prev.map((r) => {
        if (r.productId !== productId) return r;
        
        const updated = { ...r, [field]: value };

        // Kalkulahin ang promoPrice kapag discount details ang nagbago para sa backend integration
        const targetProduct = products.find((p) => p.id === productId);
        const originalPrice = Number(targetProduct?.variants?.[0]?.price || 0);

        if (field === "discountType" || field === "discountValue") {
          const dType = field === "discountType" ? value : updated.discountType;
          const dValue = Number(field === "discountValue" ? value : updated.discountValue) || 0;

          if (dType === "PERCENTAGE") {
            updated.promoPrice = originalPrice - (originalPrice * dValue) / 100;
          } else {
            updated.promoPrice = Math.max(0, originalPrice - dValue);
          }
        }

        return updated;
      })
    );
  };
  return (
    <div className="space-y-2">
      {/* TRIGGER ACTION CONTROLLER BUTTON */}
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

      {/* OVERLAY POPUP LAYER BACKDROP SCREEN PANEL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* BACKGROUND BLUR DIMMING OVERLAY SHIELD */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" 
            onClick={() => setIsOpen(false)}
          />

          {/* MAIN MODAL CORE DIALOG LAYER */}
          <div className="relative flex h-full max-h-[640px] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* CONTAINER CORE HEADER BLOCK */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Select Products for Promo</h3>
                <p className="text-xs text-slate-400">Configure distinct price drops for each stock listing rule</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* SELECTION SEARCH TOOLBAR FILTER MATRIX */}
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
              <div className="relative w-full">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search item name by text filter keywords..."
                  className={`${inputClass} h-9 pl-9 text-xs`}
                />
              </div>
            </div>

            {/* LIST SEGMENT ELEMENT INNER LAYER CONTAINER */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-[var(--brand,#0f172a)] rounded-full animate-spin" />
                  <p className="text-xs text-slate-400">Syncing storefront inventory...</p>
                </div>
              ) : error ? (
                <p className="text-center text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl p-4">{error}</p>
              ) : filteredProducts.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-12">No inventory products found matching your search term.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const firstVariant = p.variants?.[0];
                    const basePrice = Number(firstVariant?.price || 0);
                    const rule = selectedRules.find((r) => r.productId === p.id) || { discountType: "PERCENTAGE", discountValue: 0 };
                    const isChecked = selectedRules.some((r) => r.productId === p.id);
                    const imgUrl = p.images?.[0] || null;

                    return (
                      <div key={p.id} className="py-3.5 first:pt-0 last:pb-0 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleProduct(p)}
                            className="flex items-center gap-3 text-left group flex-1 cursor-pointer"
                          >
                            <span className="text-slate-400 group-hover:text-slate-600 transition shrink-0">
                              {isChecked ? (
                                <CheckSquare size={19} className="text-[var(--brand,#0f172a)]" fill="currentColor" fillOpacity={0.1} />
                              ) : (
                                <Square size={19} />
                              )}
                            </span>
                            
                            {imgUrl && (
                              <img src={imgUrl} alt={p.name} className="w-9 h-9 rounded-lg object-cover border border-slate-100 shrink-0" />
                            )}

                            <div className="space-y-0.5">
                              <span className="block text-sm font-semibold text-slate-900 group-hover:text-[var(--brand,#0f172a)] transition">{p.name}</span>
                              <span className="block text-xs font-medium text-slate-400">
                                SKU: {firstVariant?.sku || "N/A"} &bull; Reg. Price: ₱{basePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </button>
                        </div>

                        {/* CONDITIONAL DISCOUNT CALCULATION CONTAINER MATRIX PANEL */}
                        {isChecked && (
                          <div className="flex flex-wrap items-center gap-2.5 pl-8 transition-all animate-in fade-in slide-in-from-top-1 duration-150">
                            
                            {/* DISCOUNT CONTROLLER SECTOR */}
                            <div className="relative flex items-center shrink-0">
                              <select
                                value={rule.discountType}
                                onChange={(e) => updateRule(p.id, "discountType", e.target.value)}
                                className="rounded-lg border border-slate-200 bg-white pl-2 pr-7 py-1 text-xs font-semibold text-slate-700 focus:border-[var(--brand,#0f172a)] focus:outline-none appearance-none cursor-pointer h-7"
                              >
                                <option value="PERCENTAGE">% OFF</option>
                                <option value="FIXED">₱ OFF</option>
                              </select>
                              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                                {rule.discountType === "PERCENTAGE" ? <Percent size={11} /> : <Banknote size={11} />}
                              </div>
                            </div>

                            {/* DISCOUNT VALUE INPUT COMPONENT */}
                            <input
                              type="number"
                              min="0"
                              max={rule.discountType === "PERCENTAGE" ? "100" : undefined}
                              value={rule.discountValue || ""}
                              onChange={(e) => updateRule(p.id, "discountValue", e.target.value)}
                              placeholder={rule.discountType === "PERCENTAGE" ? "10" : "150"}
                              className="w-20 h-7 rounded-lg border border-slate-200 px-2 text-xs font-bold text-slate-900 focus:border-[var(--brand,#0f172a)] focus:outline-none text-center"
                            />

                            {/* LIVE VISUALIZATION ANCHOR COMPILER */}
                            <span className="text-xs font-medium text-slate-400">
                              &rarr; Promo:{" "}
                              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                ₱
                                {rule.discountType === "PERCENTAGE"
                                  ? (basePrice - (basePrice * (Number(rule.discountValue) || 0)) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                  : Math.max(0, basePrice - (Number(rule.discountValue) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </span>

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* LOWER CONTAINER FOOTER ACTION TRIGGER TERMINALS */}
            <div className="flex justify-end border-t border-slate-100 bg-slate-50/50 px-5 py-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={`${btnPrimary} h-8 text-xs px-4`}
              >
                Confirm Selection ({selectedRules.length})
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
