 // components/marketplace/shop/MarketingSidebar.tsx
'use client';

import { useState } from 'react';
import { Play, Tag, Copy, Check, Volume2 } from 'lucide-react';

interface Voucher {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend?: number;
}

interface MarketingSidebarProps {
  store: any; // Flexible type para tanggapin ang buong Prisma data object nang walang type error
  vouchers?: Voucher[];
}

export default function MarketingSidebar({ store, vouchers = [] }: MarketingSidebarProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const promoVideoUrl = store?.promoVideoUrl || null;
  const promoText = store?.promoText || 'PROMO: Gamitin ang code na MANIPU10 para sa 10% discount sa iyong checkout!';
  const themeColor = store?.themeColor || '#E8A33D';

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4 w-full">
      {/* 1. STORE PROMOTION TEXT BANNER (Pinag-isang Vibe) */}
      <section className="relative overflow-hidden bg-white rounded-2xl border border-[#1B211D]/10 p-5 pl-6 shadow-2xs">
        <div className="absolute left-0 inset-y-0 w-1.5" style={{ backgroundColor: themeColor }} />
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1B211D]">
          <Tag size={14} /> Store promotion
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[#1B211D]/70">{promoText}</p>
      </section>

      {/* 2. DYNAMIC VOUCHERS LISTING SECTION */}
      {vouchers.length > 0 && (
        <section className="bg-white rounded-2xl border border-[#1B211D]/10 p-5 shadow-2xs space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1B211D] border-b border-[#1B211D]/5 pb-2">
            <Tag size={14} /> Claim Store Vouchers
          </h3>

          <div className="space-y-3">
            {vouchers.map((voucher) => (
              <div 
                key={voucher.id}
                className="relative bg-[#F6F5F1]/40 border border-[#1B211D]/10 rounded-xl p-3 flex items-center justify-between overflow-hidden group transition-all hover:border-[#1B211D]/20"
              >
                {/* Estilo ng hiwang kupon (Ticket Cutouts) sa magkabilang gilid */}
                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-r border-[#1B211D]/10" />
                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-l border-[#1B211D]/10" />

                <div className="pl-2 space-y-0.5">
                  <span className="text-xs font-black tracking-tight text-[#1B211D] block">
                    {voucher.discountType === 'percentage' 
                      ? `${voucher.discountValue}% OFF` 
                      : `₱${voucher.discountValue} OFF`}
                  </span>
                  {voucher.minSpend ? (
                    <p className="text-[9px] text-[#1B211D]/50 font-medium">Min. Spend: ₱{voucher.minSpend}</p>
                  ) : (
                    <p className="text-[9px] text-[#1B211D]/50 font-medium">No Minimum Spend</p>
                  )}
                  <div className="pt-1">
                    <span className="text-[10px] font-mono font-bold bg-[#1B211D]/5 px-1.5 py-0.5 rounded text-[#1B211D]/70 uppercase tracking-wider">
                      {voucher.code}
                    </span>
                  </div>
                </div>

                {/* COPY BUTTON BUTTON */}
                <button
                  type="button"
                  onClick={() => handleCopyCode(voucher.code, voucher.id)}
                  className="p-2 rounded-lg bg-white border border-[#1B211D]/10 text-[#1B211D]/50 hover:text-[#1B211D] hover:bg-[#F6F5F1]/30 transition-all cursor-pointer relative z-10 shrink-0"
                >
                  {copiedId === voucher.id ? (
                    <Check size={14} className="text-emerald-600 font-bold" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. FEATURED VIDEO SHOWCASE CONTAINER */}
      <section className="bg-white rounded-2xl border border-[#1B211D]/10 p-5 shadow-2xs">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1B211D]">
          <Volume2 size={14} /> Featured video
        </h3>
        <div className="mt-3 aspect-video rounded-xl overflow-hidden bg-slate-900 border border-[#1B211D]/5 relative group">
          {promoVideoUrl ? (
            <video src={promoVideoUrl} className="w-full h-full object-cover" controls muted loop />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-center p-4">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <Play size={14} fill="white" />
              </span>
              <p className="text-xs text-slate-400 font-medium">Wala pang video</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
