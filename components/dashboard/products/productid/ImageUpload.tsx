 // components/dashboard/ImageUpload.tsx
'use client';

import { CldUploadWidget } from 'next-cloudinary';
import { ImagePlus, Trash2 } from 'lucide-react';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  
  // LOHIKA: Pagtanggal ng Larawan sa listahan
  const handleRemove = (urlToRemove: string) => {
    onChange(value.filter((url) => url !== urlToRemove));
  };

  return (
    <div className="space-y-4">
      <label className="text-xs font-semibold text-[#1B211D]/70 block">Product Images</label>
      
      {/* GRID NG MGA PICTURE PREVIEWS */}
      <div className="flex flex-wrap gap-4">
        {value.map((url) => (
          <div key={url} className="relative w-24 h-24 rounded-xl overflow-hidden border border-[#1B211D]/10 bg-[#F6F5F1]">
            <img src={url} alt="Product preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(url)}
              className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors shadow-sm cursor-pointer"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}

        {/* ANG OPISYAL NA CLOUDINARY WIDGET WUPPER */}
        <CldUploadWidget
          signatureEndpoint="/api/sign-cloudinary" // ➔ Awtomatikong tatawagin ang POST API mo dito!
          options={{
            maxFiles: 5,
            folder: 'products', // ➔ Dito natin iuutos na pumasok sa products folder!
            clientAllowedFormats: ['png', 'jpeg', 'webp'],
          }}
          onSuccess={(result) => {
            if (result?.info && typeof result.info !== 'string') {
              const secureUrl = result.info.secure_url;
              if (secureUrl) {
                onChange([...value, secureUrl]); // Ipadala ang bagong url sa main form state
              }
            }
          }}
        >
          {({ open }) => {
            return (
              <button
                type="button"
                onClick={() => open()} // ➔ Bubuksan nito ang Cloudinary Modal kapag clinick
                className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-[#1B211D]/10 rounded-xl cursor-pointer hover:bg-[#F6F5F1]/50 transition-colors relative bg-white"
              >
                <ImagePlus size={20} className="text-[#1B211D]/40" />
                <span className="text-[10px] text-[#1B211D]/40 font-medium mt-1">Upload</span>
              </button>
            );
          }}
        </CldUploadWidget>
      </div>
    </div>
  );
}
