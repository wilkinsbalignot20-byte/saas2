 // app/shop/layout.tsx
import { ReactNode } from 'react';
import { Metadata } from 'next'; // <-- 1. IDINAGDAG ITONG IMPORT NA ITO

// 2. INAPPLY ANG "Metadata" TYPE DITO SA OBJECT
export const metadata: Metadata = {
  title: 'Marketplace Storefronts',
  description: 'Explore multi-tenant custom stores',
};

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen antialiased bg-[#F6F5F1] text-[#1B211D]">
      {children}
    </div>
  );
}
