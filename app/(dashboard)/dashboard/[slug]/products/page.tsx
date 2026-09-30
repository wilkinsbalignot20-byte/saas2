 // app/(dashboard)/dashboard/[slug]/products/page.tsx

import Link from 'next/link';
import { PlusCircle, Package } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import ProductTable from '@/components/dashboard/ProductTable';

interface ProductsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function MerchantProductsPage({ params }: ProductsPageProps) {
  const { slug } = await params;

  // 1. Hatakin ang mga produkto mula sa database gamit ang Prisma
  const rawProducts = await prisma.product.findMany({
    where: {
      store: {
        slug: slug,
      },
    },
    include: {
      category: {
        select: {
          name: true,
        },
      },
      variants: {
        select: {
          id: true,
          sku: true,
          price: true,
          stock: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // 2. DATA SERIALIZATION GATEWAY: DITO NATIN AAYUSIN ANG DECIMAL ERROR
  // Ginagawa nating plain JavaScript object ang data at sine-serialize ang Decimal fields patungong Number
  const products = rawProducts.map((product) => ({
    ...product,
    variants: product.variants.map((variant) => ({
      ...variant,
      price: Number(variant.price), // ➔ GINAWANG NORMAL NA NUMBER PARA TANGGAPIN NG NEXT.JS CLIENT
    })),
  }));

  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 bg-[#F6F5F1] text-[#1B211D] min-h-screen overflow-y-auto">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1B211D]/5 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[#1B211D]">
            Products Inventory
          </h1>
          <p className="text-sm text-[#1B211D]/50">
            Manage your store variants, track SKUs, and view stock levels.
          </p>
        </div>

        <Link
          href={`/dashboard/${slug}/products/new`}
          className="inline-flex items-center gap-2 bg-[#3E8F68] text-white font-medium px-4 py-2.5 rounded-xl text-sm hover:bg-[#327555] active:scale-[0.98] transition-all select-none shadow-sm cursor-pointer"
        >
          <PlusCircle size={16} />
          <span>Add Product</span>
        </Link>
      </div>

      {/* CONDITIONAL RENDER */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#1B211D]/10 rounded-2xl p-16 text-center bg-white/50">
          <div className="h-12 w-12 rounded-xl bg-[#3E8F68]/10 flex items-center justify-center text-[#3E8F68] mb-4">
            <Package size={24} />
          </div>
          <h3 className="text-md font-semibold text-[#1B211D]">No products found</h3>
          <p className="text-sm text-[#1B211D]/40 max-w-sm mt-1 mb-6">
            Your inventory is currently empty. Start uploading your products to display them on your storefront.
          </p>
          <Link
            href={`/dashboard/${slug}/products/new`}
            className="text-sm font-medium text-[#3E8F68] hover:underline"
          >
            Create your first product →
          </Link>
        </div>
      ) : (
        /* MATAGUMPAY AT LIGTAS NANG IPAPASA ANG SERIALIZED PLAIN OBJECTS ARRAY */
        <ProductTable products={products} slug={slug} />
      )}
    </main>
  );
}
