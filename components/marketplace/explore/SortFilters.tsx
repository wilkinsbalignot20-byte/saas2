 'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface SortOption {
  key: string;
  label: string;
}

interface SortFiltersProps {
  sortOptions: SortOption[];
  currentSort: string;
}

export default function SortFilters({ sortOptions, currentSort }: SortFiltersProps) {
  const searchParams = useSearchParams();

  // Dito sa loob mismo ng Client component bubuuin ang link para iwas sa serializable error
  const getFilterHref = (filterKey: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // Palitan o i-set ang active filter parameter
    if (filterKey && filterKey !== 'new') {
      params.set('filter', filterKey);
    } else {
      params.delete('filter'); // I-clear kapag default ('new')
    }

    return `/shop/explore?${params.toString()}`;
  };

  return (
    <div
      className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
      role="group"
      aria-label="I-filter ang mga produkto"
    >
      {sortOptions.map((s) => {
        const isActive = currentSort === s.key;

        return (
          <Link
            key={s.key}
            href={getFilterHref(s.key)} // Ginamit ang lokal na tagabuo ng URL link
            aria-current={isActive ? 'true' : undefined}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3E8F68] ${
              isActive
                ? 'bg-[#1B211D] text-white'
                : 'bg-white text-[#1B211D]/70 ring-1 ring-[#1B211D]/10 hover:text-[#1B211D] hover:ring-[#1B211D]/25'
            }`}
          >
            {s.label}
          </Link>
        );
      })}
    </div>
  );
}