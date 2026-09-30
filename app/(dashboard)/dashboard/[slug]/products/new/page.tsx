// app/(dashboard)/dashboard/[slug]/products/new/page.tsx

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import ProductForm from '@/components/dashboard/ProductForm';

interface NewProductPageProps {
  params: Promise<{ slug: string }>;
}

// SINISIGURONG MAY "export default" AT ARQUITECTURANG ASYNC SERVER
export default async function NewProductPage({ params }: NewProductPageProps) {
  // 1. Kunin ang active store slug mula sa URL parameters
  const { slug } = await params;

  // 2. BACK-END LOGIC: Hatakin ang mga kategorya ng tindahang ito mula sa database
  // Ito ay para may mapiling kategorya ang merchant sa dropdown select ng form mamaya
  const categories = await prisma.category.findMany({
    where: {
      store: {
        slug: slug,
      },
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 bg-[#F6F5F1] text-[#1B211D] min-h-screen overflow-y-auto">
      {/* BACK NAVIGATION & HEADER */}
      <div className="space-y-4 border-b border-[#1B211D]/5 pb-6">
        <Link
          href={`/dashboard/${slug}/products`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1B211D]/60 hover:text-[#1B211D] transition-colors group select-none"
        >
          <ChevronLeft size={16} className="transform group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to products</span>
        </Link>

        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[#1B211D]">
            Add New Product
          </h1>
          <p className="text-sm text-[#1B211D]/50">
            Create a product profile, set up variant sizes or colors, and allocate stock barcodes (SKU).
          </p>
        </div>
      </div>

      {/* RENDER NG FORM COMPONENT (Ipapasa ang categories at active slug) */}
      {/* Tandaan: Mag-e-error pansamantala ang Next.js dito hangga't wala pa ang ProductForm file */}
      <ProductForm categories={categories} slug={slug} />
    </main>
  );
}
