// components/marketplace/shop/FlashSaleBanner.tsx
'use client';

import { useState, useEffect } from 'react';
import { Flame, Zap } from 'lucide-react';

interface FlashSaleItem {
  id: string;
  name: string;
  endTime: string; // ISO date string mula sa database (e.g., '2026-10-31T23:59:59Z')
  discountValue: number; 
  discountType: 'percentage' | 'fixed';
}

interface FlashSaleBannerProps {
  flashSales: FlashSaleItem[];
  themeColor: string;
}

export default function FlashSaleBanner({ flashSales, themeColor }: FlashSaleBannerProps) {
  // Kunin muna natin ang unang aktibong flash sale campaign ng seller
  const activeSale = flashSales[0]; 
  
  const [timeLeft, setTimeLeft] = useState({ hours: '00', minutes: '00', seconds: '00' });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!activeSale) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(activeSale.endTime) - +new Date();
      
      if (difference <= 0) {
        setIsExpired(true);
        return { hours: '00', minutes: '00', seconds: '00' };
      }

      const totalHours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      return {
        hours: totalHours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0'),
      };
    };

    // ✅ Ligtas na paraan sa React 19: Inuusog sa susunod na execution loop
    const initTimer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 0);

    // Patakbuhin ang timer bawat segundo
    const timer = setInterval(() => {
      const updatedTime = calculateTimeLeft();
      setTimeLeft(updatedTime);
    }, 1000);

    return () => {
      clearTimeout(initTimer);
      clearInterval(timer);
    };
  }, [activeSale]);

  // Kung expired na ang campaign o walang mahanap, huwag magpakita ng kahit ano sa storefront
  if (!activeSale || isExpired) return null;

  return (
    <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-300">
      
      {/* KALIWANG BAHAGI: CAMPAIGN TITLE & BADGES */}
      <div className="flex items-center gap-4">
        {/* Animated Lightning Icon Holder */}
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm animate-pulse"
          style={{ backgroundColor: themeColor }}
        >
          <Zap size={22} fill="white" className="text-amber-300" />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-black tracking-widest bg-amber-500 text-white px-2 py-0.5 rounded-md flex items-center gap-0.5">
              <Flame size={10} fill="white" /> Flash Sale
            </span>
            <span className="text-xs font-bold text-amber-600">
              {activeSale.discountType === 'percentage' 
                ? `Up to ${activeSale.discountValue}% OFF` 
                : `₱${activeSale.discountValue} Flat Discount`}
            </span>
          </div>
          <h3 className="text-base font-black text-slate-900 tracking-tight leading-tight">
            {activeSale.name || 'Bagsak Presyo Limited Promo!'}
          </h3>
        </div>
      </div>

      {/* KANANG BAHAGI: LIVE COUNTDOWN CLOCK BOXES */}
      <div className="flex items-center gap-2 self-start md:self-auto pl-16 md:pl-0">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
          Ends In:
        </span>
        
        {/* HOURS BOX */}
        <div className="flex flex-col items-center">
          <div className="bg-slate-900 text-white font-mono font-black text-sm px-2.5 py-1.5 rounded-lg shadow-sm tracking-wide min-w-[36px] text-center">
            {timeLeft.hours}
          </div>
        </div>
        <span className="font-bold text-slate-900 animate-ping">:</span>

        {/* MINUTES BOX */}
        <div className="flex flex-col items-center">
          <div className="bg-slate-900 text-white font-mono font-black text-sm px-2.5 py-1.5 rounded-lg shadow-sm tracking-wide min-w-[36px] text-center">
            {timeLeft.minutes}
          </div>
        </div>
        <span className="font-bold text-slate-900 animate-ping">:</span>

        {/* SECONDS BOX */}
        <div className="flex flex-col items-center">
          {/* Kulay ng seconds text ay gagamit ng themeColor para maging highlight anchor */}
          <div 
            className="text-white font-mono font-black text-sm px-2.5 py-1.5 rounded-lg shadow-sm tracking-wide min-w-[36px] text-center transition-colors"
            style={{ backgroundColor: themeColor }}
          >
            {timeLeft.seconds}
          </div>
        </div>
      </div>

    </div>
  );
}
