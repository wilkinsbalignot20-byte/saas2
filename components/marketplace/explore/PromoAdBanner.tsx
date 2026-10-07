 'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const PROMO_DATA = [
  {
    id: 1,
    title: 'Premium Kicks & Shoes',
    image: 'https://images.unsplash.com/photo-1650966133152-0f927cd773ad?q=80&w=1448&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    href: '/shop/explore',
  },
  {
    id: 2,
    title: 'Modern Streetwear Hoodies',
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Z3JhcGhpYyUyMGRlc2lnbnxlbnwwfHwwfHx8MA%3D%3D',
    href: '/shop/explore',
  },
];

export default function PromoAdBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PROMO_DATA.length);
    }, 30000); // 30 segundo loop
    return () => clearInterval(timer);
  }, []);

  const current = PROMO_DATA[currentIndex];

  return (
    <div className="mt-6 block w-full">
      <h4 className="mb-2 px-1 text-xs font-semibold text-[#1B211D]/45">Espesyal na alok</h4>
      <Link
        href={current.href}
        className="relative block aspect-[4/5] w-full overflow-hidden rounded-xl bg-[#1B211D] ring-1 ring-[#1B211D]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3E8F68]"
      >
        <img src={current.image} alt={current.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/75 via-black/10 to-transparent p-4">
          <span className="mb-1.5 inline-block self-start rounded-md bg-[#3E8F68] px-2 py-0.5 text-[11px] font-semibold text-white">
            Buy now
          </span>
          <h5 className="truncate text-sm font-semibold text-white">{current.title}</h5>
        </div>
      </Link>
    </div>
  );
}