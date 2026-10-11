'use client';

import { CldUploadWidget } from 'next-cloudinary';
import { ImagePlus, RefreshCw } from 'lucide-react';

interface PhotoUploaderProps {
  imageUrl: string;
  onUploaded: (url: string) => void;
  alt?: string;
  emptyLabel?: string;
  className?: string;
}

/**
 * Cloudinary upload tile.
 * - Walang larawan: dashed dropzone.
 * - May larawan: buong preview ng product photo, may "Change photo" button.
 * Parehong options at onSuccess handling gaya ng dati.
 */
export default function PhotoUploader({
  imageUrl,
  onUploaded,
  alt = 'Uploaded photo',
  emptyLabel = 'Upload photo',
  className = '',
}: PhotoUploaderProps) {
  return (
    <CldUploadWidget
      signatureEndpoint="/api/sign-cloudinary"
      options={{ maxFiles: 1, folder: 'bundles', clientAllowedFormats: ['png', 'jpeg', 'webp'] }}
      onSuccess={(result) => {
        if (result?.info && typeof result.info !== 'string') {
          const secureUrl = result.info.secure_url;
          if (secureUrl) onUploaded(secureUrl);
        }
      }}
    >
      {({ open }) =>
        imageUrl ? (
          <div
            className={`group relative aspect-square w-full overflow-hidden rounded-xl border border-[#1B211D]/10 bg-[#F6F5F1] ${className}`}
          >
            <img src={imageUrl} alt={alt} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => open()}
              className="absolute inset-x-2 bottom-2 inline-flex cursor-pointer select-none items-center justify-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#1B211D] shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B211D]"
            >
              <RefreshCw size={12} />
              <span>Change photo</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => open()}
            className={`group flex aspect-square w-full cursor-pointer select-none flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#1B211D]/20 bg-[#F6F5F1]/60 px-3 text-center transition hover:border-[#1B211D]/50 hover:bg-[#F6F5F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B211D] ${className}`}
          >
            <span className="rounded-lg border border-[#1B211D]/10 bg-white p-2.5 text-[#1B211D]/60 shadow-sm transition group-hover:text-[#1B211D]">
              <ImagePlus size={18} />
            </span>
            <span className="text-xs font-semibold text-[#1B211D]/70 group-hover:text-[#1B211D]">{emptyLabel}</span>
            <span className="text-[11px] text-[#1B211D]/40">PNG, JPG or WebP</span>
          </button>
        )
      }
    </CldUploadWidget>
  );
}