 // app/(dashboard)/dashboard/[slug]/products/bundles/[bundleId]/page.tsx
import { notFound } from "next/navigation";
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
  // Inayos: Gagamit ng storeId para sa tenant data isolation tracking validation security barrier
  const bundle = await prisma.productBundle.findFirst({
    where: {
      id: bundleId,
      storeId: store.id
    },
    include: {
      includedProducts: {
        include: {
          product: true
        }
      }
    }
  });

  if (!bundle) return notFound();

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-[#1B211D]">Edit Bundle Offers</h1>
      <p className="text-sm text-[#1B211D]/50">Modify your wholesale bundle configurations here.</p>
      <div className="p-6 bg-white border border-[#1B211D]/5 rounded-2xl shadow-sm text-sm text-[#1B211D]/60">
        Bundle item configuration panel layer actively linked: <span className="font-bold text-[#1B211D]">{bundle.name}</span>
      </div>
    </div>
  );
}
