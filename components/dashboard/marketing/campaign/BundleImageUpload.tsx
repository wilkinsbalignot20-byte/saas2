// components/dashboard/marketing/campaign/BundleImageUpload.tsx
"use client";

import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, Trash2 } from "lucide-react";

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export default function BundleImageUpload({ value, onChange }: Props) {
  return (
    <div className="space-y-1.5 lg:col-span-2 animate-in fade-in slide-in-from-top-1 duration-150">
      <span className="block text-sm font-medium text-slate-700">Bundle Promotional Image</span>

      {value ? (
        <div className="relative w-full h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-w-xl">
          <img src={value} alt="Bundle Promo Banner" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors shadow-xs cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ) : (
        <CldUploadWidget
          signatureEndpoint="/api/sign-cloudinary"
          options={{
            maxFiles: 1,
            folder: "storefront",
            clientAllowedFormats: ["png", "jpeg", "webp"],
          }}
          onSuccess={(result) => {
            if (result?.info && typeof result.info !== "string") {
              const url = result.info.secure_url;
              if (url) onChange(url);
            }
          }}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className="w-full h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition bg-white gap-1 max-w-xl shadow-2xs"
            >
              <ImagePlus size={18} className="text-slate-400" />
              <span className="text-[11px] text-slate-400 font-semibold">Upload Bundle Display Cover</span>
            </button>
          )}
        </CldUploadWidget>
      )}
    </div>
  );
}