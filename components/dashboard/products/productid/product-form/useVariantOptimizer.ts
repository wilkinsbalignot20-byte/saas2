// components/dashboard/products/product-form/useVariantOptimizer.ts
"use client";

import { useState } from "react";
import { generateVariantCombinations } from "./utils";
import type { AttributeGroup, VariantInput } from "./types";

interface Options {
  productName: string;
  slug: string;
  onGenerate: (variants: VariantInput[]) => void;
  onError: (message: string) => void;
}

/** State at actions ng Variant Optimizer matrix */
export function useVariantOptimizer({ productName, slug, onGenerate, onError }: Options) {
  const [enabled, setEnabled] = useState(false);
  const [attributes, setAttributes] = useState<AttributeGroup[]>([{ name: "Size", options: "S, M, L" }]);
  const [basePrice, setBasePrice] = useState("0");

  const addAttribute = () => setAttributes((prev) => [...prev, { name: "", options: "" }]);

  const removeAttribute = (index: number) =>
    setAttributes((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));

  const changeAttribute = (index: number, field: keyof AttributeGroup, value: string) =>
    setAttributes((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)));

  const generate = () => {
    const result = generateVariantCombinations(attributes, { basePrice, productName, storeSlug: slug });
    if (!result) {
      onError("Please provide at least one Attribute Name and Option (e.g., Size: S, M).");
      return;
    }
    // Dito binabago ang master variants state para mag-render agad sa VariantInventorySection
    onGenerate(result);
    onError("");
  };

  return { enabled, setEnabled, attributes, basePrice, setBasePrice, addAttribute, removeAttribute, changeAttribute, generate };
}

export type VariantOptimizerState = ReturnType<typeof useVariantOptimizer>;