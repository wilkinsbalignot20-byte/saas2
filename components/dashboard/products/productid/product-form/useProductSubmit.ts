 "use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buildProductPayload } from "./utils";
import type { ProductFieldValues, VariantInput } from "./types";

interface Options {
  slug: string;
  productId?: string;
  values: ProductFieldValues;
  variants: VariantInput[];
  setErrorMessage: (message: string) => void;
}

/** Validation, pag-save, at pagbura ng produkto (Multi-tenant safe) */
export function useProductSubmit({ slug, productId, values, variants, setErrorMessage }: Options) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. SAVE / UPDATE LOGIC
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
      const apiUrl = productId 
        ? `/api/stores/${slug}/products/${productId}` 
        : `/api/stores/${slug}/products`;

      const apiMethod = productId ? "PATCH" : "POST";

      const res = await fetch(apiUrl, {
        method: apiMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildProductPayload(slug, values, variants)), // Nalinis na: Tinanggal ang bundles parameter dito
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

  // 2. FULL DELETION LOGIC (Cloudinary + Prisma Cascade)
  const deleteProduct = async () => {
    if (!productId) return;
    
    const confirmDelete = confirm("Are you sure you want to permanently delete this product and all its cloud images? This action cannot be undone.");
    if (!confirmDelete) return;

    setIsDeleting(true);
    setErrorMessage("");

    try {
      const res = await fetch(`/api/stores/${slug}/products/${productId}`, {
        method: "DELETE",
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Failed to completely delete the product catalog.");
      }

      router.push(`/dashboard/${slug}/products`);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while attempting product removal.");
      setIsDeleting(false);
    }
  };

  return { submit, loading, deleteProduct, isDeleting };
}
