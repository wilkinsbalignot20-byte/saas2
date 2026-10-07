 // app/shop/[slug]/page.tsx

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

// MGA KASALUKUYANG IMPORTS MO
import StorefrontHeader from '@/components/marketplace/shop/StorefrontHeader';
import SearchDiscoveryBar from '@/components/marketplace/shop/SearchDiscoveryBar';
import ProductGrid from '@/components/marketplace/shop/ProductGrid';
import MarketingSidebar from '@/components/marketplace/shop/MarketingSidebar';
import StorePerks from '@/components/marketplace/shop/StorePerks';
import StorefrontFooter from '@/components/marketplace/shop/StorefrontFooter';

// FLASH SALE COMPONENT IMPORT
import FlashSaleBanner from '@/components/marketplace/shop/marketing/FlashSaleBanner';

interface TenantStorefrontProps {
  params: Promise<{ slug: string }>;
}

export default async function TenantStorefrontPage({ params }: TenantStorefrontProps) {
  const { slug } = await params;

  // 1. ISABAY SA PAGHATAK ANG MGA PROMO TABLES BASE SA REAL SCHEMA MO
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
      campaigns: true 
    }
  });

  if (!storeData || storeData.status !== 'active') {
    return notFound();
  }

  // ✅ OVERRIDE TYPE BLOCK: Sinasabihan ang TypeScript na ligtas basahin ang mga properties
  const store = storeData as any;

  // 2. CONVERT DECIMAL TO NUMBER PARA SA MGA PRODUKTO AT VARIANTS
  const sanitizedProducts = store.products?.map((product: any) => ({
    ...product,
    variants: product.variants?.map((variant: any) => ({
      ...variant,
      price: variant.price ? Number(variant.price) : 0, 
    })) || [],
  })) || [];

  // 3. SANITIZE VOUCHERS: Ginagawang Numbers ang Decimal fields (discountValue, minSpend)
  const sanitizedVouchers = (store.vouchers || []).map((voucher: any) => ({
    ...voucher,
    discountValue: voucher.discountValue ? Number(voucher.discountValue) : 0,
    minSpend: voucher.minSpend ? Number(voucher.minSpend) : undefined,
  }));

  // 4. JAVASCRIPT-SIDE PROMO FILTER MANAGEMENT (Safe and Stable)
  const allCampaigns = store.campaigns || [];

  // Sinasala ang marketing array campaigns gamit ang text string types
  const activeFlashSales = allCampaigns.filter((c: any) => c.type === 'flash_sale' || c.campaignType === 'flash_sale');
  const activeBundles = allCampaigns.filter((c: any) => c.type === 'bundle' || c.campaignType === 'bundle');

  // 5. I-UPDATE ANG BUONG `store` OBJECT PARA TULUYANG MALINIS MULA SA DECIMAL OBJECTS
  // Ito ay para siguradong ligtas kapag ipinasa ang `store` object sa kahit anong Client Component
  const sanitizedStore = {
    ...store,
    products: sanitizedProducts,
    vouchers: sanitizedVouchers,
    campaigns: JSON.parse(JSON.stringify(allCampaigns)) // Siguradong plain objects din ang mga campaigns
  };

  return (
    <div className={`min-h-screen ${sanitizedStore.backgroundPreset}`}>
      {/* ZONE 1: ASYMMETRICAL HEADER COVER */}
      <StorefrontHeader store={sanitizedStore} />

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-8 space-y-6">
        {/* TRUST ACCENTS WIDGET */}
        <StorePerks />

        {/* ========================================================================= */}
        {/* [MARKETING ZONE]: FLASH SALE TICKING BANNER CHUB */}
        {/* ========================================================================= */}
        {activeFlashSales.length > 0 && (
          <FlashSaleBanner flashSales={activeFlashSales} themeColor={sanitizedStore.themeColor} />
        )}

        {/* ZONE 2: SEARCH DISCOVERY ENTRY */}
        <SearchDiscoveryBar storeName={sanitizedStore.name} productCount={sanitizedProducts.length} />

        {/* TWO-COLUMN CONTENT GRID SECTOR */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* ZONE 3: PRODUCT GRID (Kaliwang Bahagi) */}
          <div className="lg:col-span-3">
            <ProductGrid 
              products={sanitizedProducts} 
              themeColor={sanitizedStore.themeColor} 
              bundles={activeBundles} 
            />
          </div>

          {/* ZONE 4: MARKETING SIDEBAR (Kanang Sticky Column) */}
          <aside className="lg:col-span-1 lg:sticky lg:top-6">
            {/* ✅ FIXED: Malinis na at purong numbers/plain objects na ang ipinapasa rito */}
            <MarketingSidebar store={sanitizedStore} vouchers={sanitizedVouchers} />
          </aside>
          
        </div>
      </main>

      {/* FOOTER MATRIX */}
      <StorefrontFooter storeName={sanitizedStore.name} />
    </div>
  );
}
