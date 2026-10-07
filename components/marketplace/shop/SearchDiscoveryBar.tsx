 // components/marketplace/shop/SearchDiscoveryBar.tsx
import { Search } from 'lucide-react';

interface SearchDiscoveryBarProps {
  storeName: string;
  productCount: number;
}

export default function SearchDiscoveryBar({ storeName, productCount }: SearchDiscoveryBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1B211D]/10">
      <div className="flex items-baseline gap-2">
        <h2 className="text-xl font-bold tracking-tight text-[#1B211D]">Our Products</h2>
        <span className="text-sm text-[#1B211D]/50">{productCount} items</span>
      </div>

      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1B211D]/40" />
        <input
          type="text"
          placeholder={`Maghanap sa ${storeName}...`}
          className="w-full bg-white border border-[#1B211D]/15 rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-[#1B211D]/40 focus:outline-none focus:ring-2 focus:ring-[#1B211D]/20 transition"
        />
      </div>
    </div>
  );
}