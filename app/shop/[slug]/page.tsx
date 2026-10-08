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

        <SearchDiscoveryBar storeName={serializedStore.name} productCount={sanitizedProducts.length} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          <div className="lg:col-span-3">
            <ProductGrid 
              products={sanitizedProducts} 
              themeColor={serializedStore.themeColor} 
              bundles={activeBundles} 
              // 🌟 IPASA ANG LAHAT NG UPCOMING AT ACTIVE FLASH SALES (KASAMA ANG RULES)
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
