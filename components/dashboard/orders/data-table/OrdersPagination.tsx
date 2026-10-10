// components/dashboard/orders/data-table/OrdersPagination.tsx
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PAGE_SIZE } from "./constants";

interface Props {
  start: number;
  total: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const btn =
  "inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900";

export default function OrdersPagination({ start, total, currentPage, totalPages, onPageChange }: Props) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:px-6">
      <p className="tabular-nums">
        Showing <span className="font-medium text-slate-900 dark:text-white">{start + 1}</span> to{" "}
        <span className="font-medium text-slate-900 dark:text-white">{Math.min(start + PAGE_SIZE, total)}</span> of{" "}
        <span className="font-medium text-slate-900 dark:text-white">{total}</span> orders
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={btn}>
            <ChevronLeft size={16} aria-hidden /> Prev
          </button>
          <span className="px-1 tabular-nums">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={btn}
          >
            Next <ChevronRight size={16} aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}