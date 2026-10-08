 // components/marketplace/shop/ProductGrid.tsx
'use client';

import { ShoppingBag, Zap } from 'lucide-react';

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
  flashSales?: any[]; // Tinatanggap ang flash sale array kasama ang rules nito
}

export default function ProductGrid({ products, themeColor, bundles = [], flashSales = [] }: ProductGridProps) {
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
        const originalPrice = hasVariants ? Number(product.variants[0].price) : 0;
        const displayImage = product.images && product.images.length > 0 ? product.images[0] : null;

        const matchingBundle = bundles.find((b) => b.productId === product.id);

        // =========================================================================
        // ⚡ FLASH SALE DISCOUNT LOGIC
        // =========================================================================
        let finalPrice = originalPrice;
        let hasDiscount = false;
        let discountLabel = '';

        // Mag-loop sa lahat ng aktibong flash sales para hanapin kung kasali ang produktong ito
        for (const sale of flashSales) {
          if (sale.rules && Array.isArray(sale.rules)) {
            const matchingRule = sale.rules.find((rule: any) => rule.productId === product.id);
            
            if (matchingRule) {
              hasDiscount = true;
              const dType = String(matchingRule.discount_type || matchingRule.discountType).toUpperCase();
              const dValue = Number(matchingRule.discountValue);

              // Kung may naka-set na promo price, gamitin ito nang direkta
              if (matchingRule.promoPrice) {
                finalPrice = Number(matchingRule.promoPrice);
                discountLabel = 'SALE';
              } else if (dType === 'PERCENTAGE') {
                finalPrice = originalPrice - (originalPrice * (dValue / 100));
                discountLabel = `-${dValue}%`;
              } else if (dType === 'FIXED') {
                finalPrice = originalPrice - dValue;
                discountLabel = `₱${dValue} OFF`;
              }
              break;
            }
          }
        }

        if (finalPrice < 0) finalPrice = 0;

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

              {/* ⚡ FLASH SALE BADGE */}
              {hasDiscount && (
                <div className="absolute top-2 left-2 z-10 animate-in fade-in zoom-in-95 duration-200">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white px-2 py-1 rounded-md shadow-sm flex items-center gap-0.5">
                    <Zap size={10} fill="white" className="text-amber-200" />
                    {discountLabel}
                  </span>
                </div>
              )}

              {/* BUNDLE / BOGO PROMO BADGE OVERLAY */}
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

              {/* ⚡ SLASH PRICE PRICE CONTAINER */}
              <div className="mt-auto pt-4 flex items-baseline justify-between gap-2">
                <span className="text-xs text-[#1B211D]/45 shrink-0">
                  {product.variants.length > 1 ? 'From' : 'Price'}
                </span>
                
                <div className="flex flex-wrap items-baseline justify-end gap-x-2">
                  {hasDiscount && (
                    <span className="text-sm font-medium line-through text-slate-400">
                      ₱{originalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  )}
                  <span className="text-lg font-bold tracking-tight text-[#1B211D]">
                    ₱{finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
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
