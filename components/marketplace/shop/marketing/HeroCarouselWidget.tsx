// components/marketplace/shop/marketing/HeroCarouselWidget.tsx
"use client";

import { useState, useEffect } from "react";

export default function HeroCarouselWidget({ boosts, themeColor }: { boosts: any[]; themeColor: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (boosts.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % boosts.length);
    }, 4000); // Magpapalit kada 4 na segundo
    return () => clearInterval(interval);
  }, [boosts]);

  const activeBoost = boosts[activeIndex];

  return (
    <div className="w-full rounded-2xl overflow-hidden border-2 relative bg-slate-900 text-white min-h-[160px] md:min-h-[220px] flex items-center p-6 md:p-8" style={{ borderColor: themeColor }}>
      <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
        ⭐ Premium Feature
      </div>
      
      <div className="space-y-2 max-w-xl">
        <span className="inline-block text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-white/20">
          {activeBoost.type.replace("_", " ")}
        </span>
        <h3 className="text-xl md:text-3xl font-extrabold tracking-tight">
          {activeBoost.name.split("||IMAGE||")[0]}
        </h3>
        <p className="text-xs md:text-sm text-slate-300">
          Eksklusibong alok mula sa aming tindahan. Huwag palampasin!
        </p>
      </div>

      {/* Kung may kasamang imahe sa delimiter string mo */}
      {activeBoost.name.includes("||IMAGE||") && (
        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-1/3 opacity-40 md:opacity-100">
          <img 
            src={activeBoost.name.split("||IMAGE||")[1]} 
            alt="Promo" 
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
