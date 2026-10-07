 'use client';

import Link from 'next/link';
import { Search, Bell, MessageSquare, History, ShoppingCart } from 'lucide-react';

interface SearchFormProps {
  defaultValue: string;
  sort: string;
}

export default function SearchForm({ defaultValue, sort }: SearchFormProps) {
  return (
    <div className="w-full flex items-center gap-2 sm:gap-4 bg-transparent">
      
      {/* PANGUNAHING SEARCH CONTAINER */}
      <form 
        action="/shop/explore" 
        method="GET" 
        role="search" 
        className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2 rounded-2xl border border-[#1B211D]/10 bg-white p-1 sm:p-1.5 shadow-sm focus-within:border-[#3E8F68] focus-within:ring-4 focus-within:ring-[#3E8F68]/15"
      >
        <Search size={16} className="ml-2.5 shrink-0 text-[#1B211D]/40 hidden xs:block" aria-hidden />
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder="Maghanap..."
          aria-label="Maghanap ng produkto"
          className="min-w-0 flex-1 bg-transparent px-1.5 py-2 text-xs sm:text-sm outline-none placeholder:text-[#1B211D]/35"
        />
        {sort !== 'newest' && <input type="hidden" name="sort" value={sort} />}
        
        {/* BUTTON: Sa desktop mahaba, sa mobile maliit o icon-style para tipid sa space */}
        <button
          type="submit"
          className="rounded-xl bg-[#1B211D] px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-[#2D4A3B] shrink-0"
        >
          Hanapin
        </button>
      </form>

      {/* MGA UTILITY ICONS: Nakadikit at kapantay na ng search bar sa iisang linya, walang patong! */}
      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 bg-white p-1 sm:p-1.5 rounded-2xl border border-[#1B211D]/5 shadow-sm h-full">
        
        {/* 1. CHAT */}
        <Link 
          href="/shop/chat" 
          className="relative p-2 rounded-xl text-[#1B211D]/70 hover:bg-[#F4F6F3] hover:text-[#1B211D] transition-colors"
          aria-label="Mga Mensahe"
        >
          <MessageSquare size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#3E8F68]" />
        </Link>

        {/* 2. NOTIFICATIONS */}
        <Link 
          href="/shop/notifications" 
          className="relative p-2 rounded-xl text-[#1B211D]/70 hover:bg-[#F4F6F3] hover:text-[#1B211D] transition-colors"
          aria-label="Mga Abiso"
        >
          <Bell size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
            3
          </span>
        </Link>

        {/* 3. HISTORY */}
        <Link 
          href="/shop/history" 
          className="p-2 rounded-xl text-[#1B211D]/70 hover:bg-[#F4F6F3] hover:text-[#1B211D] transition-colors"
          aria-label="History ng mga Order"
        >
          <History size={16} className="sm:w-[18px] sm:h-[18px]" />
        </Link>

        {/* 4. SHOPPING CART */}
        <Link 
          href="/shop/cart" 
          className="relative p-2 rounded-xl text-[#1B211D]/70 hover:bg-[#F4F6F3] hover:text-[#1B211D] transition-colors"
          aria-label="Shopping Cart"
        >
          <ShoppingCart size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#3E8F68] text-[8px] font-bold text-white shadow-sm">
            0
          </span>
        </Link>

      </div>

    </div>
  );
}
