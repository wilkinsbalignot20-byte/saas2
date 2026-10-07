 'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';

// I-import ang apat na maliliit na sub-components na gagawin natin isa-isa
import ThemeAndBackgroundSelector from './ThemeAndBackgroundSelector';
import CloudinaryMediaManager from './CloudinaryMediaManager';
import LiveStudioMonitor from './LiveStudioMonitor';
import FormNotificationPanel from './FormNotificationPanel';

interface StoreData {
  id: string;
  name: string;
  slug: string;
  themeColor: string;
  logoUrl: string | null;
  backgroundPreset: string;
}

export default function StorefrontDesignForm({ store }: { store: StoreData }) {
  const router = useRouter();

  // MGA CORE STATES NA IPAPASA SA MGA SUB-COMPONENTS
  const [themeColor, setThemeColor] = useState(store.themeColor);
  const [backgroundPreset, setBackgroundPreset] = useState(store.backgroundPreset);
  const [bannerUrl, setBannerUrl] = useState((store as any).bannerUrl || '');
  const [promoVideoUrl, setPromoVideoUrl] = useState((store as any).promoVideoUrl || '');
  const [promoText, setPromoText] = useState((store as any).promoText || '');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSaveDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/stores/${store.slug}/design`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeColor,
          backgroundPreset,
          logoUrl: store.logoUrl || null,
          bannerUrl: bannerUrl.trim() || null,
          promoVideoUrl: promoVideoUrl.trim() || null,
          promoText: promoText.trim() || null
        })
      });

      if (!response.ok) throw new Error('Failed to update storefront design settings.');

      setSuccessMessage('Storefront branding layout successfully deployed to your live shop!');
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving the design data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSaveDesign} className="space-y-8 max-w-5xl">
      
      {/* 1. MGA NOTIFICATION ALERTS */}
      <FormNotificationPanel error={errorMessage} success={successMessage} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KALIWANG HALIGI: MGA CONTROL INPUTS */}
        <div className="lg:col-span-2 space-y-6">
          {/* 2. KULAY AT BACKGROUND SELECTION MODULE */}
          <ThemeAndBackgroundSelector 
            themeColor={themeColor} setThemeColor={setThemeColor}
            backgroundPreset={backgroundPreset} setBackgroundPreset={setBackgroundPreset}
          />

          {/* 3. CLOUDINARY IMAGE AT VIDEO MODULE */}
          <CloudinaryMediaManager 
            bannerUrl={bannerUrl} setBannerUrl={setBannerUrl}
            promoVideoUrl={promoVideoUrl} setPromoVideoUrl={setPromoVideoUrl}
            promoText={promoText} setPromoText={setPromoText}
          />

          {/* ACTION SUBMIT BUTTON */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-[#3E8F68] text-white font-medium rounded-xl hover:bg-[#327454] transition-all disabled:opacity-50 text-sm cursor-pointer shadow-xs"
            >
              <Save size={16} />
              {loading ? 'Sina-save...' : 'Save & Deploy Layout Branding'}
            </button>
          </div>
        </div>

        {/* KANANG HALIGI: REAL-TIME PREVIEW WIDGET */}
        <div className="lg:col-span-1">
          {/* 4. LIVE MONITOR PREVIEW MODULE */}
          <LiveStudioMonitor 
            storeName={store.name} themeColor={themeColor}
            backgroundPreset={backgroundPreset} bannerUrl={bannerUrl}
            promoVideoUrl={promoVideoUrl} promoText={promoText}
          />
        </div>

      </div>
    </form>
  );
}
