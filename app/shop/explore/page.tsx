 // app/shop/explore/page.tsx
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Search, Package, Store, ChevronRight } from 'lucide-react';
import CardNav from '@/components/marketplace/explore/CardNav';

export const revalidate = 0;

type SortKey = 'newest' | 'price-asc' | 'price-desc';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Pinakabago' },
  { key: 'price-asc', label: 'Presyo: mababa' },
  { key: 'price-desc', label: 'Presyo: mataas' },
];

const peso = (n: number) => `₱${n.toLocaleString('en-PH', { maximumFractionDigits: 2 })}`;

export default async function PublicMarketplaceExplorePage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; sort?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const q = (params.q ?? '').trim();
  const sort: SortKey = SORTS.some((s) => s.key === params.sort) ? (params.sort as SortKey) : 'newest';

  const [rawProducts, categories] = await Promise.all([
    prisma.product.findMany({
      where: q ? { name: { contains: q, mode: 'insensitive' } } : undefined,
      include: {
        store: { select: { name: true, slug: true } },
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({
      take: 6,
      select: { name: true, slug: true, store: { select: { slug: true } } },
    }),
  ]);

  // Normalize: compute lowest price once per product
  const products = rawProducts.map((p) => {
    const prices = p.variants.map((v) => Number(v.price)).filter((n) => !Number.isNaN(n));
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const hasRange = prices.length > 1 && Math.max(...prices) !== minPrice;
    return { ...p, minPrice, hasRange };
  });

  if (sort === 'price-asc') products.sort((a, b) => a.minPrice - b.minPrice);
  if (sort === 'price-desc') products.sort((a, b) => b.minPrice - a.minPrice);

  // Unique shops (with product count) from the full result set
  const shopMap = new Map<string, { name: string; slug: string; count: number }>();
  for (const p of products) {
    if (!p.store) continue;
    const s = shopMap.get(p.store.slug);
    if (s) s.count += 1;
    else shopMap.set(p.store.slug, { name: p.store.name, slug: p.store.slug, count: 1 });
  }
  const shops = Array.from(shopMap.values());

  const newest = [...products].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const navItems = [
    {
      label: 'Mga Tindahan',
      bgColor: '#1B211D',
      textColor: '#fff',
      links: shops.slice(0, 4).map((s) => ({
        label: s.name,
        ariaLabel: `Bisitahin ang ${s.name}`,
        href: `/shop/${s.slug}`,
      })),
    },
    {
      label: 'Mga Kategorya',
      bgColor: '#2D4A3B',
      textColor: '#fff',
      links: categories.slice(0, 4).map((c) => ({
        label: c.name,
        ariaLabel: `Tingnan ang ${c.name}`,
        href: `/shop/${c.store.slug}?category=${c.slug}`,
      })),
    },
    {
      label: 'Bagong Dating',
      bgColor: '#3E8F68',
      textColor: '#fff',
      links: newest.slice(0, 3).map((p) => ({
        label: p.name,
        ariaLabel: `Tingnan ang ${p.name}`,
        href: `/shop/${p.store.slug}`,
      })),
    },
  ];

  const buildHref = (next: { q?: string; sort?: SortKey }) => {
    const sp = new URLSearchParams();
    const nq = next.q ?? q;
    const ns = next.sort ?? sort;
    if (nq) sp.set('q', nq);
    if (ns !== 'newest') sp.set('sort', ns);
    const s = sp.toString();
    return s ? `/shop/explore?${s}` : '/shop/explore';
  };

  const isNew = (d: Date) => Date.now() - new Date(d).getTime() < 7 * 24 * 60 * 60 * 1000;

  return (
    <div className="min-h-screen bg-[#F4F6F3] text-[#1B211D]">
      {/* Announcement strip */}
      <div className="bg-[#1B211D] px-4 py-2 text-center text-xs font-medium text-white/80">
        Bumili nang direkta sa mga independent na tindahan, lahat sa iisang lugar.
      </div>

      {/* Sticky header */}
      <div className="sticky top-0 z-50 mx-auto max-w-7xl px-4 pt-3 sm:px-6 lg:px-8">
        <CardNav
          brandName="KINS HUB"
          items={navItems}
          baseColor="#fff"
          menuColor="#1B211D"
          buttonBgColor="#3E8F68"
          buttonTextColor="#fff"
          buttonHref="/"
          ease="power3.out"
        />
      </div>

      <main className="mx-auto max-w-7xl space-y-8 px-4 pb-20 pt-5 sm:px-6 lg:px-8">
        {/* Search */}
        <form action="/shop/explore" method="GET" role="search" className="flex w-full items-center gap-2 rounded-2xl border border-[#1B211D]/10 bg-white p-1.5 shadow-sm focus-within:border-[#3E8F68] focus-within:ring-4 focus-within:ring-[#3E8F68]/15">
          <Search size={18} className="ml-3 shrink-0 text-[#1B211D]/40" aria-hidden />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Maghanap ng produkto"
            aria-label="Maghanap ng produkto"
            className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-sm outline-none placeholder:text-[#1B211D]/35"
          />
          {sort !== 'newest' && <input type="hidden" name="sort" value={sort} />}
          <button
            type="submit"
            className="rounded-xl bg-[#1B211D] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2D4A3B]"
          >
            Hanapin
          </button>
        </form>

        {/* Shops row */}
        {shops.length > 0 && !q && (
          <section aria-labelledby="shops-heading" className="space-y-4">
            <div className="flex items-end justify-between">
              <h2 id="shops-heading" className="text-xl font-extrabold tracking-tight">
                Mga tindahan sa platform
              </h2>
              <span className="text-sm text-[#1B211D]/50">{shops.length} tindahan</span>
            </div>
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
              {shops.map((s) => (
                <Link
                  key={s.slug}
                  href={`/shop/${s.slug}`}
                  className="group flex min-w-[220px] items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-[#1B211D]/5 transition-all hover:ring-[#3E8F68]/40 hover:shadow-md"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1B211D] text-base font-extrabold text-white">
                    {s.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{s.name}</span>
                    <span className="block text-xs text-[#1B211D]/50">{s.count} produkto</span>
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-[#1B211D]/30 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Products */}
        <section aria-labelledby="products-heading" className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="products-heading" className="text-xl font-extrabold tracking-tight">
                {q ? `Resulta para sa "${q}"` : 'Lahat ng produkto'}
              </h2>
              <p className="text-sm text-[#1B211D]/50">{products.length} produkto</p>
            </div>

            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Ayusin ayon sa">
              {SORTS.map((s) => (
                <Link
                  key={s.key}
                  href={buildHref({ sort: s.key })}
                  aria-current={sort === s.key ? 'true' : undefined}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    sort === s.key
                      ? 'bg-[#1B211D] text-white'
                      : 'bg-white text-[#1B211D]/70 ring-1 ring-[#1B211D]/10 hover:text-[#1B211D]'
                  }`}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl bg-white px-6 py-20 text-center ring-1 ring-[#1B211D]/5">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4F6F3] text-[#1B211D]/40">
                <Package size={26} />
              </span>
              <p className="text-base font-bold">{q ? `Walang nahanap para sa "${q}"` : 'Wala pang produkto sa platform'}</p>
              <p className="max-w-sm text-sm text-[#1B211D]/50">
                {q ? 'Subukan ang ibang keyword o tingnan ang lahat ng produkto.' : 'Bumalik mamaya, may darating na bagong produkto.'}
              </p>
              {q && (
                <Link href="/shop/explore" className="mt-2 rounded-xl bg-[#1B211D] px-5 py-2.5 text-sm font-semibold text-white">
                  Ipakita ang lahat
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => {
                const cover = product.images?.[0];
                const storeHref = `/shop/${product.store?.slug}`;

                return (
                  <article
                    key={product.id}
                    className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-[#1B211D]/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:ring-[#1B211D]/10"
                  >
                    <Link href={storeHref} className="relative block aspect-square overflow-hidden bg-[#F4F6F3]" tabIndex={-1} aria-hidden>
                      {cover ? (
                        <img
                          src={cover}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-[#1B211D]/20">
                          <Package size={40} />
                        </span>
                      )}
                      {isNew(product.createdAt) && (
                        <span className="absolute left-3 top-3 rounded-full bg-[#3E8F68] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                          Bago
                        </span>
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col gap-3 p-3.5 sm:p-4">
                      <div className="space-y-1">
                        <Link
                          href={storeHref}
                          className="inline-flex max-w-full items-center gap-1 text-xs font-medium text-[#1B211D]/50 transition-colors hover:text-[#3E8F68]"
                        >
                          <Store size={12} className="shrink-0" />
                          <span className="truncate">{product.store?.name}</span>
                        </Link>
                        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug">
                          <Link href={storeHref} className="after:absolute after:inset-0 focus-visible:outline-none">
                            {product.name}
                          </Link>
                        </h3>
                      </div>

                      <div className="mt-auto flex items-end justify-between gap-2">
                        <div>
                          {product.hasRange && <span className="block text-[11px] text-[#1B211D]/45">Simula sa</span>}
                          <span className="text-lg font-extrabold tracking-tight">{peso(product.minPrice)}</span>
                        </div>
                        {product.variants.length > 1 && (
                          <span className="rounded-full bg-[#F4F6F3] px-2.5 py-1 text-[11px] font-semibold text-[#1B211D]/60">
                            {product.variants.length} variant
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-[#1B211D]/5 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-8 text-sm text-[#1B211D]/50 sm:flex-row lg:px-8">
          <span className="font-bold text-[#1B211D]">KINS HUB</span>
          <span>Marketplace ng mga independent na tindahan</span>
        </div>
      </footer>
    </div>
  );
}