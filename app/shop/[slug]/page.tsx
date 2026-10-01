 // app/shop/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface TenantStorefrontProps {
  params: Promise<{ slug: string }>;
}

export default async function TenantStorefrontPage({ params }: TenantStorefrontProps) {
  const { slug } = await params;

// app/shop/[slug]/page.tsx

const store = await prisma.store.findUnique({
  where: { slug: slug },
  include: {
    products: {
      // TINANGGAL NATIN ANG WHERE STATUS FILTER PARA LUMABAS KAHIT DRAFT O PUBLISHED!
      include: {
        variants: true
      }
    }
  }
});

  // 2. Kung walang tindahan, mag-404 error
  if (!store || store.status !== 'active') {
    return notFound();
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${store.backgroundPreset}`}>
      
      {/* FRONT STORE BRANDING HEADER */}
      <header className="w-full p-10 text-center border-b border-[#1B211D]/5" style={{ backgroundColor: store.themeColor }}>
        <div className="max-w-4xl mx-auto space-y-3">
          {store.logoUrl ? (
            <img src={store.logoUrl} alt={store.name} className="h-20 w-20 mx-auto rounded-full object-cover border-2 border-white shadow-xs" />
          ) : (
            <div className="h-16 w-16 mx-auto rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-lg">
              {store.name.substring(0, 2).toUpperCase()}
            </div>
          )}
          <h1 className="text-3xl font-extrabold text-white tracking-tight">{store.name}</h1>
          <p className="text-white/80 text-xs font-medium uppercase tracking-widest">Official Storefront</p>
        </div>
      </header>

      {/* PRODUCT CATALOG CONTAINER */}
      <main className="max-w-6xl mx-auto p-8 md:p-12 space-y-8">
        <h2 className="text-sm font-bold text-[#1B211D]/60 uppercase tracking-wider border-b border-[#1B211D]/5 pb-4">
          Our Products
        </h2>

        {store.products.length === 0 ? (
          <div className="text-center py-16 bg-white/40 backdrop-blur-md rounded-2xl border border-[#1B211D]/5">
            <p className="text-sm text-[#1B211D]/40 font-medium">This store hasn&apos;t published any products yet.</p>
            <p className="text-[11px] text-rose-500 mt-2 font-mono bg-rose-50 p-2 inline-block rounded-md border border-rose-100">
              💡 Tip: I-check kung ang store_id ng produkto mo sa Supabase ay nakaturo sa id na kasunod ng manipu.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {store.products.map((product) => {
              // LIGTAS NA PAGKUHA NG PRESYO MULA SA ARRAY NG VARIANTS
              const hasVariants = product.variants && product.variants.length > 0;
              const displayPrice = hasVariants ? Number(product.variants[0].price) : 0;

              // LIGTAS NA PAGKUHA NG LARAWAN MULA SA ARRAY NG IMAGES
              const hasImages = product.images && product.images.length > 0;
              const displayImage = hasImages ? product.images[0] : null;

              return (
                <div key={product.id} className="bg-white/80 backdrop-blur-md rounded-2xl border border-[#1B211D]/5 p-5 shadow-2xs flex flex-col justify-between hover:translate-y-[-2px] transition-all">
                  <div className="space-y-4">
                    <div className="bg-[#F6F5F1] w-full h-44 rounded-xl overflow-hidden relative border border-[#1B211D]/5">
                      {displayImage ? (
                        <img src={displayImage} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#1B211D]/30 font-medium">
                          No Image Uploaded
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-base text-[#1B211D] tracking-tight">{product.name}</h3>
                      {product.description && <p className="text-xs text-[#1B211D]/50 line-clamp-2">{product.description}</p>}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#1B211D]/5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#1B211D]/40">Price Starts At</span>
                    <span className="text-base font-extrabold text-[#1B211D]">
                      ₱{displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
