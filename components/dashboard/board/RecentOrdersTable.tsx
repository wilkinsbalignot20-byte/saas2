// components/dashboard/RecentOrdersTable.tsx
import { Activity, ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
}

interface RecentOrdersTableProps {
  orders: Order[];
  slug: string;
}

export default function RecentOrdersTable({ orders, slug }: RecentOrdersTableProps) {
  const router = useRouter();

  return (
    <div className="bg-white border border-[#1B211D]/10 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-[#1B211D]/5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-[#1B211D]/40" strokeWidth={1.75} />
          <h3 className="text-sm font-semibold text-[#1B211D]/70">Recent orders</h3>
        </div>
        <button
          onClick={() => router.push(`/dashboard/${slug}/order`)}
          className="text-sm font-medium text-[#1B211D]/50 hover:text-[#1B211D] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View all</span> <ArrowUpRight size={13} strokeWidth={1.75} />
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 text-center text-sm text-[#1B211D]/35">
          No orders yet. Share your store link to start getting sales.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#F6F5F1] text-[#1B211D]/40 text-xs font-medium border-b border-[#1B211D]/5">
                <th className="py-3.5 px-6 font-medium">Order</th>
                <th className="py-3.5 px-6 font-medium">Date</th>
                <th className="py-3.5 px-6 font-medium">Total</th>
                <th className="py-3.5 px-6 font-medium">Status</th>
                <th className="py-3.5 px-6 font-medium text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B211D]/5 text-[#1B211D]/80">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-[#F6F5F1]/60 transition-colors">
                  <td className="py-4 px-6 font-mono text-xs text-[#1B211D]/60">
                    #{order.id.substring(0, 8).toUpperCase()}
                  </td>
                  <td className="py-4 px-6 text-[#1B211D]/50 text-sm">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="py-4 px-6 font-semibold text-[#1B211D]">
                    ₱{Number(order.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium text-xs ${
                      order.status === 'completed' ? 'bg-[#3E8F68]/10 text-[#3E8F68]' :
                      order.status === 'shipped' ? 'bg-[#C2760C]/10 text-[#C2760C]' :
                      order.status === 'cancelled' ? 'bg-rose-50 text-rose-600' :
                      'bg-[#1B211D]/5 text-[#1B211D]/50'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        order.status === 'completed' ? 'bg-[#3E8F68]' :
                        order.status === 'shipped' ? 'bg-[#C2760C]' :
                        order.status === 'cancelled' ? 'bg-rose-500' :
                        'bg-[#1B211D]/30'
                      }`} />
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => router.push(`/dashboard/${slug}/order/${order.id}`)}
                      className="inline-flex items-center gap-1 border border-[#1B211D]/10 hover:bg-[#17221C] hover:text-[#EDEDE8] hover:border-[#17221C] text-[#1B211D]/60 font-medium px-3 py-1.5 rounded-lg text-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Manage</span>
                      <ArrowUpRight size={12} strokeWidth={1.75} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
