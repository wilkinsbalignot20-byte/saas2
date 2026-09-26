/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/dashboard/[slug]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { RefreshCw, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client'; // Eksaktong import base sa export mo
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import RecentOrdersTable from '@/components/dashboard/RecentOrdersTable';

const supabase = createClient(); // Tinawag ang Browser Client mo

export default function SellerMainDashboard() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ grossSales: 0, totalOrders: 0, shippedOrders: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardAnalytics = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return router.push('/login');

        // MULTI-TENANT PROTECTION GATE
        const { data: store, error: storeError } = await supabase
          .from('stores')
          .select('id, slug, owner_id')
          .eq('slug', slug)
          .maybeSingle();

        if (storeError || !store || store.owner_id !== session.user.id) {
          return router.push('/login');
        }

        // FETCH STORE ORDERS
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('id, total_amount, status, created_at')
          .eq('store_id', store.id);

        if (!ordersError && orders) {
          const gross = orders
            .filter(o => o.status === 'completed' || o.status === 'shipped')
            .reduce((sum, o) => sum + Number(o.total_amount), 0);

          const shipped = orders.filter(o => o.status === 'shipped').length;

          setMetrics({ grossSales: gross, totalOrders: orders.length, shippedOrders: shipped });
          setRecentOrders([...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5));
        }
      } catch (err) {
        console.error('Analytics fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchDashboardAnalytics();
  }, [router, slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F5F1] text-[#1B211D]">
        <div className="text-sm flex items-center gap-3 text-[#1B211D]/40 animate-pulse">
          <RefreshCw size={16} className="animate-spin" />
          <span>Loading your dashboard…</span>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 bg-[#F6F5F1] text-[#1B211D] overflow-y-auto min-h-screen animate-in fade-in duration-200">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1B211D]/5 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[#1B211D]">
            Overview — @{slug}
          </h1>
          <p className="text-sm text-[#1B211D]/50">How your store is performing right now.</p>
        </div>

        <Link
          href={`/store/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-[#1B211D]/15 text-[#1B211D] font-medium px-4 py-2.5 rounded-xl text-sm hover:bg-[#1B211D]/5 active:scale-[0.98] transition-all select-none"
        >
          <span>View storefront</span>
          <ExternalLink size={14} strokeWidth={1.75} />
        </Link>
      </div>

      <DashboardMetrics 
        grossSales={metrics.grossSales} 
        totalOrders={metrics.totalOrders} 
        shippedOrders={metrics.shippedOrders} 
      />

      <RecentOrdersTable orders={recentOrders} slug={slug} />
    </main>
  );
}
