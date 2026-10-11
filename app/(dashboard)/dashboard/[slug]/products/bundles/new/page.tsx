 import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import BundleForm from '@/components/dashboard/products/bundles/BundleForm';

interface NewBundlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function NewBundlePage({ params }: NewBundlePageProps) {
  const { slug } = await params;

  // 1. TENANT ISOLATION FETCH: Kunin ang mga active single products ng store
  const store = await prisma.store.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      products: {
        where: { status: 'published' },
        select: {
          id: true,
          name: true,
          images: true,
          variants: {
            select: {
              id: true,
              name: true,
              price: true, // Ito ang nagdudulot ng Decimal crash runtime bug
              sku: true
            }
          }
        },
        orderBy: { name: 'asc' }
      }
    }
  });

  if (!store) return notFound();

  // 🌟 2. DATA SERIALIZATION GATEWAY: TUNAWIN ANG DECIMAL OBJECTS PATUNGONG PLAIN NUMBERS
  // Ginagawa nitong plain structures ang nested rows para maging ligtas na maipasa sa Next.js Client side execution
  const serializedProducts = store.products.map((product: any) => ({
    ...product,
    variants: product.variants.map((variant: any) => ({
      ...variant,
      price: Number(variant.price), // ➔ GINAWANG NORMAL NA NUMBER PARA MATANGGAP NG NEXT.JS CLIENT COMPONENT
    })),
  }));

  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 bg-[#F6F5F1] text-[#1B211D] min-h-screen overflow-y-auto">
      {/* BACK NAVIGATION & HEADER */}
      <div className="space-y-4 border-b border-[#1B211D]/5 pb-6">
        <Link
          href={`/dashboard/${slug}/products/bundles`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1B211D]/60 hover:text-[#1B211D] transition-colors group select-none"
        >
          <ChevronLeft size={16} className="transform group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to bundles</span>
        </Link>

        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[#1B211D]">
            Add New Product Bundle
          </h1>
          <p className="text-sm text-[#1B211D]/50">
            Configure a bulk promotion package, set a fixed package rate, and assign allowable store variants.
          </p>
        </div>
      </div>

      {/* 🌟 INAYOS: Ligtas at serialized plain object matrix na ang ipinapasa rito! */}
      <BundleForm availableProducts={serializedProducts} slug={slug} storeName={store.name} />
    </main>
  );
}
