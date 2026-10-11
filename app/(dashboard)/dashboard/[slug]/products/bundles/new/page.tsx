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

  // 1. TENANT SECURITY & ISOLATION FETCH
  const store = await prisma.store.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
    }
  });

  if (!store) return notFound();

  return (
    <main className="min-h-screen flex-1 space-y-8 overflow-y-auto bg-[#F6F5F1] p-6 text-[#1B211D] md:p-10">
      {/* BACK NAVIGATION & HEADER */}
      <div className="mx-auto max-w-6xl space-y-4 border-b border-[#1B211D]/10 pb-6">
        <Link
          href={`/dashboard/${slug}/products/bundles`}
          className="group inline-flex select-none items-center gap-1.5 text-sm font-medium text-[#1B211D]/60 transition-colors hover:text-[#1B211D]"
        >
          <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          <span>Back to bundles</span>
        </Link>

        <div className="space-y-1.5">
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">New bundle</h1>
          <p className="max-w-2xl text-sm text-[#1B211D]/55">
            Set the package type, add tiers with product photos, and preview how it will look on your store.
          </p>
        </div>
      </div>

      <BundleForm slug={slug} storeName={store.name} />
    </main>
  );
}