'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, Loader2, Save, Trash2 } from 'lucide-react';

interface VariantInfo {
  id: string;
  name: string;
  price: any; // Binago para tanggapin ang Decimal object ng Prisma
  sku: string;
}

interface ProductInfo {
  id: string;
  name: string;
  images: string[]; // Ginawang string array
  variants: VariantInfo[]; // Idinagdag ang array marker []
}

interface BundleFormProps {
  availableProducts: ProductInfo[]; // Idinagdag ang array marker []
  slug: string;
  storeName: string;
  initialData?: any;
}

export default function BundleForm({ availableProducts, slug, storeName, initialData }: BundleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. BASIC FORM STATES FOR BUNDLE
  const [name, setName] = useState(initialData?.name || '');
  const [quantity, setQuantity] = useState(initialData?.quantity?.toString() || '3');
  const [price, setPrice] = useState(initialData?.price?.toString() || '0.00');
  const [imageUrl, setImageUrl] = useState<string>(initialData?.images?.[0] || '');

  // 2. PRODUCT PICKER CHECKLIST STATE (Array ng mga Product IDs na isasama sa Bundle)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    initialData?.productIds || []
  );

  // Function para i-toggle ang pagpili sa checklist block matrix
  const handleToggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Mock upload hook helper (I-replace ito mamaya gamit ang iyong CldUploadWidget o dynamic uploader workflow)
  const handleUploadGroupPhoto = () => {
    const mockUrl = prompt("Paki-paste muna ang image URL para sa group photo ng iyong Bundle package:");
    if (mockUrl) setImageUrl(mockUrl);
  };

  // 3. FRONTEND SUBMIT DISPATCH LAYER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please provide a valid bundle package promotion title.');
      setLoading(false);
      return;
    }

    if (selectedProductIds.length === 0) {
      setErrorMessage('Please check and select at least one individual product item to group into this bundle.');
      setLoading(false);
      return;
    }

    try {
      // Dito natin ipadadala ang data sa bagong isolated bundles endpoint controller natin mamaya
      const apiUrl = initialData?.id 
        ? `/api/stores/${slug}/products/bundles/${initialData.id}`
        : `/api/stores/${slug}/products/bundles`;

      const method = initialData?.id ? 'PATCH' : 'POST';

      const res = await fetch(apiUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          quantity: parseInt(quantity, 10) || 1,
          price: parseFloat(price) || 0,
          images: imageUrl ? [imageUrl] : [],
          productIds: selectedProductIds, // Ipinapasa ang array ng mga naka-tag na inventory items
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Server rejected bundle configuration data sync.');
      }

      router.push(`/dashboard/${slug}/products/bundles`);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong while saving the wholesale package bundle.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid max-w-5xl gap-8 lg:grid-cols-[1fr_320px]">
      
      {/* KALIWA: INPUT FIELDS AND SELECTION MATRICES */}
      <div className="space-y-8 min-w-0">
        
        {/* BANNER FOR FORM ERROR CONTROL VALIDATION */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium animate-in fade-in duration-200">
            {errorMessage}
          </div>
        )}

        {/* 📦 STEP A: BASIC DETAILS CONTROL BOX PANEL */}
        <div className="rounded-2xl border border-[#1B211D]/5 bg-white p-6 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-[#1B211D] border-b border-[#1B211D]/5 pb-3">
            Bundle Promotion Criteria
          </h2>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1B211D]/60">Bundle Package Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Ultimate Flavor Trio Pack, Buy 5 promo mix"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#1B211D]/10 bg-transparent placeholder-[#1B211D]/30 focus:border-[#1B211D] outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1B211D]/60">Required Quantity (Pcs)</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="3"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#1B211D]/10 bg-transparent focus:border-[#1B211D] outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1B211D]/60">Wholesale Package Price</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-[#1B211D]/40 text-sm font-semibold select-none">₱</span>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2.5 text-sm rounded-xl border border-[#1B211D]/10 bg-transparent focus:border-[#1B211D] outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 🎯 STEP B: THE KULANG LAYER - PRODUCT CHECKLIST MATRIX PICKER */}
        <div className="rounded-2xl border border-[#1B211D]/5 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#1B211D]">Tag Included Catalog Inventory</h2>
            <p className="text-xs text-[#1B211D]/50 mt-0.5">
              Check all the active storefront single products that can be selected or included in this wholesale group bundle pack.
            </p>
          </div>

          {availableProducts.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-[#1B211D]/10 rounded-xl bg-[#F6F5F1]/30">
              <p className="text-sm text-[#1B211D]/40 font-medium">No active storefront products available to group.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 max-h-[350px] overflow-y-auto pr-2">
              {availableProducts.map((product) => {
                const isChecked = selectedProductIds.includes(product.id);
                return (
                  <div
                    key={product.id}
                    onClick={() => handleToggleProduct(product.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer select-none transition-all ${
                      isChecked
                        ? 'border-[#1B211D] bg-[#1B211D]/5 ring-1 ring-[#1B211D]'
                        : 'border-[#1B211D]/10 hover:border-[#1B211D]/30 bg-transparent'
                    }`}
                  >
                    {/* CUSTOM CHECKBOX LAYER INDICATOR */}
                    <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                      isChecked ? 'bg-[#1B211D] border-[#1B211D]' : 'border-[#1B211D]/20'
                    }`}>
                      {isChecked && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#1B211D] truncate">{product.name}</p>
                      <p className="text-xs text-[#1B211D]/40 truncate">
                        {product.variants?.length || 0} active variations linked
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CONTROLLER ACTION FORM DISPATCH FOOTER */}
        <div className="flex items-center justify-end gap-4 border-t border-[#1B211D]/5 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-[#1B211D] hover:bg-[#1B211D]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all select-none shadow-sm"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{initialData?.id ? 'Update Package Bundle' : 'Save Package Bundle'}</span>
          </button>
        </div>

      </div>

      {/* KANAN: GROUP PHOTO PREVIEW ASSET SELECTION BOARD */}
      <aside className="space-y-6 lg:sticky lg:top-6 self-start">
        <div className="rounded-2xl border border-[#1B211D]/5 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B211D]/60">Bundle Group Photo</h3>
          
          {imageUrl ? (
            <div className="relative aspect-square w-full rounded-xl border border-[#1B211D]/10 overflow-hidden group">
              <img 
                src={imageUrl} 
                alt="Bundle Preview" 
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl text-white font-semibold text-xs gap-1.5"
              >
                <Trash2 size={14} />
                <span>Remove Photo</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleUploadGroupPhoto}
              className="flex flex-col items-center justify-center gap-2 w-full aspect-square rounded-xl border border-dashed border-[#1B211D]/20 bg-[#F6F5F1]/50 hover:bg-[#F6F5F1] hover:border-[#1B211D]/40 transition-all select-none group"
            >
              <div className="p-3 rounded-xl bg-white border border-[#1B211D]/5 text-[#1B211D]/60 group-hover:text-[#1B211D] group-hover:scale-105 transition-all shadow-sm">
                <ImagePlus size={20} />
              </div>
              <span className="text-xs font-bold text-[#1B211D]/60 group-hover:text-[#1B211D]">Upload Promo Picture</span>
            </button>
          )}

          <p className="text-[11px] text-[#1B211D]/40 leading-relaxed">
            Separate upload instance for promotional multi-flavor packs or mix-match deals display.
          </p>
        </div>
      </aside>

    </form>
  );
}
