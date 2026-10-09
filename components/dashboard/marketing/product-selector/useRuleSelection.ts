// components/dashboard/marketing/product-selector/useRuleSelection.ts
"use client";

import { useEffect, useState } from "react";
import { calcPromoPrice, isAddOnRule } from "./utils";
import type { BundleRole, Product, SelectedRulePayload } from "./types";

interface Options {
  campaignType: string;
  products: Product[];
  onChange: (rules: SelectedRulePayload[]) => void;
}

/** Hawak lahat ng logic para sa napiling products at kanilang discount rules */
export function useRuleSelection({ campaignType, products, onChange }: Options) {
  const [selectedRules, setSelectedRules] = useState<SelectedRulePayload[]>([]);

  // Ipaalam sa parent form tuwing may nagbago sa selections
  useEffect(() => {
    onChange(selectedRules);
  }, [selectedRules, onChange]);

  // Checkbox-style toggle (Flash Sale at BUY_1_TAKE_1)
  const toggleProduct = (product: Product) => {
    setSelectedRules((prev) => {
      if (prev.some((r) => r.productId === product.id)) {
        return prev.filter((r) => r.productId !== product.id);
      }
      const isBogo = campaignType === "BUY_1_TAKE_1";
      const firstVariant = product.variants?.[0];
      const defaultRule: SelectedRulePayload = {
        productId: product.id,
        variantId: firstVariant ? firstVariant.id : null,
        promoPrice: isBogo ? 0 : null,
        discountType: "PERCENTAGE",
        discountValue: isBogo ? 100 : 0,
      };
      return [...prev, defaultRule];
    });
  };

  // Main / Add-on roles (BUNDLE lang)
  const setBundleRole = (product: Product, role: BundleRole) => {
    if (campaignType !== "BUNDLE") return;
    const firstVariant = product.variants?.[0];
    const basePrice = Number(firstVariant?.price || 0);
    const variantId = firstVariant ? firstVariant.id : null;

    setSelectedRules((prev) => {
      if (role === "MAIN") {
        // Isang main product lang ang pwede sa bundle deal
        return [
          ...prev.filter((r) => r.requiredQuantity !== 1 && r.productId !== product.id),
          {
            productId: product.id,
            variantId,
            promoPrice: basePrice,
            discountType: "PERCENTAGE",
            discountValue: 0,
            requiredQuantity: 1,
            freeQuantity: 0,
          },
        ];
      }

      // ADDON: toggle. Kapag add-on na, tanggalin.
      const current = prev.find((r) => r.productId === product.id);
      if (isAddOnRule(current)) return prev.filter((r) => r.productId !== product.id);

      return [
        ...prev.filter((r) => r.productId !== product.id),
        {
          productId: product.id,
          variantId,
          promoPrice: basePrice,
          discountType: "PERCENTAGE",
          discountValue: 10, // Default 10% OFF para sa add-on
          requiredQuantity: 0,
          freeQuantity: 1,
        },
      ];
    });
  };

  // Pag-edit ng isang field ng rule; ni-re-compute ang promoPrice kapag discount ang nagbago
  const updateRule = (productId: string, field: keyof SelectedRulePayload, value: any) => {
    setSelectedRules((prev) =>
      prev.map((r) => {
        if (r.productId !== productId) return r;

        const updated = { ...r, [field]: value };

        if (field === "discountType" || field === "discountValue") {
          const originalPrice = Number(products.find((p) => p.id === productId)?.variants?.[0]?.price || 0);
          const dType = field === "discountType" ? value : updated.discountType;
          const dValue = Number(field === "discountValue" ? value : updated.discountValue) || 0;
          updated.promoPrice = calcPromoPrice(originalPrice, dType, dValue);
        }

        return updated;
      })
    );
  };

  return { selectedRules, toggleProduct, setBundleRole, updateRule };
}