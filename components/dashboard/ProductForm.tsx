 'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, AlertCircle, Plus, Trash2, Wand2 } from 'lucide-react';
import BasicInfoSection from './BasicInfoSection';
import VariantInventorySection from './VariantInventorySection';
import ProductPreviewCard from './ProductPreviewCard';

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: CategoryOption[];
  slug: string;
  storeName?: string;
  productId?: string;
  initialData?: {
    id: string;
    name: string;
    description: string;
    images: string[];
    status: string;
    categoryId: string;
    variants: VariantInput[];
  };
}

interface VariantInput {
  name: string;
  sku: string;
  price: string;
  stock: string;
}

// Interface para sa Attribute Rows ng Optimizer
interface AttributeGroup {
  name: string;    // Halimbawa: "Size" o "Color"
  options: string; // Halimbawa: "S, M, L" o "Red, Blue"
}

export default function ProductForm({ categories, slug, storeName, productId, initialData }: ProductFormProps) {
  const router = useRouter();
  
  // Isalaksak ang initial data strings para magkaroon ng laman agad ang mga fields
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [status, setStatus] = useState(initialData?.status || 'draft');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [newCategoryName, setNewCategoryName] = useState('');

  // I-load ang mga dating variants ng produkto mula sa database
  const [variants, setVariants] = useState<VariantInput[]>(
    initialData?.variants || [{ name: 'Standard', sku: '', price: '0', stock: '0' }]
  );

  // 2. STATES PARA SA ATTR OPTIMIZER MATRIX
  const [useOptimizer, setUseOptimizer] = useState(false);
  const [attributes, setAttributes] = useState<AttributeGroup[]>([
    { name: 'Size', options: 'S, M, L' }
  ]);
  const [basePrice, setBasePrice] = useState('0');

  // ATTRIBUTES MATRIX CONTROLLERS
  const addAttributeGroup = () => {
    setAttributes([...attributes, { name: '', options: '' }]);
  };

  const removeAttributeGroup = (index: number) => {
    if (attributes.length === 1) return;
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const handleAttributeChange = (index: number, field: keyof AttributeGroup, value: string) => {
    const updated = [...attributes];
    updated[index][field] = value;
    setAttributes(updated);
  };

  // CARTESIAN PRODUCT VARIANT OPTIMIZER ENGINE
  const generateOptimizedVariants = () => {
    // Linisin ang mga walang lamang inputs
    const activeGroups = attributes
      .map(group => ({
        name: group.name.trim(),
        options: group.options
          .split(',')
          .map(opt => opt.trim())
          .filter(opt => opt.length > 0)
      }))
      .filter(group => group.name.length > 0 && group.options.length > 0);

    if (activeGroups.length === 0) {
      setErrorMessage('Please provide at least one Attribute Name and Option (e.g., Size: S, M).');
      return;
    }

    // Cartesian Combination Algorithm
    const combine = (acc: string[][], currentGroup: { name: string; options: string[] }): string[][] => {
      const res: string[][] = [];
      acc.forEach((arr) => {
        currentGroup.options.forEach((option) => {
          res.push([...arr, option]);
        });
      });
      return res;
    };

    const initialCombinations: string[][] = activeGroups[0].options.map(opt => [opt]);
    const rawCombinations = activeGroups.slice(1).reduce(combine, initialCombinations);

    // I-transform para maging VariantInput structure na kayang basahin ng VariantInventorySection mo
    const generated: VariantInput[] = rawCombinations.map((combination) => {
      const variantName = combination.join(' / ');
      
      // Auto SKU Generator base sa business rules ng store at product name
      const skuSuffix = combination
        .map(opt => opt.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase())
        .join('-');
      const cleanProductSlug = (name || 'PROD').replace(/[^a-zA-Z0-9]/g, '').substring(0, 5).toUpperCase();
      const cleanStoreSlug = slug.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
      
      const generatedSku = `${cleanStoreSlug}-${cleanProductSlug}-${skuSuffix}`;

      return {
        name: variantName,
        sku: generatedSku,
        price: basePrice || '0',
        stock: '0'
      };
    });

    // Dito binabago ang master state para mag-render agad sa VariantInventorySection!
    setVariants(generated);
    setErrorMessage('');
  };

  // MANUAL CONTROL HANDLERS (Galing sa orihinal mong code para sa 'Add Variant' manual button)
  const addVariantRow = () => {
    setVariants([...variants, { name: '', sku: '', price: '0', stock: '0' }]);
  };

  const removeVariantRow = (index: number) => {
    if (variants.length === 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: keyof VariantInput, value: string) => {
    const updatedVariants = [...variants];
    updatedVariants[index][field] = value;
    setVariants(updatedVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    if (!name) {
      setErrorMessage('Please provide a valid product title name.');
      setLoading(false);
      return;
    }

    if (!categoryId && !newCategoryName.trim()) {
      setErrorMessage('Please select an existing category or type a new custom category name.');
      setLoading(false);
      return;
    }

    try {
      const productPayload = {
        slug,
        name,
        description,
        categoryId: categoryId || null,
        newCategoryName: newCategoryName.trim() || null,
        status,
        images,
        variants: variants.map(v => ({
          name: v.name || 'Standard',
          sku: v.sku.trim(),
          price: parseFloat(v.price) || 0,
          stock: parseInt(v.stock) || 0
        }))
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productPayload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Server rejected database payload integration.');
      }

      router.push(`/dashboard/${slug}/products`);
      router.refresh();

    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong while sending to database.');
    } finally {
      setLoading(false);
    }
  };

  // LIVE PREVIEW DATA (derived mula sa form state, walang extra state)
  const previewCategoryName =
    newCategoryName.trim() || categories.find((c) => c.id === categoryId)?.name || '';
  const previewPrices = variants.map((v) => parseFloat(v.price));

  const previewProps = {
    images,
    name,
    categoryName: previewCategoryName,
    isNewCategory: Boolean(newCategoryName.trim()),
    prices: previewPrices,
    variantCount: variants.length,
    status,
    storeName: storeName || slug,
  };

  return (
    <form onSubmit={handleSubmit} className="grid max-w-6xl gap-8 animate-in fade-in duration-300 lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* LEFT: FORM SECTIONS */}
      <div className="min-w-0 space-y-8">
    
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* MODULE SECTION 1 CALL */}
        <BasicInfoSection
          name={name} setName={setName}
          description={description} setDescription={setDescription}
          categoryId={categoryId} setCategoryId={setCategoryId}
          status={status} setStatus={setStatus}
          newCategoryName={newCategoryName} setNewCategoryName={setNewCategoryName}
          images={images} setImages={setImages}
          categories={categories}
        />

        {/* OPTIMIZER MATRIX LAYOUT PANEL */}
        <div className="bg-white p-6 rounded-2xl border border-[#1B211D]/5 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-[#1B211D] font-display uppercase tracking-wider text-xs opacity-50">
                Product Variant Optimizer
              </h3>
              <p className="text-xs text-[#1B211D]/40 mt-0.5">
                Awtomatikong mag-generate ng maramihang variants gamit ang mga attributes (e.g., Model, Size, Features).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-[#1B211D]/60 select-none cursor-pointer">Enable Optimizer</label>
              <input 
                type="checkbox"
                checked={useOptimizer}
                onChange={(e) => setUseOptimizer(e.target.checked)}
                className="w-4 h-4 accent-[#3E8F68] cursor-pointer"
              />
            </div>
          </div>

          {useOptimizer && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#F6F5F1]/50 p-4 rounded-xl items-end border border-[#1B211D]/5">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-[#1B211D]/50 uppercase tracking-tight">Base Price Default (₱)</label>
                  <input 
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full bg-white border border-[#1B211D]/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#3E8F68]"
                  />
                </div>
                <button
                  type="button"
                  onClick={generateOptimizedVariants}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#1B211D] text-white text-xs font-semibold h-[34px] px-4 rounded-lg hover:bg-slate-800 transition-colors shadow-sm cursor-pointer select-none"
                >
                  <Wand2 size={14} />
                  <span>Compile Combinations</span>
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold text-[#1B211D]/50 uppercase tracking-tight block">
                  Attributes Input
                </label>
            
                {/* ISANG BESES LANG DAPAT ANG MAP LAYERING */}
                {attributes.map((attr, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white border border-[#1B211D]/10 p-3 rounded-xl">
                    <input 
                      type="text"
                      placeholder="e.g., Color, Size, Model"
                      value={attr.name}
                      onChange={(e) => handleAttributeChange(idx, 'name', e.target.value)}
                      className="w-1/3 bg-[#F6F5F1]/30 border border-[#1B211D]/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#3E8F68] font-semibold text-[#1B211D]"
                    />
                    <input 
                      type="text"
                      placeholder="Maglagay ng kuwit sa pagitan ng pagpipilian (e.g., Red, Blue, Green)"
                      value={attr.options}
                      onChange={(e) => handleAttributeChange(idx, 'options', e.target.value)}
                      className="flex-1 bg-[#F6F5F1]/30 border border-[#1B211D]/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#3E8F68]"
                    />
                    <button
                      type="button"
                      disabled={attributes.length === 1}
                      onClick={() => removeAttributeGroup(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))} {/* <-- DITO DAPAT NAGSASARA ANG MAP FUNCTION BAGO ANG BUTTON */}

                {/* BUTTON PARA MAGDAGDAG NG BAGONG ATTRIBUTE ROW */}
                <button
                  type="button"
                  onClick={addAttributeGroup}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#3E8F68] border border-[#3E8F68]/20 bg-[#3E8F68]/5 px-3 py-1.5 rounded-lg hover:bg-[#3E8F68]/10 transition-all select-none cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add More Attribute Type</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RENDER NG INVENTORY SECTION CARD */}
        <VariantInventorySection
          variants={variants}
          addVariantRow={addVariantRow}
          removeVariantRow={removeVariantRow}
          handleVariantChange={handleVariantChange}
        />
        {/* PREVIEW PARA SA MOBILE / TABLET (nasa side column sa desktop) */}
        <details open className="rounded-2xl border border-[#1B211D]/5 bg-white p-4 shadow-sm lg:hidden">
          <summary className="cursor-pointer select-none text-sm font-bold text-[#1B211D]">Preview bago i-save</summary>
          <div className="mt-4">
            <ProductPreviewCard {...previewProps} />
          </div>
        </details>

        {/* ACTION CONTROLLERS - SAVE BUTTON MATRIX */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-[#3E8F68] text-white font-medium px-6 py-3 rounded-xl text-sm hover:bg-[#327555] active:scale-[0.98] transition-all disabled:opacity-50 select-none shadow-sm cursor-pointer"
          >
            <Save size={16} />
            <span>{loading ? 'Writing to Supabase...' : 'Save Product & Inventory'}</span>
          </button>
        </div>

      </div>

      {/* RIGHT: LIVE PREVIEW (sticky sa desktop) */}
      <aside className="hidden self-start lg:sticky lg:top-6 lg:block">
        <ProductPreviewCard {...previewProps} />
      </aside>
    </form>
  );
}