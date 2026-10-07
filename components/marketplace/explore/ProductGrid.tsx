 'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, Store, ShoppingCart, ArrowUpRight, X } from 'lucide-react';

interface ProductGridProps {
  products: any[];
  q: string;
}

const peso = (n: number) => `₱${n.toLocaleString('en-PH', { maximumFractionDigits: 2 })}`;
const isNew = (d: Date) => Date.now() - new Date(d).getTime() < 7 * 24 * 60 * 60 * 1000;

export default function ProductGrid({ products, q }: ProductGridProps) {
  const router = useRouter();

  // State para sa Modal tracking ng aktibong produkto
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#1B211D]/10 bg-white px-6 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F4F6F3] text-[#1B211D]/40">
          <Package size={24} />
        </span>
        <p className="text-base font-semibold">{q ? `Walang nahanap para sa "${q}"` : 'Wala pang produkto sa platform'}</p>
        <p className="max-w-sm text-sm text-[#1B211D]/55">
          {q ? 'Subukan ang ibang keyword o tingnan ang lahat ng produkto.' : 'Bumalik mamaya, may darating na bagong produkto.'}
        </p>
        {q && (
          <Link
            href="/shop/explore"
            className="mt-2 rounded-lg bg-[#1B211D] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2D4A3B]"
          >
            Ipakita ang lahat
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      {/* 1. MISMONG PRODUCT GRID LAYOUT */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => {
          const cover = product.images?.[0];

          return (
            <article
              key={product.id}
              onClick={() => setSelectedProduct(product)} // Binubuksan ang modal kapag pinindot ang card block
              className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-[#1B211D]/10 bg-white transition-colors hover:border-[#1B211D]/30"
            >
              {/* Image Box Section */}
              <div className="relative block aspect-square overflow-hidden bg-[#F4F6F3]">
                {cover ? (
                  <img
                    src={cover}
                    alt={product.name ?? ''}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[#1B211D]/20">
                    <Package size={36} />
                  </span>
                )}
                {isNew(product.createdAt) && (
                  <span className="absolute left-2.5 top-2.5 rounded-md bg-[#3E8F68] px-2 py-0.5 text-[11px] font-semibold text-white">
                    Bago
                  </span>
                )}
              </div>

              {/* Product Info Block */}
              <div className="flex flex-1 flex-col gap-2.5 p-3">
                <div className="space-y-1">
                  <div className="flex max-w-full items-center gap-1 text-xs text-[#1B211D]/55">
                    <Store size={12} className="shrink-0" />
                    <span className="truncate">{product.store?.name}</span>
                  </div>
                  <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug">
                    {product.name}
                  </h3>
                </div>

                <div className="mt-auto flex items-end justify-between gap-2">
                  <div>
                    {product.hasRange && <span className="block text-[11px] text-[#1B211D]/50">Simula sa</span>}
                    <span className="text-base font-bold tracking-tight">{peso(product.minPrice)}</span>
                  </div>
                  {product.variants?.length > 1 && (
                    <span className="rounded-md bg-[#F4F6F3] px-2 py-0.5 text-[11px] font-medium text-[#1B211D]/60">
                      {product.variants.length} variant
                    </span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* 2. CENTER MODAL DIALOG */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4"
          onClick={() => setSelectedProduct(null)} // Isasara ang modal kapag kinlik ang background overlay
        >
          <div
            className="animate-fade-in flex w-full max-w-sm flex-col items-center rounded-2xl bg-white p-5 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()} // Iwasang sumara kapag pinindot ang loob ng puting box
          >
            {/* Close Cross Button */}
            <button
              onClick={() => setSelectedProduct(null)}
              aria-label="Isara"
              className="self-end rounded-full p-1.5 text-[#1B211D]/40 transition-colors hover:bg-[#F4F6F3] hover:text-[#1B211D]"
            >
              <X size={18} />
            </button>

            {/* Preview Thumbnail ng Produkto */}
            <div className="mb-3 h-24 w-24 overflow-hidden rounded-xl bg-[#F4F6F3] ring-1 ring-[#1B211D]/10">
              {selectedProduct.images?.[0] ? (
                <img src={selectedProduct.images[0]} alt={selectedProduct.name ?? ''} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[#1B211D]/20">
                  <Package size={24} />
                </div>
              )}
            </div>

            {/* Pangalan at Detalye ng Produkto */}
            <h4 className="px-2 text-base font-bold leading-snug text-[#1B211D]">{selectedProduct.name}</h4>
            <p className="mt-1 text-xl font-bold text-[#3E8F68]">{peso(selectedProduct.minPrice)}</p>
            <p className="mb-5 mt-1 flex items-center justify-center gap-1 text-xs text-[#1B211D]/55">
              <Store size={12} /> Mula sa <span className="font-semibold text-[#1B211D]/80">{selectedProduct.store?.name}</span>
            </p>

            {/* MGA ACTION BUTTONS FOR THE CUSTOMER */}
            <div className="w-full space-y-2">
              {/* ACTION A: BUY NOW BUTTON */}
              <button
                onClick={() => {
                  alert(`Sisimulan ang pagbili para sa: ${selectedProduct.name}`);
                  setSelectedProduct(null);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3E8F68] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2D4A3B] active:scale-[0.99]"
              >
                <ShoppingCart size={16} />
                <span>Buy Now</span>
              </button>

              {/* ACTION B: GO TO THIS STORE BUTTON */}
              <Link
                href={`/shop/${selectedProduct.store?.slug}`}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#1B211D]/15 bg-white py-3 text-sm font-semibold text-[#1B211D] transition-colors hover:bg-[#F4F6F3] active:scale-[0.99]"
              >
                <ArrowUpRight size={16} />
                <span>Go to Store</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}