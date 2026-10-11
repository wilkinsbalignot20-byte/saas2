 'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit, Package, Layers, Boxes, LayoutGrid, Inbox } from 'lucide-react';

interface BundleListTableProps {
  initialBundles: any;
  slug: string;
}

const peso = (n: number) =>
  `₱${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

export default function BundleListTable({ initialBundles, slug }: BundleListTableProps) {
  // FILTER TABS STATE: ALL, MIX_AND_MATCH, o FIXED_PACKAGE
  const [activeTab, setActiveTab] = useState<'ALL' | 'MIX_AND_MATCH' | 'FIXED_PACKAGE'>('ALL');

  // 🌟 MAXIMUM SAFETY GUARD: Sinisigurong array ang data bago gamitan ng .filter() o .map()
  const safeBundles = Array.isArray(initialBundles) ? initialBundles : [];

  // Salain ang mga records base sa pinindot na tab gamit ang safe array
  const filteredBundles = safeBundles.filter((bundle) => {
    if (activeTab === 'ALL') return true;
    return bundle?.bundleType === activeTab;
  });

  const tabs = [
    { key: 'ALL' as const, label: 'All bundles', icon: null, count: safeBundles.length },
    {
      key: 'MIX_AND_MATCH' as const,
      label: 'Mix & match',
      icon: <LayoutGrid size={13} />,
      count: safeBundles.filter((b) => b?.bundleType === 'MIX_AND_MATCH').length,
    },
    {
      key: 'FIXED_PACKAGE' as const,
      label: 'Pre-packed',
      icon: <Boxes size={13} />,
      /* 🟢 FIXED: Ginawa nang safeBundles para hindi mag-crash kapag loading */
      count: safeBundles.filter((b) => b?.bundleType === 'FIXED_PACKAGE').length,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      {/* FILTER TABS */}
      <div className="inline-flex w-full items-center gap-1 rounded-xl border border-[#1B211D]/10 bg-white p-1 shadow-sm sm:w-auto">
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              aria-pressed={active}
              className={`flex flex-1 cursor-pointer select-none items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B211D] sm:flex-initial ${
                active ? 'bg-[#1B211D] text-white shadow-sm' : 'text-[#1B211D]/60 hover:bg-[#F6F5F1] hover:text-[#1B211D]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                  active ? 'bg-white/20 text-white' : 'bg-[#1B211D]/5 text-[#1B211D]/70'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* LIST */}
      {filteredBundles.length === 0 ? (
        <div className="animate-in fade-in space-y-2 rounded-2xl border border-dashed border-[#1B211D]/15 bg-white px-6 py-14 text-center shadow-sm duration-200">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#F6F5F1] text-[#1B211D]/40">
            <Inbox size={18} />
          </div>
          <p className="text-sm font-semibold text-[#1B211D]/70">No bundles in this view</p>
          <p className="text-xs text-[#1B211D]/45">Bundles you add under this type will show up here.</p>
        </div>
      ) : (
        <div className="animate-in fade-in overflow-hidden rounded-2xl border border-[#1B211D]/10 bg-white shadow-sm duration-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#1B211D]/5 bg-[#F6F5F1]/50 text-xs font-semibold text-[#1B211D]/55">
                  <th className="px-5 py-3">Bundle</th>
                  <th className="w-[150px] px-4 py-3">Type</th>
                  <th className="w-[170px] px-4 py-3">Tiers</th>
                  <th className="w-[190px] px-4 py-3">Price</th>
                  <th className="w-[120px] px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B211D]/5 text-sm">
                {filteredBundles.map((bundle: any) => {
                  // 🟢 SAFETY NETS & STRING CLEANUP
                  const firstTierWithImage = bundle?.tiers?.find((t: any) => t.images);
                  let displayImage = firstTierWithImage ? firstTierWithImage.images : null;

                  // 🟢 INAYOS: Linisin ang string sakaling ito ay may naunang ["url"] formatting arrays galing sa DB
                  if (displayImage && displayImage.startsWith('[')) {
                    try {
                      const parsed = JSON.parse(displayImage);
                      displayImage = Array.isArray(parsed) ? parsed[0] : displayImage;
                    } catch {
                      displayImage = displayImage.replace(/[\[\]"]/g, '');
                    }
                  }

                  const tierPrices = bundle?.tiers?.map((t: any) => Number(t.price)) || [];
                  const minPrice = tierPrices.length > 0 ? Math.min(...tierPrices) : 0;
                  const maxPrice = tierPrices.length > 0 ? Math.max(...tierPrices) : 0;

                  return (
                    <tr key={bundle.id} className="transition-colors hover:bg-[#F6F5F1]/40">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#1B211D]/10 bg-[#F6F5F1] text-[#1B211D]/35">
                            {displayImage ? (
                              <img src={displayImage} alt={bundle.name} className="h-full w-full object-cover" />
                            ) : (
                              <Package size={20} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[#1B211D]">{bundle.name}</p>
                            <p className="max-w-[260px] truncate text-xs text-[#1B211D]/45">
                              {bundle.description || 'No description provided'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {bundle.bundleType === 'MIX_AND_MATCH' ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-[#C3E6CB] bg-[#D4EDDA] px-2.5 py-1 text-xs font-semibold text-[#155724]">
                            <LayoutGrid size={12} />
                            <span>Mix & match</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            <Boxes size={12} />
                            <span>Pre-packed</span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#1B211D]/80">
                            <Layers size={12} className="text-[#1B211D]/40" />
                            {bundle?.tiers?.length || 0} price {bundle?.tiers?.length === 1 ? 'tier' : 'tiers'}
                          </span>
                          {bundle.bundleType === 'MIX_AND_MATCH' && (
                            <span className="text-[11px] text-[#1B211D]/45">
                              {bundle?.choices?.length || 0} selectable options
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4 font-semibold text-[#1B211D]">
                        {(bundle?.tiers?.length || 0) > 1 ? (
                          <span>
                            {peso(minPrice)} – {peso(maxPrice)}
                          </span>
                        ) : bundle?.tiers?.length === 1 ? (
                          <span>{peso(minPrice)}</span>
                        ) : (
                          <span className="text-xs font-normal text-[#1B211D]/40">₱0.00</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/dashboard/${slug}/products/bundles/${bundle.id}`}
                          className="inline-flex cursor-pointer select-none items-center gap-1.5 rounded-lg border border-[#1B211D]/10 bg-white px-3 py-1.5 text-xs font-semibold text-[#1B211D] transition hover:bg-[#1B211D] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B211D]"
                        >
                          <Edit size={12} />
                          <span>Configure</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
