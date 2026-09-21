   // app/(seller-center)/seller/dashboard/[storeSlug]/layout.tsx
import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";

// 🌟 THE ULTIMATE FIX: Ginawang DEFAULT IMPORT (walang curly braces) at itinuro sa saktong .tsx file location sa loob ng folders mo!
import BranchedMenu from "@/app/components/BranchedMenu/BranchedMenu";

// 🌟 OPISYAL NA COCKPIT TYPE ENGINE PARA SA NEXT.JS 16
export default async function StoreDashboardLayout(props: {
  children: React.ReactNode;
  params: Promise<{ storeSlug: string }>;
}) {
  // Ligtas na i-unpack ang dynamic properties mula sa Next.js Promise
  const { storeSlug } = await props.params;
  const children = props.children;
  
  if (!storeSlug) return notFound();

  const supabase = await createSupabaseServer();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/seller/login");
  }

  const { data: store, error } = await supabase
    .from("stores")
    .select("name, slug, logo_url, owner_name")
    .eq("slug", storeSlug.toLowerCase().trim())
    .maybeSingle();

  if (error || !store) return notFound();

  const finalLogoUrl = store.logo_url || null;

  const sidebarMenuItems = [
    {
      label: "Core Operations",
      children: [
        { value: `/seller/dashboard/${store.slug}`, label: "Overview Dashboard", icon: undefined },
        { value: `/seller/dashboard/${store.slug}/product`, label: "Product Management", icon: undefined },
        { value: `/seller/dashboard/${store.slug}/order`, label: "Order Tracking", icon: undefined },
        { value: `/seller/dashboard/${store.slug}/finance`, label: "Finance & Sales", icon: undefined },
      ],
    },
    {
      label: "Store Management",
      children: [
        { value: `/seller/dashboard/${store.slug}/store-editor`, label: "Store Visual Editor", icon: undefined },
        { value: `/seller/dashboard/${store.slug}/marketing`, label: "Marketing Hub", icon: undefined },
        { value: `/seller/dashboard/${store.slug}/automation`, label: "Automation Flows", icon: undefined },
      ],
    },
    {
      label: "Business Insights",
      children: [
        { value: `/seller/dashboard/${store.slug}/chat`, label: "Live Support Chat", icon: undefined },
        { value: `/seller/dashboard/${store.slug}/insights`, label: "Business Insights", icon: undefined },
        { value: `/seller/dashboard/${store.slug}/analytic`, label: "Analytics Performance", icon: undefined },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 w-full">
      
      {/* 🛡️ PERMANENT SIDEBAR WINDOW BAR */}
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-slate-200 bg-white">
        
        {/* 🟢 BRAND HEADER */}
        <div className="flex h-20 items-center border-b border-slate-200 px-4 gap-3 bg-slate-50/50">
          {finalLogoUrl ? (
            <div className="h-12 w-12 flex-none overflow-hidden rounded-xl border border-slate-200 bg-white p-1 flex items-center justify-center shadow-sm">
              <img 
                src={finalLogoUrl} 
                alt={`${store.name} Logo`}
                className="h-full w-full object-scale-down rounded-lg"
              />
            </div>
          ) : (
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-md uppercase">
              {store.name.substring(0, 2)}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-black tracking-tight text-slate-900 truncate">
              {store.name}
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Merchant Control</p>
          </div>
        </div>

        {/* 🚀 NAVIGATION PANEL MATRIX */}
        <nav className="flex-1 p-4 overflow-y-auto space-y-2">
          {/* 🌟 BALANSADONG PROPS PARAMETERS NA KATUGMA NG BAGONG ORIGINAL RE-CONFIGURED LOGIC MO */}
          <BranchedMenu
            items={sidebarMenuItems as any}
            defaultOpen={[0, 1]} // Gumagana na nang maayos bilang default integer arrays para sa open nodes
            defaultActive={`/seller/dashboard/${store.slug}`}
            color="#475569"
            accentColor="#4f46e5"
            lineColor="#64748b" 
            width={220}
            rowHeight={36}
            indent={24}         
            trunk={12}          
            radius={8}          
            lineWidth={2}       
            fontSize={13}
          />
        </nav>

        {/* Footer info core space */}
        <div className="border-t border-slate-200 p-4 bg-white text-[10px] text-slate-400 text-center">
          Identifier: <span className="font-mono text-indigo-600 font-bold">{store.slug}</span>
        </div>
      </aside>

      {/* 🛡️ MAIN WORKING CANVAS */}
      <div className="flex flex-1 flex-col pl-64 w-full">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 sticky top-0 z-10 shadow-sm/5">
          <div className="text-xs font-medium text-slate-400">
            Secure Node Path: <span className="text-emerald-500 font-bold">● Operational Active</span>
          </div>
          <div>
            <a
              href={`/store/${store.slug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Live Storefront ↗
            </a>
          </div>
        </header>

        <main className="flex-1 p-8 w-full">
          <div className="mx-auto max-w-5xl">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}

