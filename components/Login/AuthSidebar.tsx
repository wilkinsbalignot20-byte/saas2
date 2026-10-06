 // components/AuthSidebar.tsx
"use client";

import Link from 'next/link';
import { ACTIVE_VIDEOS } from '@/constants/media'; // ⬅️ Tumuturo din sa central file

export default function AuthSidebar() {
  return (
    <div className="hidden lg:flex relative bg-ink text-paper p-12 flex-col justify-between overflow-hidden">
      <video
        src={ACTIVE_VIDEOS.shoes2}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20 z-10" />

      <div className="relative z-20">
        <Link href="/" className="font-display font-bold text-2xl tracking-tight text-paper hover:opacity-80 transition-opacity">
          Manipu
        </Link>
      </div>

      <div className="relative z-20 max-w-md">
        <span className="text-xs font-semibold uppercase tracking-wider text-marigold bg-paper/10 px-3 py-1 rounded-full backdrop-blur-sm">
          Seller Portal
        </span>
        <h1 className="font-display font-bold text-4xl mt-4 mb-3 leading-tight text-paper">
          Manage your store like a pro.
        </h1>
        <p className="text-paper/70 text-sm leading-relaxed">
          Monitor your sales, print shipping labels for J&amp;T and Flash, and withdraw your earnings — all from one dashboard.
        </p>
      </div>
    </div>
  );
}
