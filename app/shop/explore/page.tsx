 // app/shop/explore/page.tsx
import { prisma } from '@/lib/prisma';

// I-import ang mga malilinis na sub-components
import Header from '@/components/marketplace/explore/Header';
import SearchForm from '@/components/marketplace/explore/SearchForm';
import SortFilters from '@/components/marketplace/explore/SortFilters';
import ProductGrid from '@/components/marketplace/explore/ProductGrid';
import CategorySidebar from '@/components/marketplace/explore/CategorySidebar';

export const revalidate = 0;

type FilterKey = 'new' | 'discounts' | 'regular' | 'trending';

const EXPLORE_FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'new', label: '✨ New' },
  { key: 'discounts', label: '🏷️ Discounts' },
  { key: 'regular', label: '📦 Regular' },
  { key: 'trending', label: '🔥 Trending' },
];

export default async function PublicMarketplaceExplorePage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; filter?: string; category?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const q = (params.q ?? '').trim();

  const activeFilter: FilterKey = EXPLORE_FILTERS.some((f) => f.key === params.filter)
    ? (params.filter as FilterKey)
    : 'new';

  const category = (params.category ?? '').trim();

  // Binuo ang matalinong dynamic where clause para sa database filtering
  const whereClause: any = {};

  if (q) {
    whereClause.name = { contains: q, mode: 'insensitive' };
  }

  if (category) {
    whereClause.category = { slug: category };
  }

  // Prisma queries para sa mga produkto at kategorya lamang
  const [rawProducts] = await Promise.all([
    prisma.product.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: {
        store: { select: { name: true, slug: true } },
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // Normalize: Kalkulahin ang panimulang presyo at tunawin ang Prisma Decimal object
  const products = rawProducts.map((p: any) => {
    // RESOLUTION: Ginagawa nating plain JavaScript number ang price ng bawat variant para magustuhan ng Client Component
    const cleanVariants = p.variants.map((v: any) => ({
      ...v,
      price: Number(v.price),
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
    }));

    const prices = cleanVariants.map((v: any) => v.price).filter((n: any) => !Number.isNaN(n));
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const hasRange = prices.length > 1 && Math.max(...prices) !== minPrice;

    return {
      ...p,
      variants: cleanVariants, // Ipinasa ang malinis at serialized na variants array
      minPrice,
      hasRange,
    };
  });

  // Matalinong Pagsala at Pag-uuri (Frontend Filtering Logic base sa palatandaan)
  let filteredProducts = [...products];

  if (activeFilter === 'new') {
    filteredProducts.sort((a: any, b: any) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }

  if (activeFilter === 'discounts') {
    filteredProducts = products.filter((p: any) => p.variants.some((v: any) => v.compareAtPrice || Number(v.price) < 2000));
  }

  if (activeFilter === 'trending') {
    filteredProducts.sort((a: any, b: any) => b.variants.length - a.variants.length);
  }

  if (activeFilter === 'regular') {
    filteredProducts = products.filter((p: any) => p.variants.length === 1);
  }

  return (
    <div className="min-h-screen bg-[#F4F6F3] text-[#1B211D] antialiased">
      {/* Announcement Strip */}
      <div className="bg-[#1B211D] px-4 py-2 text-center text-xs text-white/75">
        Bumili nang direkta sa mga independent na tindahan, lahat sa iisang lugar.
      </div>

      {/* STICKY HEADER */}
      <div className="sticky top-0 z-50 w-full">
        <Header brandName="Manipu" />
      </div>

      <main className="mx-auto max-w-7xl space-y-5 px-4 pb-16 pt-5 sm:px-6 lg:px-8">
        {/* SEARCH FORM PANEL */}
        <SearchForm defaultValue={q} sort={activeFilter} />

        {/* TWO-COLUMN CONTENT GRID */}
        <div className="flex flex-col gap-6 pt-1 md:flex-row md:items-start md:gap-8">
          {/* SIDEBAR NAVIGATION: Listahan ng kategorya at patalastas sa ibaba */}
          <CategorySidebar />

          {/* MAIN GRID BLOCK FOR PRODUCTS */}
          <div className="min-w-0 flex-1">
            <section aria-labelledby="products-heading" className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 id="products-heading" className="text-lg font-bold tracking-tight sm:text-xl">
                    {category
                      ? `Mga produkto sa ${category.replace('-', ' ')}`
                      : q
                        ? `Resulta para sa "${q}"`
                        : 'Lahat ng produkto'}
                  </h2>
                  <p className="mt-0.5 text-sm text-[#1B211D]/55">{filteredProducts.length} produkto</p>
                </div>

                {/* SORT FILTERS CHIPS */}
                <SortFilters sortOptions={EXPLORE_FILTERS} currentSort={activeFilter} />
              </div>

              {/* MISMONG MGA CARDS NG PRODUKTO */}
              <ProductGrid products={filteredProducts} q={q} />
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#1B211D]/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-1 px-6 py-6 text-sm text-[#1B211D]/55 sm:flex-row lg:px-8">
          <span className="font-bold text-[#1B211D]">Manipu</span>
          <span>Marketplace ng mga independent na tindahan</span>
        </div>
      </footer>
    </div>
  );
}