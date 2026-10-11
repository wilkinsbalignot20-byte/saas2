 import { ImagePlus, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  imageUrl: string;
  onUpload: () => void;
  onRemove: () => void;
}

export default function BundlePhotoCard({ imageUrl, onUpload, onRemove }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#1B211D]/10 bg-white shadow-sm">
      <div className="border-b border-[#1B211D]/5 px-5 py-3">
        <h3 className="text-sm font-semibold text-[#1B211D]">Bundle group photo</h3>
      </div>

      <div className="space-y-3 p-5">
        {imageUrl ? (
          <div className="space-y-3">
            <div className="aspect-square w-full overflow-hidden rounded-xl border border-[#1B211D]/10 bg-[#F6F5F1]">
              <img src={imageUrl} alt="Bundle preview" className="h-full w-full object-cover" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onUpload}
                className="inline-flex cursor-pointer select-none items-center justify-center gap-1.5 rounded-lg border border-[#1B211D]/10 bg-white px-3 py-2 text-xs font-semibold text-[#1B211D] transition hover:bg-[#F6F5F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B211D]"
              >
                <RefreshCw size={12} />
                <span>Change</span>
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="inline-flex cursor-pointer select-none items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                <Trash2 size={12} />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onUpload}
            className="group flex aspect-square w-full cursor-pointer select-none flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#1B211D]/20 bg-[#F6F5F1]/60 transition hover:border-[#1B211D]/50 hover:bg-[#F6F5F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B211D]"
          >
            <span className="rounded-lg border border-[#1B211D]/10 bg-white p-2.5 text-[#1B211D]/60 shadow-sm transition group-hover:text-[#1B211D]">
              <ImagePlus size={20} />
            </span>
            <span className="text-xs font-semibold text-[#1B211D]/70 group-hover:text-[#1B211D]">Upload promo picture</span>
            <span className="text-[11px] text-[#1B211D]/40">PNG, JPG or WebP</span>
          </button>
        )}

        <p className="text-[11px] leading-relaxed text-[#1B211D]/40">
          Used to display multi-flavor packs or mix-and-match deals.
        </p>
      </div>
    </div>
  );
}