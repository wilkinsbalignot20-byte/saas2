 'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react'; 
import BasicInfoSection from './BasicInfoSection';
import VariantInventorySection from './VariantInventorySection';
import ProductPreviewCard from './ProductPreviewCard';
import FormErrorBanner from './product-form/FormErrorBanner';
import VariantOptimizerPanel from './product-form/VariantOptimizerPanel';
import SaveButton from './product-form/SaveButton';
import { useProductFields } from './product-form/useProductFields';
import { useVariants } from './product-form/useVariants';
import { useVariantOptimizer } from './product-form/useVariantOptimizer';
import { useProductSubmit } from './product-form/useProductSubmit';
import { buildPreviewProps } from './product-form/utils';
import BundlePackagesSection from './BundlePackagesSection';
import { useBundles } from './product-form/useBundles'; // 🌟 Idinagdag ang state hook import
import type { ProductFormProps } from './product-form/types';

export default function ProductForm({ categories, slug, storeName, initialData, productId }: ProductFormProps & { productId?: string }) {
  const [errorMessage, setErrorMessage] = useState('');

  const fields = useProductFields(initialData);
  const variantState = useVariants(initialData?.variants);
  
  // 🌟 1. HAWAKAN ANG STATE NG BUNDLES (Sinasalo ang initialData kapag Edit Mode)
  const bundleState = useBundles((initialData as any)?.bundles);

  const optimizer = useVariantOptimizer({
    productName: fields.name,
    slug,
    onGenerate: variantState.setVariants,
    onError: setErrorMessage,
  });
  
  // 🌟 2. IPASA ANG BUNDLES DATA SA SUBMISSION LOGIC LAYER
  const { submit, loading, deleteProduct, isDeleting } = useProductSubmit({
    slug,
    productId,
    values: {
      name: fields.name,
      description: fields.description,
      categoryId: fields.categoryId,
      newCategoryName: fields.newCategoryName,
      status: fields.status,
      images: fields.images,
    },
    variants: variantState.variants,
    bundles: bundleState.bundles, // <-- IPINASA ANG MGA BUNDLES DITO
    setErrorMessage,
  });

  const previewProps = buildPreviewProps(
    fields,
    variantState.variants,
    categories,
    storeName || slug
  );

  return (
    <form onSubmit={submit} className="grid max-w-6xl gap-8 animate-in fade-in duration-300 lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* LEFT: FORM SECTIONS */}
      <div className="min-w-0 space-y-8">
        <FormErrorBanner message={errorMessage} />

        <BasicInfoSection {...fields} categories={categories} />

        <VariantOptimizerPanel optimizer={optimizer} />

        <VariantInventorySection
          variants={variantState.variants}
          addVariantRow={variantState.addVariantRow}
          removeVariantRow={variantState.removeVariantRow}
          handleVariantChange={variantState.handleVariantChange}
        />

        {/* 🌟 3. IDINAGDAG ANG VISUAL COMPONENT BOX PANEL DITO SA ILALIM NG VARIANTS */}
        <BundlePackagesSection
          bundles={bundleState.bundles}
          addBundleRow={bundleState.addBundleRow}
          removeBundleRow={bundleState.removeBundleRow}
          handleBundleChange={bundleState.handleBundleChange}
        />

        {/* PREVIEW PARA SA MOBILE / TABLET (nasa side column sa desktop) */}
        <details open className="rounded-2xl border border-[#1B211D]/5 bg-white p-4 shadow-sm lg:hidden">
          <summary className="cursor-pointer select-none text-sm font-bold text-[#1B211D]">Preview bago i-save</summary>
          <div className="mt-4">
            <ProductPreviewCard {...previewProps} />
          </div>
        </details>

        {/* ACTION BUTTONS LAYER CONTAINER */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#1B211D]/5 pt-6">
          <div>
            {/* Papakita lamang ang Delete button kung may productId (Ibig sabihin ay kasalukuyang ine-edit ang produkto) */}
            {productId && (
              <button
                type="button"
                onClick={deleteProduct}
                disabled={loading || isDeleting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed border border-red-200/40 transition-colors select-none"
              >
                <Trash2 size={16} />
                <span>{isDeleting ? "Deleting Product..." : "Delete Product"}</span>
              </button>
            )}
          </div>
          
          <div className="w-full sm:w-auto flex justify-end">
            <SaveButton loading={loading || isDeleting} />
          </div>
        </div>
      </div>

      {/* RIGHT: LIVE PREVIEW (sticky sa desktop) */}
      <aside className="hidden self-start lg:sticky lg:top-6 lg:block">
        <ProductPreviewCard {...previewProps} />
      </aside>
    </form>
  );
}
