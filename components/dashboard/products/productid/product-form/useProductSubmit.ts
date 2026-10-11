// components/dashboard/products/product-form/useProductSubmit.ts
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buildProductPayload } from "./utils";
import type { ProductFieldValues, VariantInput } from "./types";

interface Options {
  slug: string;
  values: ProductFieldValues;
  variants: VariantInput[];
  setErrorMessage: (message: string) => void;
}

/** Validation at pag-save ng produkto papunta sa API */
export function useProductSubmit({ slug, values, variants, setErrorMessage }: Options) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (!values.name) {
      setErrorMessage("Please provide a valid product title name.");
      setLoading(false);
      return;
    }

    if (!values.categoryId && !values.newCategoryName.trim()) {
      setErrorMessage("Please select an existing category or type a new custom category name.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/stores/${slug}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildProductPayload(slug, values, variants)),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Server rejected database payload integration.");
      }

      router.push(`/dashboard/${slug}/products`);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong while sending to database.");
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading };
}