 'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Shirt, Gem, Sparkles, Bike, Home, GraduationCap, ShoppingBag, PackageCheck, Menu, X } from 'lucide-react';
import PromoAdBanner from './PromoAdBanner';

const MAJOR_CATEGORIES = [
  { name: 'Fashion & Apparel', slug: 'fashion-apparel', icon: Shirt },
  { name: 'Jewelry & Accessories', slug: 'jewelry-accessories', icon: Gem },
  { name: 'Health & Beauty', slug: 'health-beauty', icon: Sparkles },
  { name: 'Automotive & Rider Gears', slug: 'automotive-rider-gears', icon: Bike },
  { name: 'Home, Hardware & Kitchen', slug: 'home-hardware-kitchen', icon: Home },
  { name: 'Stationery & School Supplies', slug: 'school-supplies', icon: GraduationCap },
  { name: 'Groceries & Dry Foods', slug: 'groceries-dry-foods', icon: ShoppingBag },
];

const linkBase =
  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3E8F68]';
const linkActive = 'bg-white font-semibold text-[#1B211D] ring-1 ring-[#1B211D]/10';
const linkIdle = 'font-medium text-[#1B211D]/65 hover:bg-white/70 hover:text-[#1B211D]';

export default function CategorySidebar() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || '';
  const [isOpen, setIsOpen] = useState(false);

  // Content para sa listahan ng mga kategorya
  const SidebarContent = () => (
    <div className="space-y-3">
      <h3 className="px-3 text-sm font-semibold text-[#1B211D]">Mga Kategorya</h3>
      <nav className="space-y-0.5">
        <Link
          href="/shop/explore"
          onClick={() => setIsOpen(false)}
          className={`${linkBase} ${!currentCategory ? linkActive : linkIdle}`}
        >
          <PackageCheck size={18} className={!currentCategory ? 'text-[#3E8F68]' : 'text-[#1B211D]/40'} />
          <span>Lahat ng Produkto</span>
        </Link>
        {MAJOR_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = currentCategory === cat.slug;
          return (
            <Link
              key={cat.slug}
              href={`/shop/explore?category=${cat.slug}`}
              onClick={() => setIsOpen(false)}
              className={`${linkBase} ${isActive ? linkActive : linkIdle}`}
            >
              <Icon size={18} className={isActive ? 'text-[#3E8F68]' : 'text-[#1B211D]/40'} />
              <span>{cat.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* 1. MOBILE ONLY TRIGGER BUTTON */}
      <div className="w-full md:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-between rounded-xl border border-[#1B211D]/10 bg-white px-4 py-3 text-left transition-colors hover:border-[#1B211D]/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3E8F68]"
        >
          <span className="text-sm font-semibold text-[#1B211D]">I-filter ayon sa Kategorya</span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#3E8F68]">
            <Menu size={14} />
            Piliin
          </span>
        </button>
      </div>

      {/* 2. MOBILE DRAWER MENU */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 md:hidden" onClick={() => setIsOpen(false)}>
          <div
            className="absolute left-0 top-0 flex h-full w-72 max-w-[85%] flex-col justify-between overflow-y-auto bg-[#F4F6F3] p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="mb-5 flex items-center justify-between">
                <span className="text-base font-bold tracking-tight text-[#1B211D]">Manipu</span>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Isara"
                  className="rounded-lg p-1.5 text-[#1B211D]/60 transition-colors hover:bg-white hover:text-[#1B211D]"
                >
                  <X size={20} />
                </button>
              </div>
              <SidebarContent />
            </div>

            {/* Ligtas na ilalagay ang banner sa pinaka-baba ng mobile menu drawer */}
            <div className="mt-8 border-t border-[#1B211D]/10 pt-2">
              <PromoAdBanner />
            </div>
          </div>
        </div>
      )}

      {/* 3. DESKTOP VIEW PANEL */}
      <aside className="sticky top-20 hidden w-60 shrink-0 self-start md:block">
        <SidebarContent />
        <PromoAdBanner />
      </aside>
    </>
  );
}