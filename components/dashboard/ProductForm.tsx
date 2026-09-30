 // components/dashboard/ProductForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, AlertCircle } from 'lucide-react';
import BasicInfoSection from './BasicInfoSection';
import VariantInventorySection from './VariantInventorySection';

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: CategoryOption[];
  slug: string;
}

interface VariantInput {
  name: string;
  sku: string;
  price: string;
  stock: string;
}

export default function ProductForm({ categories, slug }: ProductFormProps) {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [variants, setVariants] = useState<VariantInput[]>([
    { name: 'Standard', sku: '', price: '0', stock: '0' }
  ]);

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

  // BACK-END INTEGRATION BRIGDE ENGINE: DIRECTLY TALKS TO ROUTE.TS
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    // Business Safety Rule validation
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
      // Isalansan ang pormal na framework body JSON package
      const productPayload = {
        slug,
        name,
        description,
        categoryId: categoryId || null, // Ipasa bilang null kung bago ang kategorya
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

      // Bumaril ng totoong POST query patungo sa database API layer natin
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productPayload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Server rejected database payload integration.');
      }

      // Kapag selyado na sa Supabase, ibalik ang merchant sa Main Inventory Table view listahan
      router.push(`/dashboard/${slug}/products`);
      router.refresh(); // I-refresh ang server values para lumitaw ang bagong item agad

    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong while sending to database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl animate-in fade-in duration-300">
      
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

      {/* MODULE SECTION 2 CALL */}
      <VariantInventorySection
        variants={variants}
        addVariantRow={addVariantRow}
        removeVariantRow={removeVariantRow}
        handleVariantChange={handleVariantChange}
      />

      {/* SAVE CONTROLLER ACTION BUTTON */}
      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-[#3E8F68] text-white font-medium px-6 py-3 rounded-xl text-sm hover:bg-[#327555] active:scale-[0.98] transition-all disabled:opacity-50 select-none shadow-sm cursor-pointer"
        >
          <Save size={16} />
          <span>{loading ? 'Writing to Supabase...' : 'Save Product & Inventory'}</span>
        </button>
      </div>

    </form>
  );
}
