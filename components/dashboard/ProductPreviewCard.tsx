// components/dashboard/ProductPreviewCard.tsx
'use client';

import { useState } from 'react';
import { Package, Store, Check, Circle } from 'lucide-react';

interface ProductPreviewCardProps {
  images: string[];
  name: string;
  categoryName: string;
  isNewCategory: boolean;
  prices: number[]; // galing sa lahat ng variants
  variantCount: number;
  status: string;
  storeName: string;
}

const peso = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function ProductPreviewCard({
  images,
  name,
  categoryName,
  isNewCategory,
  prices,
  variantCount,
  status,
  storeName,
}: ProductPreviewCardProps) {
  const [selected, setSelected] = useState(0);

  const activeIndex = selected < images.length ? selected : 0;
  const cover = images[activeIndex];

  // Ang 0 ay itinuturing na "wala pang presyo"
  const validPrices = prices.filter((p) => !Number.isNaN(p) && p > 0);
  const minPrice = validPrices.length ? Math.min(...validPrices) : 0;
  const hasRange = validPrices.length > 1 && Math.max(...validPrices) !== minPrice;

  const statusLabel = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Draft';
  const isDraft = status === 'draft';

  const checklist = [
    { label: 'Photo', done: images.length > 0 },
    { label: 'Name', done: name.trim().length > 0 },
    { label: 'Category', done: categoryName.trim().length > 0 },
    { label: 'Price', done: validPrices.length > 0 },
  ];

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3E8F68] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3E8F68]" />
          </span>
          <h2 className="text-sm font-bold text-[#1B211D]">Live preview</h2>
        </div>
        <p className="mt-1 text-xs text-[#1B211D]/50">Ganito makikita ng customers ang product mo sa marketplace.</p>
      </div>

      {/* Card (kapareho ng product card sa marketplace) */}
      <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#1B211D]/5">
        <div className="relative aspect-square overflow-hidden bg-[#F6F5F1]">
          {cover ? (
            <img src={cover} alt={name || 'Product preview'} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#1B211D]/25">
              <Package size={44} />
              <span className="text-xs font-medium">Walang litrato pa</span>
            </div>
          )}
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm ${
              isDraft ? 'bg-amber-100 text-amber-800' : 'bg-[#3E8F68] text-white'
            }`}
          >
            {statusLabel}
          </span>
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-b border-[#1B211D]/5 p-3">
            {images.slice(0, 6).map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => setSelected(i)}
                aria-label={`Show image ${i + 1}`}
                className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#F6F5F1] ring-2 transition ${
                  i === activeIndex ? 'ring-[#3E8F68]' : 'ring-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="space-y-3 p-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex max-w-[60%] items-center gap-1 text-xs font-medium text-[#1B211D]/50">
                <Store size={12} className="shrink-0" />
                <span className="truncate">{storeName}</span>
              </span>
              {categoryName ? (
                <span className="truncate rounded-full bg-[#F6F5F1] px-2.5 py-0.5 text-[11px] font-semibold text-[#1B211D]/60">
                  {categoryName}
                  {isNewCategory && <span className="ml-1 text-[#3E8F68]">(new)</span>}
                </span>
              ) : (
                <span className="rounded-full border border-dashed border-[#1B211D]/15 px-2.5 py-0.5 text-[11px] text-[#1B211D]/35">
                  No category
                </span>
              )}
            </div>
            <h3 className={`line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug ${name.trim() ? 'text-[#1B211D]' : 'text-[#1B211D]/30'}`}>
              {name.trim() || 'Product name'}
            </h3>
          </div>

          <div className="flex items-end justify-between gap-2 border-t border-[#1B211D]/5 pt-3">
            <div>
              {hasRange && <span className="block text-[11px] text-[#1B211D]/45">Simula sa</span>}
              {validPrices.length > 0 ? (
                <span className="text-lg font-extrabold tracking-tight text-[#1B211D]">{peso(minPrice)}</span>
              ) : (
                <span className="text-sm font-medium text-[#1B211D]/35">Maglagay ng presyo</span>
              )}
            </div>
            {variantCount > 1 && (
              <span className="rounded-full bg-[#F6F5F1] px-2.5 py-1 text-[11px] font-semibold text-[#1B211D]/60">
                {variantCount} variants
              </span>
            )}
          </div>
        </div>
      </article>

      {/* Completeness checklist */}
      <ul className="grid grid-cols-2 gap-2" aria-label="Listing checklist">
        {checklist.map((c) => (
          <li
            key={c.label}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
              c.done ? 'bg-[#3E8F68]/10 text-[#2D6E4E]' : 'bg-white text-[#1B211D]/45 ring-1 ring-[#1B211D]/8'
            }`}
          >
            {c.done ? <Check size={14} className="shrink-0" /> : <Circle size={14} className="shrink-0 opacity-50" />}
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}