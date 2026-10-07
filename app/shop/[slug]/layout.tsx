 // app/shop/layout.tsx
import { ReactNode } from 'react';
import { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';

const font = Plus_Jakarta_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Marketplace Storefronts',
  description: 'Explore multi-tenant custom stores',
};

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${font.className} min-h-screen antialiased bg-[#F6F5F1] text-[#1B211D]`}>
      {children}
    </div>
  );
}