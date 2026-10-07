// components/dashboard/storefront/LiveStudioMonitor.tsx
'use client';

import { Laptop } from 'lucide-react';

interface LiveStudioMonitorProps {
  storeName: string;
  themeColor: string;
  backgroundPreset: string;
  bannerUrl: string;
  promoVideoUrl: string;
  promoText: string;
}

export default function LiveStudioMonitor({
  storeName,
  themeColor,
  backgroundPreset,
  bannerUrl,
  promoVideoUrl,
  promoText
}: LiveStudioMonitorProps) {
  return (
    <div className="sticky top-6 bg-white p-5 rounded-2xl border border-[#1B211D]/5 shadow-xs space-y-3">
      
      {/* MONITOR HEADER */}
      <h4 className="text-[11px] font-bold text-[#1B211D]/40 uppercase tracking-wider flex items-center gap-1">
        <Laptop size={12}/> Live Studio Monitor
      </h4>
      
      {/* MINI STOREFRONT MOCK CONTAINER */}
      <div className={`w-full rounded-xl overflow-hidden border border-slate-200/60 shadow-md min-h-[300px] transition-all flex flex-col ${backgroundPreset}`}>
        
        {/* DYNAMIC ASYMMETRICAL MINI COVER PANEL HEADER */}
        <div 
          className="h-28 w-full relative bg-cover bg-center flex flex-col justify-center items-end p-3 text-right overflow-hidden transition-all"
          style={{ 
            backgroundColor: themeColor,
            backgroundImage: bannerUrl ? `url(${bannerUrl})` : 'none'
          }}
        >
          {/* Tint shadow protection overlay */}
          <div className="absolute inset-0 bg-gradient-to-l from-black/50 via-black/10 to-transparent" />
          
          <div className="z-10 space-y-1">
            <div className="w-6 h-6 rounded-full bg-white/30 border border-white/40 ml-auto flex items-center justify-center text-[7px] text-white font-bold">
              M
            </div>
            <span className="text-[11px] font-black text-white tracking-tight block leading-none">
              {storeName}
            </span>
            <span className="text-[6px] text-white/80 bg-white/10 px-1 rounded-xs inline-block tracking-widest uppercase">
              Official
            </span>
          </div>
        </div>

        {/* INNER CONTENT REPLICA */}
        <div className="flex-1 p-3 space-y-3">
          
          {/* SEARCH BAR PLACEHOLDER (ZONE 2) */}
          <div className="w-full h-6 bg-white/80 border border-slate-100 rounded-md flex items-center justify-between px-2 text-[7px] text-slate-400 font-medium">
            <span>Search products...</span>
            <div className="w-2 h-2 rounded-full bg-slate-300/40" />
          </div>

          {/* MAIN GRID MOCK SPLIT (ZONE 3 VS ZONE 4) */}
          <div className="grid grid-cols-3 gap-2 items-start">
            
            {/* PRODUCT MOCK CARDS SECTION (SPANS 2 COLS - ZONE 3) */}
            <div className="col-span-2 grid grid-cols-2 gap-1.5">
              <div className="bg-white rounded-lg p-1.5 border border-slate-100 shadow-3xs space-y-1">
                <div className="w-full h-10 bg-slate-100 rounded-md relative flex items-center justify-center text-[6px] text-slate-300">
                  Image
                  <div className="absolute top-1 left-1 w-1 h-1 rounded-full" style={{ backgroundColor: themeColor }} />
                </div>
                <div className="w-6 h-1 bg-current opacity-30 rounded-xs" />
                <div className="w-4 h-1 bg-current opacity-15 rounded-xs" />
              </div>
              
              <div className="bg-white rounded-lg p-1.5 border border-slate-100 shadow-3xs space-y-1">
                <div className="w-full h-10 bg-slate-100 rounded-md flex items-center justify-center text-[6px] text-slate-300">
                  Image
                </div>
                <div className="w-7 h-1 bg-current opacity-30 rounded-xs" />
                <div className="w-3 h-1 bg-current opacity-15 rounded-xs" />
              </div>
            </div>

            {/* AD MARKETING SIDEBAR MOCK SECTION (SPANS 1 COL - ZONE 4) */}
            <div className="col-span-1 space-y-2">
              
              {/* VIDEO SLOT STATUS MOCK */}
              <div className="bg-white border border-slate-100 rounded-lg p-1 text-[5px] text-slate-400 space-y-1">
                <span className="font-bold opacity-60 uppercase block">Video</span>
                <div className="w-full aspect-video bg-slate-950 rounded-md flex items-center justify-center text-[5px] text-slate-600 font-mono">
                  {promoVideoUrl ? '▶ MP4' : 'EMPTY'}
                </div>
              </div>

              {/* VOUCHER / TEXT PROMO MOCK */}
              <div className="bg-white border border-slate-100 rounded-lg p-1 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ backgroundColor: themeColor }} />
                <span className="font-bold text-[4px] text-slate-400 uppercase tracking-tight block">Promo</span>
                <p className="text-[5px] font-medium text-slate-700 line-clamp-2 mt-0.5 leading-tight">
                  {promoText || 'No custom promo text added yet.'}
                </p>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
