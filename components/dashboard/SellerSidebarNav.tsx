// components/dashboard/SellerSidebarNav.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Icons from 'lucide-react';
import { NavGroup, NavItem } from '@/constants/navigation';

// Helper para i-map ang string icon name mula sa constants papunta sa aktwal na Lucide Component
const IconRenderer = ({ name, size = 18 }: { name: string; size?: number }) => {
  // Mapping base sa icons na ginamit mo sa constants
  const iconMap: Record<string, keyof typeof Icons> = {
    dashboard: 'LayoutDashboard',
    package: 'Package',
    receipt: 'Receipt',
    truck: 'Truck',
    wallet: 'Wallet',
    tag: 'Tag',
    chart: 'BarChart3',
    chat: 'MessageSquare',
    cpu: 'Cpu',
    file: 'FileText',
  };

  const LucideIcon = Icons[iconMap[name] || 'HelpCircle'] as React.ComponentType<{ size: number; strokeWidth: number }>;
  return <LucideIcon size={size} strokeWidth={1.75} />;
};

interface SellerSidebarNavProps {
  groups: NavGroup[];
}

export default function SellerSidebarNav({ groups }: SellerSidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-5 flex-1 overflow-y-auto pr-1 select-none">
      {groups.map((group) => (
        <div key={group.label} className="space-y-1.5">
          {/* Group Label */}
          <h4 className="px-3 font-display text-[10px] font-bold uppercase tracking-wider text-[#4A5950]">
            {group.label}
          </h4>

          {/* Group Items */}
          <ul className="space-y-0.5">
            {group.items.map((item: NavItem) => {
              // Tumpak na active state checker para sa Next.js sub-pages
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                      isActive
                        ? 'bg-[#3E8F68] text-white font-semibold'
                        : 'text-[#A7B1AB] hover:bg-[#1B2620] hover:text-[#EDEDE8]'
                    }`}
                  >
                    <IconRenderer name={item.icon} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
