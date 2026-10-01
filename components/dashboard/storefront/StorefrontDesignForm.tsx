'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Palette, Layout, Sparkles, AlertCircle } from 'lucide-react';

interface StoreData {
  id: string;
  name: string;
  slug: string;
  themeColor: string;
  logoUrl: string | null;
  backgroundPreset: string;
}

interface StorefrontDesignFormProps {
  store: StoreData;
}

// MGA PRESET BACKGROUND CHOICES NA MATITINGNAN NG MERCHANT
const BACKGROUND_PRESETS = [
  { id: 'bg-slate-50', name: 'Minimalist Slate', class: 'bg-slate-50 text-slate-900 border border-slate-200' },
  { id: 'bg-zinc-900', name: 'Dark Onyx', class: 'bg-zinc-900 text-zinc-100 border border-zinc-800' },
  { id: 'bg-amber-50/60', name: 'Warm Cream', class: 'bg-[#FAF6EE] text-[#1B211D] border border-amber-100' },
  { id: 'bg-rose-50/50', name: 'Soft Rose', class: 'bg-rose-50/50 text-rose-950 border border-rose-100' },
];

export default function StorefrontDesignForm({ store }: StorefrontDesignFormProps) {
  const router = useRouter();

  // CORE LIVE STATES PARA SA DESIGN STUDIO
  const [themeColor, setThemeColor] = useState(store.themeColor);
  const [backgroundPreset, setBackgroundPreset] = useState(store.backgroundPreset);
  const [logoUrl] = useState(store.logoUrl || '');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // TRANSACTION HANDLER FOR SAVING THE NEW FRONTSTORE LAYOUT
  const handleSaveDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // MAGPAPADALA NG FETCH UPDATE SA BACKEND (Gagawa ka ng api/stores sa susunod na hakbang)
      const response = await fetch(`/api/stores/${store.slug}/design`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeColor,
          backgroundPreset,
          logoUrl: logoUrl.trim() || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update storefront design settings.');
      }

      setSuccessMessage('Storefront branding layout successfully deployed to your live shop!');
      router.refresh(); // I-refresh ang layout data cache ng system

    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving the design data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSaveDesign} className="space-y-8 max-w-4xl animate-in fade-in duration-300">
      
      {/* NOTIFICATION MESSAGES PANEL */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-3 text-sm">
          <Sparkles size={18} className="text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: CONTROL INPUT LAYOUT PANELS */}
        <div className="md:col-span-2 space-y-6">
          
          {/* THEME COLOR SECTION CHUB */}
          <div className="bg-white p-6 rounded-2xl border border-[#1B211D]/5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Palette size={16} className="text-[#3E8F68]" />
              <h3 className="text-sm font-bold text-[#1B211D] font-display uppercase tracking-wider text-xs">
                Brand Core Color
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Pumili ng kulay na babagay sa iyong produkto. Gagamitin ito sa mga buttons, headers, at highlights ng iyong shop.
            </p>
            <div className="flex items-center gap-4 bg-[#F6F5F1]/50 p-4 rounded-xl border border-slate-100">
              <input 
                type="color" 
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="w-14 h-14 rounded-lg cursor-pointer border-0 bg-transparent"
              />
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#1B211D]/50 uppercase tracking-tight block">Hex Code Color</label>
                <input 
                  type="text"
                  maxLength={7}
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="bg-white border border-[#1B211D]/10 rounded-md px-3 py-1 text-xs font-mono uppercase focus:outline-none focus:border-[#3E8F68]"
                />
              </div>
            </div>
          </div>

          {/* BACKGROUND WALLPAPER PRESET SECTOR */}
          <div className="bg-white p-6 rounded-2xl border border-[#1B211D]/5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layout size={16} className="text-[#3E8F68]" />
              <h3 className="text-sm font-bold text-[#1B211D] font-display uppercase tracking-wider text-xs">
                Background Ambiance
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Baguhin ang mood o canvas ng iyong tindahan para mag-standout ang listahan ng mga paninda mo.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {BACKGROUND_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => setBackgroundPreset(preset.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between h-20 text-xs font-medium select-none ${preset.class} ${
                    backgroundPreset === preset.id 
                      ? 'ring-2 ring-[#3E8F68] ring-offset-2 scale-[1.01] shadow-xs' 
                      : 'hover:opacity-80'
                  }`}
                >
                  <span>{preset.name}</span>
                  <div className="w-3 h-3 rounded-full self-end border border-black/10" style={{ backgroundColor: themeColor }} />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: REAL-TIME GRAPHICAL MINI PREVIEW WIDGET */}
        <div className="md:col-span-1">
          <div className="sticky top-6 bg-white p-5 rounded-2xl border border-[#1B211D]/5 shadow-xs space-y-3">
            <h4 className="text-[11px] font-bold text-[#1B211D]/40 uppercase tracking-wider block">Live Mini Monitor</h4>
            
            {/* MINIATURE STOREFRONT SHELL CARD */}
            <div className={`w-full rounded-xl overflow-hidden border border-slate-200/60 shadow-2xs min-h-[220px] transition-all flex flex-col ${backgroundPreset}`}>
              <div className="p-3 text-center transition-colors text-white font-semibold text-xs drop-shadow-xs" style={{ backgroundColor: themeColor }}>
                {store.name}
              </div>
              <div className="flex-1 p-4 flex flex-col justify-center items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-300/40 border border-dashed border-slate-400/40 flex items-center justify-center text-[10px] text-slate-400">
                  Logo
                </div>
                <div className="w-20 h-2 bg-slate-300/30 rounded-xs" />
                <div className="grid grid-cols-2 gap-2 w-full mt-2">
                  <div className="bg-white/80 rounded-lg p-2 border border-slate-100 flex flex-col gap-1.5 shadow-2xs">
                    <div className="w-full h-8 bg-slate-200/50 rounded-md" />
                    <div className="w-10 h-1.5 bg-slate-400/30 rounded-xs" />
                    <div className="w-8 h-2 rounded-xs self-start" style={{ backgroundColor: themeColor }} />
                  </div>
                  <div className="bg-white/80 rounded-lg p-2 border border-slate-100 flex flex-col gap-1.5 shadow-2xs">
                    <div className="w-full h-8 bg-slate-200/50 rounded-md" />
                    <div className="w-10 h-1.5 bg-slate-400/30 rounded-xs" />
                    <div className="w-8 h-2 rounded-xs self-start" style={{ backgroundColor: themeColor }} />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-center text-slate-400">Patikim na visual na anyo ng iyong harapan ng tindahan.</p>
          </div>
        </div>

      </div>

      {/* DISPATCH ACTION ACTION CONTROLLER BUTTON */}
      <div className="flex justify-end gap-3 border-t border-[#1B211D]/5 pt-6">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-[#3E8F68] text-white font-medium px-6 py-3 rounded-xl text-sm hover:bg-[#327555] active:scale-[0.98] transition-all disabled:opacity-50 select-none shadow-sm cursor-pointer"
        >
          <Save size={16} />
          <span>{loading ? 'Deploying Changes...' : 'Save & Publish Storefront Theme'}</span>
        </button>
      </div>

    </form>
  );
}
