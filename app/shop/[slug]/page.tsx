 // app/shop/[slug]/page.tsx

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

// MGA IMPORTS NG IYONG MGA COMPONENTS
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

  // 1. ISABAY SA PAGHATAK ANG MGA PROMO TABLES AT MARKETING CAMPAIGNS MULA SA DATABASE
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
          isActive: true // Lumalabas lang sa storefront ang mga naka-activate na voucher sa dashboard
        }
      },
      campaigns: true // Hinahatak ang mga Flash Sales, 3-Day Sales, BOGO, at Package Bundles
    }
  });

  if (!storeData || storeData.status !== 'active') {
    return notFound();
  }

  // 2. SERIALIZATION LAYER: Ginagawang plain objects ang buong tugon ng database
  // para mapatay ang "Decimal objects are not supported" crash boundary ng Next.js
  const serializedStore = JSON.parse(JSON.stringify(storeData));

  // 3. PRODUCT & VARIANT PROCESSING
  const sanitizedProducts = serializedStore.products?.map((product: any) => ({
    ...product,
    variants: product.variants?.map((variant: any) => ({
      ...variant,
      price: variant.price ? Number(variant.price) : 0, 
    })) || [],
  })) || [];

  // 4. VOUCHER MAPPING & LOWERCASE CONVERSION (Para tanggapin ng interface ng MarketingSidebar)
  const sanitizedVouchers = (serializedStore.vouchers || []).map((voucher: any) => {
    // Kinoconvert ang "PERCENTAGE" -> "percentage" at "FIXED" -> "fixed" para pumasok sa logic ng sidebar
    const rawType = String(voucher.discountType || "").toLowerCase();
    const cleanType = rawType === "percentage" ? "percentage" : "fixed";

    return {
      ...voucher,
      discountType: cleanType,
      discountValue: voucher.discountValue ? Number(voucher.discountValue) : 0,
      minSpend: voucher.minSpend ? Number(voucher.minSpend) : undefined,
    };
  });

  // 5. CAMPAIGNS FILTER MATRIX (Tugma sa FlashSale at Bundle Management Tabs)
  const allCampaigns = serializedStore.campaigns || [];

  // Sinasala ang mga campaigns na hindi pa tapos (Active at Upcoming)
  const upcomingOrActiveCampaigns = allCampaigns.filter(
    (c: any) => c.status === "ACTIVE" || c.status === "UPCOMING"
  );

  // ⚡ FLASH SALES DISCOVERY LAYER: I-map ang `endDate` patungong `endTime` para sa countdown timer component
  const activeFlashSales = upcomingOrActiveCampaigns
    .filter((c: any) => c.type === 'FLASH_SALE' || c.type === 'THREE_DAY_SALE')
    .map((c: any) => ({
      ...c,
      endTime: c.endDate, 
      discountValue: c.discountValue || 0, 
      discountType: String(c.discountType || 'PERCENTAGE').toLowerCase() === 'fixed' ? 'fixed' : 'percentage'
    }));

  // 📦 BUNDLES & BOGO DISCOVERY LAYER
  const activeBundles = upcomingOrActiveCampaigns.filter(
    (c: any) => c.type === 'BUNDLE' || c.type === 'BUY_1_TAKE_1'
  );

  // Inia-align ang pinal na memory payload ng store bago ipamahagi sa mga sub-components
  serializedStore.products = sanitizedProducts;
  serializedStore.vouchers = sanitizedVouchers;

  return (
    <div className={`min-h-screen ${serializedStore.backgroundPreset}`}>
      {/* ZONE 1: ASYMMETRICAL HEADER COVER */}
      <StorefrontHeader store={serializedStore} />

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-8 space-y-6">
        {/* TRUST ACCENTS WIDGET */}
        <StorePerks />

        {/* [MARKETING ZONE]: Dynamic Flash & 3-Day Sales Banner Tracker */}
        {activeFlashSales.length > 0 && (
          <FlashSaleBanner flashSales={activeFlashSales} themeColor={serializedStore.themeColor} />
        )}

        {/* ZONE 2: SEARCH DISCOVERY ENTRY */}
        <SearchDiscoveryBar storeName={serializedStore.name} productCount={sanitizedProducts.length} />

        {/* TWO-COLUMN CONTENT GRID SECTOR */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* ZONE 3: PRODUCT GRID (Awtomatikong kumakarga ng BOGO at Package Bundles sa UI ng mamimili) */}
          <div className="lg:col-span-3">
            <ProductGrid 
              products={sanitizedProducts} 
              themeColor={serializedStore.themeColor} 
              bundles={activeBundles} 
            />
          </div>

          {/* ZONE 4: MARKETING SIDEBAR (Awtomatikong nagpapakita ng mga Claimable Vouchers) */}
          <aside className="lg:col-span-1 lg:sticky lg:top-6">
            <MarketingSidebar store={serializedStore} vouchers={sanitizedVouchers} />
          </aside>
          
        </div>
      </main>

      {/* FOOTER MATRIX */}
      <StorefrontFooter storeName={serializedStore.name} />
    </div>
  );
}
