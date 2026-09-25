 // app/(dashboard)/dashboard/[slug]/layout.tsx
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Settings, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/server'; // Eksaktong import base sa export mo
import { getSellerNavigation } from '@/constants/navigation';
import SellerSidebarNav from '@/components/dashboard/SellerSidebarNav';

export const metadata: Metadata = {
  title: 'Seller Center — Manipu',
  description: 'Manage your storefront, orders, and earnings in one place.',
};

interface SellerLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function SellerLayout({ children, params }: SellerLayoutProps) {
  const { slug } = await params;
  
  // Ini-invoke ang iyong async server client
  const supabase = await createClient();

  // Kunin ang active profile ng tindahan
  const { data: storeProfile } = await supabase
    .from('stores')
    .select('id, name, slug, logo_url')
    .eq('slug', slug)
    .maybeSingle();

  const displayName = storeProfile?.name ?? slug;
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const profileImage = storeProfile?.logo_url;
  const navGroups = getSellerNavigation(slug);

  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#1B211D] antialiased flex font-body">
      {/* SIDEBAR — persistent layout architecture */}
      <aside className="w-64 bg-[#17221C] text-[#EDEDE8] p-5 flex flex-col justify-between hidden md:flex shrink-0">
        <div className="space-y-6">
          <div className="space-y-3">
            <Link href={`/dashboard/${slug}`} className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#3E8F68] text-[13px] font-semibold text-white">M</span>
              <span className="font-display text-[15px] font-bold tracking-tight">
                Manipu <span className="font-normal text-[#7C8A82] text-[13px]">Seller</span>
              </span>
            </Link>

            {/* Tenant profile block */}
            <div className="flex items-center gap-2.5 rounded-lg border border-[#26332B] bg-[#1B2620] px-3 py-2.5">
              {profileImage ? (
                <img src={profileImage} alt={displayName} className="h-8 w-8 shrink-0 rounded-full object-cover border border-[#26332B]" />
              ) : (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3E8F68]/20 text-[12px] font-semibold text-[#4FAE7E]">
                  {avatarInitial}
                </span>
              )}
              <div className="min-w-0">
                <span className="block truncate text-[12.5px] font-medium text-[#EDEDE8]">{displayName}</span>
                <span className="block truncate font-mono text-[10.5px] text-[#7C8A82]">@{slug}</span>
              </div>
            </div>
          </div>

          <SellerSidebarNav groups={navGroups} />
        </div>

        {/* Footer profile & logout */}
        <div className="border-t border-[#26332B] pt-4 space-y-0.5">
          <Link href={`/dashboard/${slug}/setting`} prefetch={false} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-[#A7B1AB] transition-colors hover:bg-[#1B2620] hover:text-[#EDEDE8]">
            <Settings size={18} strokeWidth={1.75} /> Setting
          </Link>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-[#A7B1AB] transition-colors hover:bg-[#1B2620] hover:text-[#EDEDE8]">
              <LogOut size={18} strokeWidth={1.75} /> Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* RENDERED CORE VIEW PORTAL */}
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
}
