 import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Plus, Package } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import BundleListTable from '@/components/dashboard/products/bundles/bundle-form/BundleListTable';

interface BundlesPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BundlesPage({ params }: BundlesPageProps) {
  const { slug } = await params;

  // 1. TENANT SECURITY ISOLATION CHECK
  const store = await prisma.store.findUnique({
    where: { slug },
    select: { id: true, name: true }
  });

  if (!store) return notFound();

  // 2. KUNIN ANG DATA NG LAHAT NG BUNDLES RE-MAPPED SA SUB-TABLES
  const activeBundles = await prisma.productBundle.findMany({
    where: {
      storeId: store.id
    },
    include: {
      tiers: {
        orderBy: { quantity: 'asc' }
      },
      choices: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <main className="min-h-screen flex-1 space-y-8 overflow-y-auto bg-[#F6F5F1] p-6 text-[#1B211D] md:p-10">
      {/* HEADER */}
      <div className="mx-auto flex max-w-5xl flex-col gap-4 border-b border-[#1B211D]/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Bundles & packs</h1>
            <span className="rounded-full border border-[#1B211D]/10 bg-white px-2.5 py-0.5 text-xs font-semibold text-[#1B211D]/60">
              {activeBundles.length} total
            </span>
          </div>
          <p className="max-w-xl text-sm text-[#1B211D]/55">
            Manage mix-and-match bundles, tiered pack deals and pre-packed box promotions.
          </p>
        </div>

        <Link
          href={`/dashboard/${slug}/products/bundles/new`}
          className="inline-flex cursor-pointer select-none items-center justify-center gap-1.5 rounded-xl bg-[#1B211D] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1B211D]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B211D] focus-visible:ring-offset-2"
        >
          <Plus size={16} />
          <span>New bundle</span>
        </Link>
      </div>

      {/* LIST */}
      {activeBundles.length === 0 ? (
        <div className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-dashed border-[#1B211D]/15 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#F6F5F1] text-[#1B211D]/40">
            <Package size={22} />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-[#1B211D]/75">No bundles yet</p>
            <p className="mx-auto max-w-md text-sm text-[#1B211D]/50">
              Create a mix-and-match deal, a tiered pack price, or a pre-packed box to sell more per order.
            </p>
          </div>
          <Link
            href={`/dashboard/${slug}/products/bundles/new`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1B211D] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1B211D]/90"
          >
            <Plus size={16} />
            <span>Create your first bundle</span>
          </Link>
        </div>
      ) : (
        <BundleListTable initialBundles={activeBundles} slug={slug} />
      )}
    </main>
  );
}