 // app/(dashboard)/dashboard/[slug]/storefront/page.tsx

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import StorefrontDesignForm from '@/components/dashboard/storefront/StorefrontDesignForm';

interface StorefrontPageProps {
  params: Promise<{ slug: string }>;
}

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  // 1. Kunin ang active store slug mula sa URL parameters
  const { slug } = await params;

  // 2. Hatakin ang data ng tindahan upang makuha ang kasalukuyang disenyo (theme, color, background)
  const store = await prisma.store.findUnique({
    where: {
      slug: slug,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      themeColor: true,
      logoUrl: true,
      backgroundPreset: true,
    },
  });

  // Kung walang nahanap na tindahan, magpakita ng 404 error page
  if (!store) {
    return notFound();
  }

  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 bg-[#F6F5F1] text-[#1B211D] min-h-screen overflow-y-auto">
      {/* HEADER MATRIX */}
      <div className="space-y-1 border-b border-[#1B211D]/5 pb-6">
        <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[#1B211D]">
          Storefront Design Studio
        </h1>
        <p className="text-sm text-[#1B211D]/50">
          I-customize ang hitsura ng iyong online store. Baguhin ang kulay at tema base sa branding ng iyong mga produkto.
        </p>
      </div>

      {/* RENDER NG DESIGN EDITOR FORM COMPONENT */}
      <StorefrontDesignForm store={store} />
    </main>
  );
}
