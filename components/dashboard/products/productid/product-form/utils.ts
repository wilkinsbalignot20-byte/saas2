 // components/dashboard/products/product-form/utils.ts
import type { AttributeGroup, CategoryOption, ProductFieldValues, VariantInput } from "./types";

interface GenerateOptions {
  basePrice: string;
  productName: string;
  storeSlug: string;
}

const clean = (s: string, len: number) => s.replace(/[^a-zA-Z0-9]/g, "").substring(0, len).toUpperCase();

/**
 * Cartesian product ng lahat ng attribute options.
 * Ibinabalik ang `null` kung walang kahit isang valid na attribute (name + options).
 */
export function generateVariantCombinations(
  attributes: AttributeGroup[],
  { basePrice, productName, storeSlug }: GenerateOptions
): VariantInput[] | null {
  // Linisin ang mga walang lamang inputs
  const activeGroups = attributes
    .map((group) => ({
      name: group.name.trim(),
      options: group.options
        .split(",")
        .map((opt) => opt.trim())
        .filter((opt) => opt.length > 0),
    }))
    .filter((group) => group.name.length > 0 && group.options.length > 0);

  if (activeGroups.length === 0) return null;

  const combinations = activeGroups
    .slice(1)
    .reduce<string[][]>(
      (acc, group) => acc.flatMap((arr) => group.options.map((option) => [...arr, option])),
      activeGroups[0].options.map((opt) => [opt])
    );

  // Auto SKU: STORE-PRODUCT-OPT1-OPT2
  const storePart = clean(storeSlug, 3);
  const productPart = clean(productName || "PROD", 5);

  return combinations.map((combination) => ({
    name: combination.join(" / "),
    sku: `${storePart}-${productPart}-${combination.map((opt) => clean(opt, 3)).join("-")}`,
    price: basePrice || "0",
    stock: "0",
  }));
}

/** Ang ipapadala sa API */
export function buildProductPayload(slug: string, values: ProductFieldValues, variants: VariantInput[]) {
  return {
    slug,
    name: values.name,
    description: values.description,
    categoryId: values.categoryId || null,
    newCategoryName: values.newCategoryName.trim() || null,
    status: values.status,
    images: values.images,
    variants: variants.map((v) => ({
      name: v.name || "Standard",
      sku: v.sku.trim(),
      price: parseFloat(v.price) || 0,
      stock: parseInt(v.stock) || 0,
    })),
  };
}

/** Live preview data (derived mula sa form state, walang extra state) */
export function buildPreviewProps(
  values: ProductFieldValues,
  variants: VariantInput[],
  categories: CategoryOption[],
  storeLabel: string
) {
  const newCategory = values.newCategoryName.trim();
  return {
    images: values.images,
    name: values.name,
    categoryName: newCategory || categories.find((c) => c.id === values.categoryId)?.name || "",
    isNewCategory: Boolean(newCategory),
    prices: variants.map((v) => parseFloat(v.price)),
    variantCount: variants.length,
    status: values.status,
    storeName: storeLabel,
  };
}