// components/onboarding/StepStorefront.tsx
'use client';

import Image from 'next/image';
import React from 'react';

interface StepStorefrontProps {
  storeName: string;
  onStoreNameChange: (val: string) => void;
  storeSlug: string;
  logoPreview: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
  onBack: () => void;
}

export default function StepStorefront({
  storeName, onStoreNameChange, storeSlug, logoPreview, handleFileChange, loading, onBack
}: StepStorefrontProps) {
  
  return (
    <div className="space-y-4 pt-4 border-t border-ink/5 animate-in fade-in duration-200">
      <h2 className="font-display font-semibold text-marigold uppercase tracking-wider text-xs">
        Section 2: Storefront Deployment
      </h2>
      
      {/* Store Name Input */}
      <input
        type="text" required placeholder="Store Name (e.g., Wilkins Premium Goods)" value={storeName}
        onChange={(e) => onStoreNameChange(e.target.value)}
        className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink/40 transition-colors"
      />
      
      {/* Live Slug URL Link Handle */}
      <div className="space-y-1">
        <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Live URL Handle link</label>
        <div className="relative rounded-xl flex items-center bg-paper border border-ink/15 overflow-hidden">
          <span className="pl-4 pr-1 font-mono text-xs text-ink/30 select-none">://manipu.com</span>
          <input
            type="text" required readOnly placeholder="auto-generated-slug" value={storeSlug}
            className="w-full bg-transparent border-none py-3 pr-4 text-sm text-marigold outline-none font-mono"
          />
        </div>
      </div>

      {/* Brand Logo Upload Dropzone Box */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Store Brand Logo</label>
        <div className="flex items-center gap-4 bg-paper border border-ink/15 rounded-xl p-3">
          <div className="h-12 w-12 rounded-lg bg-ink/5 border border-ink/10 flex items-center justify-center overflow-hidden shrink-0">
            {logoPreview ? (
              <Image src={logoPreview} alt="Preview" width={48} height={48} unoptimized className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs text-ink/30 font-mono">No Logo</span>
            )}
          </div>
          <input
            type="file" accept="image/*" onChange={handleFileChange}
            className="w-full text-xs text-ink/60 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-ink file:text-paper file:hover:bg-ink/80 file:cursor-pointer"
          />
        </div>
      </div>

      {/* Action Button Navigation Controls */}
      <div className="flex gap-3 pt-4">
        <button
          type="button" disabled={loading} onClick={onBack}
          className="w-1/3 border border-ink/10 text-ink font-semibold py-3.5 rounded-xl text-xs hover:bg-ink/5 transition active:scale-95"
        >
          Back
        </button>
        <button
          type="submit" disabled={loading || !storeName}
          className="w-2/3 bg-ink text-paper font-semibold py-3.5 rounded-xl text-sm hover:bg-ink/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? 'Deploying environment...' : 'Launch My Store Platform 🚀'}
        </button>
      </div>
    </div>
  );
}
