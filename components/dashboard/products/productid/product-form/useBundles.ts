"use client";

import { useState } from "react";
import type { BundleInput } from "./types";

/** Custom hook upang hawakan ang dynamic rows ng product packages/bundles sa UI form */
export function useBundles(initialBundles?: any[]) {
  // Kung may initial data mula sa edit page, i-serialize ang decimal parameters bilang strings
  const formattedInitial = initialBundles?.map((b) => ({
    id: b.id,
    name: b.name,
    quantity: b.quantity.toString(),
    price: b.price.toString(),
  })) || [];

  const [bundles, setBundles] = useState<BundleInput[]>(formattedInitial);

  // Magdagdag ng bagong blangkong row para sa bundle sa UI table array matrix
  const addBundleRow = () => {
    setBundles((prev) => [
      ...prev,
      { name: "", quantity: "1", price: "0.00" }
    ]);
  };

  // Tanggalin ang isang partikular na bundle row batay sa index location nito
  const removeBundleRow = (index: number) => {
    setBundles((prev) => prev.filter((_, i) => i !== index));
  };

  // Subaybayan at i-update ang halaga ng input field kapag nagta-type ang tenant sa cell block
  const handleBundleChange = (index: number, field: keyof BundleInput, value: string) => {
    setBundles((prev) =>
      prev.map((bundle, i) => (i === index ? { ...bundle, [field]: value } : bundle))
    );
  };

  return {
    bundles,
    setBundles,
    addBundleRow,
    removeBundleRow,
    handleBundleChange,
  };
}
