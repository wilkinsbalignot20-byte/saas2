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
import PremiumHeroBoostBanner from '@/components/marketplace/shop/marketing/PremiumHeroBoostBanner';

// 💡 DISKARTE: Mag-import ng Slider/Grid components para sa ad structures mo mamaya kung mayroon na
// import HeroCarouselWidget from '@/components/marketplace/shop/marketing/HeroCarouselWidget';

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
          rules: true 
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

  // 🛡️ MATALINONG FILTERS:
  const currentDate = new Date();

  const upcomingOrActiveCampaigns = allCampaigns.filter((c: any) => {
    const isBasicActive = c.status === "ACTIVE" || c.status === "UPCOMING";
    return isBasicActive;
  });

  // ⚡ 1. FILTERS AT SANITIZER PARA SA HERO CAROUSEL AD SPOT (Nilagyan ng .map upang maayos ang NaN at undefined)
  const heroCarouselBoosts = upcomingOrActiveCampaigns
    .filter((c: any) => 
      c.isPremiumBoosted && 
      c.boostedSlotType === "HERO_CAROUSEL" &&
      c.boostedUntil && new Date(c.boostedUntil) > currentDate
    )
    .map((c: any) => {
      const rules = c.rules || [];
      const maxDiscountRule = rules.reduce((max: any, current: any) => {
        return (Number(current.discountValue) > Number(max.discountValue || 0)) ? current : max;
      }, { discountValue: 0, discountType: 'PERCENTAGE' });

      return {
        ...c,
        endTime: c.endDate, // 👈 MAHALAGA: Ito ang lunas sa NaN timer bug!
        discountValue: Number(maxDiscountRule.discountValue) || 0, 
        discountType: String(maxDiscountRule.discountType || 'PERCENTAGE').toLowerCase() === 'fixed' ? 'fixed' : 'percentage'
      };
    });

  // ⚡ 2. FILTERS AT SANITIZER PARA SA HOT DEALS GRID AD SPOT
  const hotDealsGridBoosts = upcomingOrActiveCampaigns
    .filter((c: any) => 
      c.isPremiumBoosted && 
      c.boostedSlotType === "HOT_DEALS_GRID" &&
      c.boostedUntil && new Date(c.boostedUntil) > currentDate
    )
    .map((c: any) => {
      const rules = c.rules || [];
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

  // Panatilihin ang iyong umiiral na Flash Sales map logic para sa standard banner layout
  const activeFlashSales = upcomingOrActiveCampaigns
    .filter((c: any) => c.type === 'FLASH_SALE' || c.type === 'THREE_DAY_SALE')
    .map((c: any) => {
      const rules = c.rules || [];
      const maxDiscountRule = rules.reduce((max: any, current: any) => {
        return (Number(current.discountValue) > Number(max.discountValue || 0)) ? current : max;
      }, { discountValue: 0, discountType: 'PERCENTAGE' });

      return {
        ...c,
        endTime: c.endDate, 
        discountValue: Number(maxDiscountRule.discountValue) || 0, 
        discountType: String(maxDiscountRule.discountType || 'PERCENTAGE').toLowerCase() === 'fixed' ? 'fixed' : 'percentage',
        isBoostedNow: c.isPremiumBoosted && c.boostedUntil && new Date(c.boostedUntil) > currentDate
      };
    })
    .sort((a: any, b: any) => (b.isBoostedNow ? 1 : 0) - (a.isBoostedNow ? 1 : 0));

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

        {/* 🌟 PREMIUM FEATURE ADD-ON: HERO CAROUSEL SLOT */}
        {/* 🌟 PREMIUM FEATURE ADD-ON: HERO CAROUSEL SLOT WITH REACTBITS 3D DEPTH EFFECT */}
        {heroCarouselBoosts.length > 0 && (
          <PremiumHeroBoostBanner boosts={heroCarouselBoosts} themeColor={serializedStore.themeColor} />
        )}

        {/* STANDARD PLACEMENT: Lalabas lang kung walang active na high-tier Hero Carousel boost */}
        {heroCarouselBoosts.length === 0 && activeFlashSales.length > 0 && (
          <FlashSaleBanner flashSales={activeFlashSales} themeColor={serializedStore.themeColor} />
        )}


        {/* 🌟 PREMIUM FEATURE ADD-ON: HOT DEALS GRID DISPLAY */}
        {hotDealsGridBoosts.length > 0 && (
          <div className="p-6 rounded-2xl border bg-white space-y-4 shadow-sm" style={{ borderColor: `${serializedStore.themeColor}40` }}>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                🔥 Hot Trending Deals
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md text-amber-700 bg-amber-50 ring-1 ring-amber-600/10">
                Top Traffic
              </span>
            </div>
            {/* Dito mo itatapon ang mga paninda o produktong kasama sa Hot Deals grid placement */}
            <div className="text-sm text-slate-500 italic">
              Naka-boost ngayon: {hotDealsGridBoosts.map((b: any) => b.name).join(", ")}
            </div>
          </div>
        )}
 
        {/* BUNDLE PACKS LAYOUT */}
        {activeBundles.filter((b: any) => b.type === 'BUNDLE').length > 0 && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900 tracking-tight">🔥 Featured Bundle Combo Packs</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBundles
                .filter((b: any) => b.type === 'BUNDLE')
                .map((bundle: any) => {
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

