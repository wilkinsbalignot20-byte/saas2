 // app/(dashboard)/dashboard/[slug]/products/bundles/[bundleId]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { prisma } from "@/lib/prisma";
import BundleForm from '@/components/dashboard/products/bundles/BundleForm';

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
    select: { id: true, name: true }
  });

  if (!store) return notFound();

  // 2. KUNIN ANG BUNDLE (storeId para sa tenant isolation)
  // INAYOS: wala nang 'includedProducts' (wala sa schema). tiers at choices ang tamang relations.
  const bundle = await prisma.productBundle.findFirst({
    where: {
      id: bundleId,
      storeId: store.id
    },
    include: {
      tiers: { orderBy: { quantity: 'asc' } },
      choices: true
    }
  });

  if (!bundle) return notFound();

  // 3. I-MAP SA SHAPE NG FORM (BundleFormProps['initialData'])
  // Decimal -> number, String[] -> isang URL string
  const initialData = {
    id: bundle.id,
    name: bundle.name,
    description: bundle.description,
    status: bundle.status,
    bundleType: bundle.bundleType,
    tiers: bundle.tiers.map((t) => ({
      id: t.id,
      quantity: t.quantity,
      price: Number(t.price),
      images: t.images?.[0] ?? '',
    })),
    choices: bundle.choices.map((c) => ({
      id: c.id,
      name: c.name,
      imageUrl: c.imageUrl,
    })),
  };

  return (
    <main className="min-h-screen flex-1 space-y-8 overflow-y-auto bg-[#F6F5F1] p-6 text-[#1B211D] md:p-10">
      <div className="mx-auto max-w-6xl space-y-4 border-b border-[#1B211D]/10 pb-6">
        <Link
          href={`/dashboard/${slug}/products/bundles`}
          className="group inline-flex select-none items-center gap-1.5 text-sm font-medium text-[#1B211D]/60 transition-colors hover:text-[#1B211D]"
        >
          <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          <span>Back to bundles</span>
        </Link>

        <div className="space-y-1.5">
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Edit bundle</h1>
          <p className="max-w-2xl text-sm text-[#1B211D]/55">
            Update tiers, photos and choices. The preview on the right shows how it looks on your store.
          </p>
        </div>
      </div>

      <BundleForm slug={slug} storeName={store.name} initialData={initialData} />
    </main>
  );
}