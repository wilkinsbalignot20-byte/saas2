// components/dashboard/storefront/CloudinaryMediaManager.tsx
'use client';

import { CldUploadWidget } from 'next-cloudinary';
import { ImagePlus, Video, Trash2, Megaphone } from 'lucide-react';

interface CloudinaryMediaManagerProps {
  bannerUrl: string;
  setBannerUrl: (url: string) => void;
  promoVideoUrl: string;
  setPromoVideoUrl: (url: string) => void;
  promoText: string;
  setPromoText: (text: string) => void;
}

export default function CloudinaryMediaManager({
  bannerUrl, setBannerUrl,
  promoVideoUrl, setPromoVideoUrl,
  promoText, setPromoText
}: CloudinaryMediaManagerProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#1B211D]/5 shadow-xs space-y-6">
      
      {/* HEADER SECTION */}
      <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
        <Megaphone size={16} className="text-[#3E8F68]" />
        <h3 className="text-xs font-bold text-[#1B211D] font-display uppercase tracking-wider">
          Storefront Media & Marketing (Cloudinary)
        </h3>
      </div>

      {/* TWO COLUMN GRID FOR IMAGE AND VIDEO MEDIA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* A. CLOUDINARY HERO COVERS BANNER UPLOADER (SINGLE MODE) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#1B211D]/70 block">Hero Cover Banner</label>
          {bannerUrl ? (
            <div className="relative w-full h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              <img src={bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setBannerUrl('')}
                className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors shadow-sm cursor-pointer"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ) : (
            <CldUploadWidget
              signatureEndpoint="/api/sign-cloudinary" // ➔ Kumokonekta sa dati mong secure route
              options={{
                maxFiles: 1,
                folder: 'storefront', // ➔ Pumasok sa storefront folder mo base sa bilin mo
                clientAllowedFormats: ['png', 'jpeg', 'webp'],
              }}
              onSuccess={(result) => {
                if (result?.info && typeof result.info !== 'string') {
                  const url = result.info.secure_url;
                  if (url) setBannerUrl(url); // I-bato sa main state wrapper
                }
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="w-full h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors bg-white gap-1"
                >
                  <ImagePlus size={18} className="text-slate-400" />
                  <span className="text-[11px] text-slate-400 font-medium">Upload Banner Photo</span>
                </button>
              )}
            </CldUploadWidget>
          )}
        </div>

        {/* B. CLOUDINARY PROMO VIDEO UPLOADER (SINGLE VIDEO MODE) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#1B211D]/70 block">Marketing Promo Video</label>
          {promoVideoUrl ? (
            <div className="relative w-full h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center">
              <video src={promoVideoUrl} className="h-full object-cover w-full" muted />
              <button
                type="button"
                onClick={() => setPromoVideoUrl('')}
                className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors shadow-sm cursor-pointer"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ) : (
            <CldUploadWidget
              signatureEndpoint="/api/sign-cloudinary"
              options={{
                maxFiles: 1,
                folder: 'video', // ➔ Pumasok sa video folder mo base sa bilin mo
                resourceType: 'video', // ➔ Pinipwersa ang uploader widget na tanggapin ay video streams
                clientAllowedFormats: ['mp4', 'mov', 'webm'],
              }}
              onSuccess={(result) => {
                if (result?.info && typeof result.info !== 'string') {
                  const url = result.info.secure_url;
                  if (url) setPromoVideoUrl(url); // I-bato sa main state wrapper
                }
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="w-full h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors bg-white gap-1"
                >
                  <Video size={18} className="text-slate-400" />
                  <span className="text-[11px] text-slate-400 font-medium">Upload Promo Video</span>
                </button>
              )}
            </CldUploadWidget>
          )}
        </div>

      </div>

      {/* C. MARKETING ANNOUNCEMENT TEXT FIELD */}
      <div className="space-y-1 pt-2">
        <label className="text-xs font-semibold text-[#1B211D]/70">Store Promotion Announcement Text</label>
        <textarea
          rows={2}
          value={promoText}
          onChange={(e) => setPromoText(e.target.value)}
          placeholder="e.g., GAMITIN ANG CODE NA MANIPU10 PARA SA 10% DISCOUNT SA IYONG CHECKOUT!"
          className="w-full bg-[#F6F5F1]/50 border border-[#1B211D]/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#3E8F68] transition-colors resize-none"
        />
      </div>

    </div>
  );
}
