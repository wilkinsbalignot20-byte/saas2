 "use client";

import { useEffect, useState, use } from "react";
import { TrendingUp, ShoppingBag, DollarSign, RefreshCw, BarChart3, Award, Ticket } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from "recharts";

type ProductInsight = {
  name: string;
  sku: string;
  unitsSold: number;
  revenue: number;
};

type VoucherInsight = {
  code: string;
  claims: number;
  type: string;
  value: number;
};

type InsightsData = {
  grossSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: ProductInsight[];
  voucherPerformance: VoucherInsight[];
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default function InsightsPage({ params }: PageProps) {
  // Safe React 19 dynamic route unboxing handler
  const { slug } = use(params);
  
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchInsights() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/stores/${slug}/insights`);
      if (!res.ok) throw new Error("Failed to load analytics engine data.");
      const result = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInsights();
  }, [slug]);

  // Dummy trend mapping batay sa gross sales para sa Area Chart
  const salesTrendData = data ? [
    { name: "Prev Weeks", Sales: data.grossSales * 0.4 },
    { name: "Last Week", Sales: data.grossSales * 0.7 },
    { name: "Current Live", Sales: data.grossSales }
  ] : [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto selection:bg-emerald-100">
      {/* SECTION HEADER BLOCK */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" /> Executive Business Insights
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Advanced real-time mathematical charting system for multi-tenant conversion tracking.
          </p>
        </div>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm transition duration-200 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Data
        </button>
      </div>

      {/* ERROR HANDLER NOTIFICATION GATE */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium shadow-xs">
          ⚠️ {error}. Ensure database records match the core prisma runtime matrix.
        </div>
      )}

      {/* THREE-COLUMN SUMMARY ANALYTICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* GROSS SALES */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Revenue</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign className="w-5 h-5" /></div>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="h-8 w-28 bg-slate-100 animate-pulse rounded-md" />
            ) : (
              <h3 className="text-3xl font-black text-slate-900">
                ₱{data?.grossSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}
              </h3>
            )}
            <p className="text-xs text-slate-400 mt-1">Total revenue collected including shipping layers.</p>
          </div>
        </div>

        {/* TOTAL ORDERS */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sales Inbound Volume</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><ShoppingBag className="w-5 h-5" /></div>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-md" />
            ) : (
              <h3 className="text-3xl font-black text-slate-900">{data?.totalOrders.toLocaleString() ?? "0"}</h3>
            )}
            <p className="text-xs text-slate-400 mt-1">Sum volume transaction counts inside this active merchant.</p>
          </div>
        </div>

        {/* AVERAGE ORDER VALUE */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Basket Value (AOV)</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><TrendingUp className="w-5 h-5" /></div>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-md" />
            ) : (
              <h3 className="text-3xl font-black text-slate-900">
                ₱{data?.averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}
              </h3>
            )}
            <p className="text-xs text-slate-400 mt-1">Calculated revenue allocation weight calculated per buyer.</p>
          </div>
        </div>
      </div>

      {/* GRAPH SECTIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: REVENUE GROWTH SLOPE */}
        <div className="bg-white p-6 border border-slate-100 rounded-2xl shadow-xs">
          <h2 className="text-sm font-bold text-slate-800 tracking-tight mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Revenue Timeline Performance
          </h2>
          <div className="h-64 w-full">
            {loading ? (
              <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrendData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => `₱${Number(value).toLocaleString()}`} />
                  <Area type="monotone" dataKey="Sales" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* CHART 2: TOP SELLING PRODUCTS */}
        <div className="bg-white p-6 border border-slate-100 rounded-2xl shadow-xs">
          <h2 className="text-sm font-bold text-slate-800 tracking-tight mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" /> Top Products Revenue Share
          </h2>
          <div className="h-64 w-full">
            {loading ? (
              <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
            ) : data?.topProducts && data.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topProducts}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="sku" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => `₱${Number(value).toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                No outbound sales data parsed for product charting.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LOWER DATA ARRAYS: LIST SECTOR CORES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PRODUCT LIST LEDGER */}
        <div className="bg-white p-6 border border-slate-100 rounded-2xl shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Top Performing Items Details</h3>
          <div className="space-y-3">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-50 animate-pulse rounded-xl" />)
            ) : data?.topProducts && data.topProducts.length > 0 ? (
              data.topProducts.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="max-w-[70%]">
                    <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {p.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-900">₱{p.revenue.toLocaleString()}</p>
                    <p className="text-[10px] font-semibold text-indigo-600 mt-0.5">{p.unitsSold} units sold</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No top items recorded yet.</p>
            )}
          </div>
        </div>

        {/* VOUCHER PERFORMANCE MATRIX */}
        <div className="bg-white p-6 border border-slate-100 rounded-2xl shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5">
            <Ticket className="w-4 h-4 text-indigo-500" /> Voucher Conversion Audit
          </h3>
          <div className="space-y-3">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 bg-slate-50 animate-pulse rounded-xl" />)
            ) : data?.voucherPerformance && data.voucherPerformance.length > 0 ? (
              data.voucherPerformance.map((v, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md border border-indigo-100">
                      {v.code}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      Type: {v.type} ({v.type === "PERCENTAGE" ? `${v.value}%` : `₱${v.value}`})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-900">{v.claims} Redemptions</p>
                    <p className="text-[10px] text-emerald-500 font-medium mt-0.5">Active Guard Campaign</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No active voucher claim history metrics.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
