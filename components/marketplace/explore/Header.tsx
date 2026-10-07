 'use client';

import Link from 'next/link';
import { Store } from 'lucide-react';

interface HeaderProps {
  brandName: string;
}

export default function Header({ brandName }: HeaderProps) {
  return (
    <header className="w-full border-b border-[#1B211D]/10 bg-white/90 py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* BRAND LOGO / NAME */}
        <Link
          href="/shop/explore"
          className="flex items-center gap-2.5 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3E8F68]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B211D] text-white">
            <span className="text-sm font-bold">{brandName.charAt(0)}</span>
          </div>
          <span className="text-base font-bold tracking-tight text-[#1B211D]">{brandName}</span>
        </Link>

        {/* RIGHT SIDE ACTION ONLY */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-[#3E8F68] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#2D4A3B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3E8F68]"
        >
          <Store size={14} />
          <span>Magbukas ng tindahan</span>
        </Link>
      </div>
    </header>
  );
}