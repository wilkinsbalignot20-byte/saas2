// app/shop/error.tsx
'use client'; // <-- ITO ANG KRITIKAL NA LINE NA NAG-SULAT NG ERROR SA BUILD MO!

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ShopError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // I-log ang error sa terminal o analytics controller para sa debugging
    console.error('SHOP BOUNDARY CRASH ERROR:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F5F1] p-6 text-center">
      <div className="space-y-4 max-w-md">
        <h2 className="text-xl font-bold text-[#1B211D] font-display">
          May kaunting problema sa pagkarga...
        </h2>
        <p className="text-xs text-[#1B211D]/50 leading-relaxed">
          Hindi namin maipakita ang produkto o tindahan sa ngayon. Maaaring may aberya sa koneksyon ng database sa Supabase.
        </p>
        
        <div className="pt-2">
          <button
            type="button"
            onClick={() => reset()} // Susubukan nitong i-render ulit ang page nang hindi nagre-refresh ang browser
            className="inline-flex items-center gap-2 bg-[#1B211D] text-white font-medium px-5 py-2.5 rounded-xl text-xs hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer select-none"
          >
            Subukan Ulit
          </button>
        </div>
      </div>
    </div>
  );
}
