// components/dashboard/marketing/product-selector/useProductCatalog.ts
"use client";

import { useEffect, useState } from "react";
import type { Product } from "./types";

/** Kumukuha ng products ng store tuwing bubukas ang modal */
export function useProductCatalog(tenantSlug: string, enabled: boolean) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function fetchStoreProducts() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/stores/${tenantSlug}/products`);
        if (!response.ok) throw new Error("Failed to load products from database.");
        const data = await response.json();
        if (!cancelled) setProducts(data);
      } catch (err: any) {
        if (!cancelled) setError(err.message || "An error occurred while fetching products.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStoreProducts();
    return () => {
      cancelled = true;
    };
  }, [enabled, tenantSlug]);

  return { products, loading, error };
}