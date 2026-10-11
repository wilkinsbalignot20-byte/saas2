 // app/(dashboard)/dashboard/[slug]/products/bundles/[bundleId]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Package } from 'lucide-react';
import { prisma } from "@/lib/prisma";

interface BundleIdPageProps {
  params: Promise<{
    slug: string;
    bundleId: string;
  }>;
}

export default async function BundleIdPage({ params }: BundleIdPageProps) {
  const { slug, bundleId } = await params;

  // 1. TENANT SECURITY CHECK
  const store = await prisma.store.findUnique({
    where: { slug },
    select: { id: true }
  });

  if (!store) return notFound();

  // 2. KUNIN ANG SPECIFIC BUNDLE RECORD
  // Gumagamit ng storeId para sa tenant data isolation
  const bundle = await prisma.productBundle.findFirst({
    where: {
      id: bundleId,
      storeId: store.id
    }
  });

  if (!bundle) return notFound();

  return (
    <main className="min-h-screen bg-[#F6F5F1] px-4 py-8 text-[#1B211D] md:px-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <Link
          href={`/dashboard/${slug}/products/bundles`}
          className="group inline-flex select-none items-center gap-1.5 text-sm font-medium text-[#1B211D]/60 transition-colors hover:text-[#1B211D]"
        >
          <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          <span>Back to bundles</span>
        </Link>

        <div className="space-y-1.5 border-b border-[#1B211D]/10 pb-6">
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Edit bundle</h1>
          <p className="text-sm text-[#1B211D]/55">Modify your wholesale bundle configuration here.</p>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-[#1B211D]/10 bg-white p-5 shadow-sm">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F6F5F1] text-[#1B211D]/50">
            <Package size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-[#1B211D]/45">Bundle</p>
            <p className="truncate text-base font-semibold text-[#1B211D]">{bundle.name}</p>
          </div>
        </div>
      </div>
    </main>
  );
}