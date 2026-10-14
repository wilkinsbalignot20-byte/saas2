 // components/dashboard/marketing/product-selector/useProductCatalog.ts
"use client";

import { useEffect, useState } from "react";
import type { Product } from "./types";

/** Kumukuha ng products o bundles ng store tuwing bubukas ang modal base sa strategy type */
export function useProductCatalog(
  tenantSlug: string, 
  enabled: boolean, 
  mode: "products" | "bundles" = "products" // 🌟 IDINAGDAG: Opsyonal na selector parameter flag na may default state
) {
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
        // 🌟 DYNAMIC ROUTING ENDPOINT:
        // Kung ang mode ay "bundles", hihingiin nito ang binuo mong API kahapon
        // Kung hindi, babalik ito sa dating pagkuha ng regular products
        const targetUrl = mode === "bundles"
          ? `/api/stores/${tenantSlug}/products/bundles`
          : `/api/stores/${tenantSlug}/products`;

        const response = await fetch(targetUrl);
        if (!response.ok) throw new Error(`Failed to load ${mode} from database.`);
        
        const data = await response.json();
        
        if (!cancelled) {
          // Ligtas na pag-extract ng array data depende sa structure ng ibinabalik ng iyong backend API
          const cleanData = Array.isArray(data) ? data : (data.products || data.bundles || []);
          setProducts(cleanData);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || `An error occurred while fetching ${mode}.`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStoreProducts();
    return () => {
      cancelled = true;
    };
  }, [enabled, tenantSlug, mode]); // Isinama ang mode sa dependency array para mag-trigger kapag nagpalit ng tab style

  return { products, loading, error };
}
