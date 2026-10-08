 // app/shop/[slug]/page.tsx

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

import StorefrontHeader from '@/components/marketplace/shop/StorefrontHeader';
import SearchDiscoveryBar from '@/components/marketplace/shop/SearchDiscoveryBar';
import ProductGrid from '@/components/marketplace/shop/ProductGrid';
import MarketingSidebar from '@/components/marketplace/shop/MarketingSidebar';
import StorePerks from '@/components/marketplace/shop/StorePerks';
import StorefrontFooter from '@/components/marketplace/shop/StorefrontFooter';
import FlashSaleBanner from '@/components/marketplace/shop/marketing/FlashSaleBanner';

interface TenantStorefrontProps {
  params: Promise<{ slug: string }>;
}

export default async function TenantStorefrontPage({ params }: TenantStorefrontProps) {
  const { slug } = await params;

  const storeData = await prisma.store.findUnique({
    where: { slug: slug },
    include: {
      products: {
        include: {
          variants: true
        }
      },
      vouchers: {
        where: {
          isActive: true
        }
      },
      campaigns: {
        include: {
          rules: true // 🌟 Siguraduhing kasama ang rules sa paghatak mula sa DB
        }
      }
    }
  });

  if (!storeData || storeData.status !== 'active') {
    return notFound();
  }

  const serializedStore = JSON.parse(JSON.stringify(storeData));

  const sanitizedProducts = serializedStore.products?.map((product: any) => ({
    ...product,
    variants: product.variants?.map((variant: any) => ({
      ...variant,
      price: variant.price ? Number(variant.price) : 0, 
    })) || [],
  })) || [];

  const sanitizedVouchers = (serializedStore.vouchers || []).map((voucher: any) => {
    const rawType = String(voucher.discountType || "").toLowerCase();
    const cleanType = rawType === "percentage" ? "percentage" : "fixed";

    return {
      ...voucher,
      discountType: cleanType,
      discountValue: voucher.discountValue ? Number(voucher.discountValue) : 0,
      minSpend: voucher.minSpend ? Number(voucher.minSpend) : undefined,
    };
  });

  const allCampaigns = serializedStore.campaigns || [];

  const upcomingOrActiveCampaigns = allCampaigns.filter(
    (c: any) => c.status === "ACTIVE" || c.status === "UPCOMING"
  );

  // ⚡ PINALAKAS NA FLASH SALES DISCOVERY LAYER:
  // Kukuha tayo ng pinakamataas na discount value mula sa mga rules para sa banner display
  const activeFlashSales = upcomingOrActiveCampaigns
    .filter((c: any) => c.type === 'FLASH_SALE' || c.type === 'THREE_DAY_SALE')
    .map((c: any) => {
      const rules = c.rules || [];
      // Hanapin ang rule na may pinakamataas na discount value para sa "Up to X% OFF" label
      const maxDiscountRule = rules.reduce((max: any, current: any) => {
        return (Number(current.discountValue) > Number(max.discountValue || 0)) ? current : max;
      }, { discountValue: 0, discountType: 'PERCENTAGE' });

      return {
        ...c,
        endTime: c.endDate, 
        discountValue: Number(maxDiscountRule.discountValue) || 0, 
        discountType: String(maxDiscountRule.discountType || 'PERCENTAGE').toLowerCase() === 'fixed' ? 'fixed' : 'percentage'
      };
    });

  const activeBundles = upcomingOrActiveCampaigns.filter(
    (c: any) => c.type === 'BUNDLE' || c.type === 'BUY_1_TAKE_1'
  );

  serializedStore.products = sanitizedProducts;
  serializedStore.vouchers = sanitizedVouchers;

  return (
    <div className={`min-h-screen ${serializedStore.backgroundPreset}`}>
      <StorefrontHeader store={serializedStore} />

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-8 space-y-6">
        <StorePerks />

        {activeFlashSales.length > 0 && (
          <FlashSaleBanner flashSales={activeFlashSales} themeColor={serializedStore.themeColor} />
        )}

        {/* 🛡️ MARKETPLACE ADD-ON LAYOUT: Eksklusibong Combo Pack display para sa Package Bundles */}
        {activeBundles.filter((b: any) => b.type === 'BUNDLE').length > 0 && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900 tracking-tight">🔥 Featured Bundle Combo Packs</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBundles
                .filter((b: any) => b.type === 'BUNDLE')
                .map((bundle: any) => {
                  // Matalinong paghihiwalay sa delimiter ng Cloudinary image at malinis na pangalan
                  const [cleanName, imageUrl] = bundle.name.split("||IMAGE||");
                  return (
                    <div key={bundle.id} className="flex flex-col sm:flex-row gap-4 border border-slate-100 bg-slate-50/50 rounded-xl p-4 transition hover:shadow-xs group">
                      {imageUrl && (
                        <div className="w-full sm:w-32 h-24 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                          <img src={imageUrl} alt={cleanName} className="w-full h-full object-cover group-hover:scale-105 transition duration-200" />
                        </div>
                      )}
                      <div className="flex flex-col justify-between flex-1 space-y-2">
                        <div className="space-y-1">
                          <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10 w-fit">
                            Package Bundle Deal
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 leading-tight">{cleanName}</h4>
                          <p className="text-xs text-slate-400">Bumili ng set para sa mas malaking bawas-presyo!</p>
                        </div>
                        <button
                          type="button"
                          style={{ backgroundColor: serializedStore.themeColor }}
                          className="w-full sm:w-fit px-3 py-1.5 rounded-lg text-white font-bold text-xs shadow-2xs hover:opacity-90 transition cursor-pointer"
                        >
                          View Combo Pack
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        <SearchDiscoveryBar storeName={serializedStore.name} productCount={sanitizedProducts.length} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          <div className="lg:col-span-3">
            <ProductGrid 
              products={sanitizedProducts} 
              themeColor={serializedStore.themeColor} 
              bundles={activeBundles} 
              flashSales={upcomingOrActiveCampaigns.filter((c: any) => c.type === 'FLASH_SALE' || c.type === 'THREE_DAY_SALE')} 
            />
          </div>

          <aside className="lg:col-span-1 lg:sticky lg:top-6">
            <MarketingSidebar store={serializedStore} vouchers={sanitizedVouchers} />
          </aside>
          
        </div>
      </main>

      <StorefrontFooter storeName={serializedStore.name} />
    </div>
  );
}


