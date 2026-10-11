// components/dashboard/products/product-form/useVariants.ts
"use client";

import { useState } from "react";
import type { VariantInput } from "./types";

/** Manual na pag-manage ng variants. Pareho ang pangalan ng props ng VariantInventorySection. */
export function useVariants(initial?: VariantInput[]) {
  const [variants, setVariants] = useState<VariantInput[]>(
    initial || [{ name: "Standard", sku: "", price: "0", stock: "0" }]
  );

  const addVariantRow = () => {
    setVariants((prev) => [...prev, { name: "", sku: "", price: "0", stock: "0" }]);
  };

  const removeVariantRow = (index: number) => {
    setVariants((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const handleVariantChange = (index: number, field: keyof VariantInput, value: string) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };

  return { variants, setVariants, addVariantRow, removeVariantRow, handleVariantChange };
}