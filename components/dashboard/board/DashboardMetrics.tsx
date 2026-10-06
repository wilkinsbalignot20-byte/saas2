// components/dashboard/DashboardMetrics.tsx
import { DollarSign, ShoppingBag, Truck } from 'lucide-react';

interface MetricsProps {
  grossSales: number;
  totalOrders: number;
  shippedOrders: number;
}

export default function DashboardMetrics({ grossSales, totalOrders, shippedOrders }: MetricsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* REVENUE HERO */}
      <div className="lg:col-span-2 bg-[#17221C] text-[#EDEDE8] rounded-2xl p-8 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <span className="text-sm text-[#EDEDE8]/50">Gross sales</span>
          <DollarSign size={18} className="text-[#4FAE7E]" strokeWidth={1.75} />
        </div>
        <div className="font-display font-bold text-4xl md:text-5xl tracking-tight mt-4">
          ₱{grossSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-dashed border-[#EDEDE8]/15">
          <p className="text-sm text-[#EDEDE8]/40">From completed and shipped orders</p>
        </div>
      </div>

      {/* STAT STRIP */}
      <div className="bg-white border border-[#1B211D]/10 rounded-2xl divide-y divide-dashed divide-[#1B211D]/10 flex flex-col">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <ShoppingBag size={16} className="text-[#1B211D]/40" strokeWidth={1.75} />
            <div>
              <p className="text-sm text-[#1B211D]/50">Total orders</p>
              <p className="text-xs text-[#1B211D]/35">All orders logged to date</p>
            </div>
          </div>
          <span className="font-display font-bold text-xl text-[#1B211D]">{totalOrders}</span>
        </div>

        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <Truck size={16} className="text-[#C2760C]" strokeWidth={1.75} />
            <div>
              <p className="text-sm text-[#1B211D]/50">Shipped</p>
              <p className="text-xs text-[#1B211D]/35">Currently in transit</p>
            </div>
          </div>
          <span className="font-display font-bold text-xl text-[#C2760C]">{shippedOrders}</span>
        </div>
      </div>
    </div>
  );
}
