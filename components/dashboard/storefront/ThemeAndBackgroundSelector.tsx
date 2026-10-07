// components/dashboard/storefront/ThemeAndBackgroundSelector.tsx
'use client';

import { Palette, Layout } from 'lucide-react';

interface ThemeAndBackgroundSelectorProps {
  themeColor: string;
  setThemeColor: (color: string) => void;
  backgroundPreset: string;
  setBackgroundPreset: (preset: string) => void;
}

const BACKGROUND_PRESETS = [
  { id: 'bg-slate-50', name: 'Minimalist Slate', class: 'bg-slate-50 text-slate-900 border border-slate-200' },
  { id: 'bg-zinc-900', name: 'Dark Onyx', class: 'bg-zinc-900 text-zinc-100 border border-zinc-800' },
  { id: 'bg-amber-50/60', name: 'Warm Cream', class: 'bg-[#FAF6EE] text-[#1B211D] border border-amber-100' },
  { id: 'bg-rose-50/50', name: 'Soft Rose', class: 'bg-rose-50/50 text-rose-950 border border-rose-100' },
];

export default function ThemeAndBackgroundSelector({
  themeColor,
  setThemeColor,
  backgroundPreset,
  setBackgroundPreset,
}: ThemeAndBackgroundSelectorProps) {
  return (
    <div className="space-y-6">
      
      {/* BRAND COLOR CONTAINER */}
      <div className="bg-white p-6 rounded-2xl border border-[#1B211D]/5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Palette size={16} className="text-[#3E8F68]" />
          <h3 className="text-xs font-bold text-[#1B211D] font-display uppercase tracking-wider">
            Brand Core Color
          </h3>
        </div>
        
        <div className="flex items-center gap-4 bg-[#F6F5F1]/50 p-4 rounded-xl border border-slate-100">
          <input 
            type="color" 
            value={themeColor}
            onChange={(e) => setThemeColor(e.target.value)}
            className="w-14 h-14 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
          />
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#1B211D]/50 uppercase tracking-tight block">
              Hex Code Color
            </label>
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

      {/* CANVAS BACKGROUND PRESETS CONTAINER */}
      <div className="bg-white p-6 rounded-2xl border border-[#1B211D]/5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Layout size={16} className="text-[#3E8F68]" />
          <h3 className="text-xs font-bold text-[#1B211D] font-display uppercase tracking-wider">
            Background Ambiance
          </h3>
        </div>
        
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
              <div 
                className="w-3 h-3 rounded-full self-end border border-black/10 transition-colors" 
                style={{ backgroundColor: themeColor }} 
              />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
