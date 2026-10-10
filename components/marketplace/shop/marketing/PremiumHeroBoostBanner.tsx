 // components/marketplace/shop/marketing/PremiumHeroBoostBanner.tsx
'use client';

import { useState, useEffect } from 'react';
import { Flame, Sparkles } from 'lucide-react';
import DepthText from './DepthText';

interface BoostItem {
  id: string;
  name: string;
  endTime: string;
  discountValue: number; 
  discountType: 'percentage' | 'fixed';
}

interface PremiumHeroBoostBannerProps {
  boosts: BoostItem[];
  themeColor: string;
}

export default function PremiumHeroBoostBanner({ boosts, themeColor }: PremiumHeroBoostBannerProps) {
  const activeBoost = boosts[0]; // Kuhanin ang unang active boost item
  
  const [timeLeft, setTimeLeft] = useState({ hours: '00', minutes: '00', seconds: '00' });
  const [isExpired, setIsExpired] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!activeBoost) return;

    const calculateTimeLeft = () => {
      const targetTime = activeBoost.endTime; 
      if (!targetTime) return { hours: '00', minutes: '00', seconds: '00' };

      const difference = +new Date(targetTime) - +new Date();
      
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

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [activeBoost]);

  if (!isMounted || !activeBoost || isExpired) return null;

  const depthDisplayHeading = activeBoost.discountType === 'percentage'
    ? `${activeBoost.discountValue}% OFF`
    : `₱${activeBoost.discountValue} OFF`;

  return (
    <div 
      // 🛡️ PINAPALIIT ANG BOX: Binawasan ang padding (p-4) at min-height (min-h-[110px]) para kasukat lang ng lumang banner
      className="w-full rounded-2xl overflow-hidden border-2 relative shadow-lg flex flex-col md:flex-row md:items-center justify-between p-4 md:p-5 gap-4"
      style={{ 
        borderColor: '#ef4444', // 👈 Ginawang PULANG border para sa maapoy na tema
        background: `linear-gradient(135deg, #1e293b 0%, #0f172a 100%)` // Maintain sleek dynamic dark steel slate contrast background
      }}
    >
      {/* KALIWANG COMPACT BLOCK: BADGE, 3D LOGO, AT CAMPAIGN NAME */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
        
        {/* VIP Compact Badge */}
        <div 
          className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest text-white flex items-center gap-1 shadow-sm border border-white/5 w-fit"
          style={{ backgroundColor: '#dc2626' }} // 👈 Pure Red Badge Accent
        >
          <Sparkles size={10} className="animate-spin" />
          Premium
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-x-6 gap-y-1">
          {/* THE REACTBITS DEPTH TEXT (Sukat ay pinasok sa clamp para maging compact at selyado) */}
          <div className="select-none flex items-center scale-90 origin-left">
            <DepthText
              text={depthDisplayHeading} 
              layers={18} // 👈 Binawasan ang kapal para sa mas maliit na box
              depth={1.5}
              faceColor="#ffffff"
              depthColor="#ef4444" // 👈 Solid Red Glow 3D Depth
              tilt={5}
              pointerTracking
              smoothing={0.12}
              perspective={700}
              autoOrbit
              orbitSpeed={0.25}
              fontSize="clamp(2rem, 5vw, 3.2rem)" // 👈 Pinamaliit ang font para sumakto sa slim layout
              fontWeight={950}
              shadow
            />
          </div>
          
          {/* ⚡ ANG TEXT NG SALES (Gawin ding KULAY PULA base sa hiling mo) */}
          <h4 className="text-sm md:text-base font-black text-red-500 tracking-tight flex items-center gap-1.5 drop-shadow-sm transition-colors duration-200">
            <Flame size={16} className="text-red-500 fill-red-500 animate-pulse" />
            {activeBoost.name || 'Special Limited Promo Offer!'}
          </h4>
        </div>
      </div>

      {/* KANANG COMPACT BLOCK: COUNTDOWN CLOCK */}
      <div className="flex items-center gap-2 bg-black/30 border border-white/5 px-4 py-2 rounded-xl shadow-inner md:self-auto self-start">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">
          Ends In:
        </span>
        
        {/* HOURS */}
        <div className="bg-slate-950 border border-white/5 text-white font-mono font-black text-xs px-2 py-1 rounded-md">
          {timeLeft.hours}
        </div>
        <span className="font-bold text-red-500">:</span>

        {/* MINUTES */}
        <div className="bg-slate-950 border border-white/5 text-white font-mono font-black text-xs px-2 py-1 rounded-md">
          {timeLeft.minutes}
        </div>
        <span className="font-bold text-red-500">:</span>

        {/* SECONDS */}
        <div 
          className="text-white font-mono font-black text-xs px-2 py-1 rounded-md shadow-sm"
          style={{ backgroundColor: '#dc2626' }} // 👈 Pulang Seconds highlight block
        >
          {timeLeft.seconds}
        </div>
      </div>
    </div>
  );
}
