 // components/marketplace/shop/ProductGrid.tsx
'use client';

import { ShoppingBag } from 'lucide-react';

interface ProductVariant {
  id: string;
  price: any;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  variants: ProductVariant[];
}

interface BundleCampaign {
  id: string;
  name: string;
  productId: string;
  bundleType: 'bogo' | 'combo' | 'package';
  promoLabel?: string;
}

interface ProductGridProps {
  products: Product[];
  themeColor: string;
  bundles?: BundleCampaign[];
}

export default function ProductGrid({ products, themeColor, bundles = [] }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-[#1B211D]/15">
        <p className="font-semibold text-[#1B211D]">Wala pang produkto</p>
        <p className="text-sm text-[#1B211D]/50 mt-1">Balik ka ulit mamaya, may paparating na!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      {products.map((product) => {
        const hasVariants = product.variants && product.variants.length > 0;
        const displayPrice = hasVariants ? Number(product.variants[0].price) : 0;
        const displayImage = product.images && product.images.length > 0 ? product.images[0] : null;

        const matchingBundle = bundles.find((b) => b.productId === product.id);

        return (
          <article
            key={product.id}
            className="group flex flex-col bg-white rounded-2xl border border-[#1B211D]/10 overflow-hidden hover:shadow-lg transition-all relative"
          >
            <div className="h-1" style={{ backgroundColor: themeColor }} />

            {/* IMAGE WRAPPER AREA */}
            <div className="aspect-[4/3] bg-[#F6F5F1] overflow-hidden relative">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-[#1B211D]/30">
                  No image
                </div>
              )}

              {/* ========================================================================= */}
              {/* ✅ MAAYOS NA BUNDLE / BOGO PROMO BADGE OVERLAY (Linyang Itinama) */}
              {/* ========================================================================= */}
              {matchingBundle && (
                <div className="absolute top-2 right-2 z-10 animate-in fade-in zoom-in-95 duration-200">
                  <span 
                    className="text-[9px] font-black uppercase tracking-wider text-white px-2 py-1 rounded-md shadow-sm flex items-center gap-1 backdrop-blur-xs"
                    style={{ backgroundColor: themeColor }}
                  >
                    <ShoppingBag size={10} />
                    {matchingBundle.promoLabel || (matchingBundle.bundleType === 'bogo' ? 'BUY 1 TAKE 1' : 'BUNDLE DEAL')}
                  </span>
                </div>
              )}
            </div>

            {/* DETAILS CONTAINER */}
            <div className="flex flex-1 flex-col p-4">
              <h3 className="font-semibold leading-snug text-[#1B211D]">{product.name}</h3>
              {product.description && (
                <p className="mt-1 text-sm text-[#1B211D]/55 line-clamp-2">{product.description}</p>
              )}

              <div className="mt-auto pt-4 flex items-baseline justify-between">
                <span className="text-xs text-[#1B211D]/45">
                  {product.variants.length > 1 ? 'From' : 'Price'}
                </span>
                <span className="text-lg font-bold tracking-tight text-[#1B211D]">
                  ₱{displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <button
                type="button"
                className="mt-4 w-full rounded-lg py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] cursor-pointer"
                style={{ backgroundColor: themeColor }}
              >
                Add to cart
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
