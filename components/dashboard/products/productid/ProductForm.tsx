 'use client';

import { useState } from 'react';
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
import type { ProductFormProps } from './product-form/types';

export default function ProductForm({ categories, slug, storeName, initialData }: ProductFormProps) {
  const [errorMessage, setErrorMessage] = useState('');

  const fields = useProductFields(initialData);
  const variantState = useVariants(initialData?.variants);
  const optimizer = useVariantOptimizer({
    productName: fields.name,
    slug,
    onGenerate: variantState.setVariants,
    onError: setErrorMessage,
  });
  const { submit, loading } = useProductSubmit({
    slug,
    values: {
      name: fields.name,
      description: fields.description,
      categoryId: fields.categoryId,
      newCategoryName: fields.newCategoryName,
      status: fields.status,
      images: fields.images,
    },
    variants: variantState.variants,
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

        {/* PREVIEW PARA SA MOBILE / TABLET (nasa side column sa desktop) */}
        <details open className="rounded-2xl border border-[#1B211D]/5 bg-white p-4 shadow-sm lg:hidden">
          <summary className="cursor-pointer select-none text-sm font-bold text-[#1B211D]">Preview bago i-save</summary>
          <div className="mt-4">
            <ProductPreviewCard {...previewProps} />
          </div>
        </details>

        <SaveButton loading={loading} />
      </div>

      {/* RIGHT: LIVE PREVIEW (sticky sa desktop) */}
      <aside className="hidden self-start lg:sticky lg:top-6 lg:block">
        <ProductPreviewCard {...previewProps} />
      </aside>
    </form>
  );
}