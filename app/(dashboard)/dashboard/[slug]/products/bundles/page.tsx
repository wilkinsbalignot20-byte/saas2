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

  // 🟢 TAMA (Isang buong object lang dapat ang laman ng findMany)
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

  // Ang Prisma Decimal (price) ay hindi puwedeng ipasa nang diretso sa Client Component.
  const bundles = activeBundles.map((b) => ({
    id: b.id,
    name: b.name,
    description: b.description || '',
    status: b.status || 'draft',
    bundleType: b.bundleType || 'MIX_AND_MATCH',
    tiers: b.tiers.map((t) => {
      // 🟢 PAG-AAYOS SA BUG: Kinuha ang t.images nang buo nang walang `[0]` para hindi maging letter "h" ang string URL
      let rawImage: any = t.images ?? '';
      let cleanImageUrl = '';

      if (rawImage) {
        // Kung ito ay nakatagong stringified JSON array o object galing sa DB text column
        if (typeof rawImage === 'string' && (rawImage.startsWith('{') || rawImage.startsWith('['))) {
          try {
            const parsed = JSON.parse(rawImage);
            // Kung array ang resulta ng parse, kunin ang unang element
            rawImage = Array.isArray(parsed) ? parsed[0] : parsed;
          } catch {
            // No-op
          }
        } 
        // Kung ito ay katutubong array mula sa PostgreSQL JSONB column
        else if (Array.isArray(rawImage) && rawImage.length > 0) {
          rawImage = rawImage[0];
        }

        // Pagkuha ng string URL kung ito ay naging object mula sa Cloudinary upload structure
        if (typeof rawImage === 'object' && rawImage !== null) {
          cleanImageUrl = rawImage.secure_url || rawImage.url || rawImage.image_url || Object.values(rawImage).find(v => typeof v === 'string') || '';
        } else if (typeof rawImage === 'string') {
          cleanImageUrl = rawImage;
        }
      }

      return {
        id: t.id,
        quantity: t.quantity || 0,
        price: Number(t.price || 0),
        images: cleanImageUrl, // Garantisado nang buong Cloudinary link at hindi "h" lang!
      };
    }),
    choices: b.choices.map((c) => ({ 
      id: c.id, 
      name: c.name || '', 
      imageUrl: c.imageUrl || '' 
    })),
  }));

  // LIGTAS NA RETRIEVAL TYPE INJECTION PA-TUNGO SA CLIENT COMPONENT INTERFACE
  const SafeBundleListTable = BundleListTable as any;

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
        /* GINAGAMIT NA ANG INTEGRATED TYPE-CAST PARA MAWALA ANG PULANG GUHIT AT RUNTIME ERROR */
        <SafeBundleListTable initialBundles={bundles} slug={slug} />
      )}
    </main>
  );
}
