 "use client";

import { useState } from "react";
import { Truck, PackageCheck, ClipboardList, Bike, MapPin } from "lucide-react"; // ✅ Idinagdag ang MapPin icon
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useResource, type Courier, type Delivery } from "./utils";
import DispatchTab from "./DispatchTab";
import RidersTab from "./RidersTab";
import dynamic from "next/dynamic"; // ✅ Idinagdag para sa dynamic rendering ng mapa

// ✅ Ligtas na pag-import ng mapa para sa client-side lamang upang maiwasan ang SSR errors ng Leaflet
const LogisticsMap = dynamic(() => import("./dispatch/LogisticsMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
      Loading map components...
    </div>
  ),
});

interface LogisticsBoardProps {
  slug: string;
  storeName: string;
  pickupAddress: string;
}

const triggerClass =
  "gap-2 rounded-lg py-2.5 text-sm font-medium text-slate-500 transition-all hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm";

export default function LogisticsBoard({ slug, storeName, pickupAddress }: LogisticsBoardProps) {
  const [tab, setTab] = useState("dispatch");

  const couriersApi = useResource<Courier>(`/api/stores/${slug}/couriers`);
  
  // ✅ ITINAMA: Idinirekta ang API path patungo sa 'orders' backend endpoint na umiiral sa project structures mo
  const deliveriesApi = useResource<Delivery>(`/api/stores/${slug}/orders`);

  const refreshAll = async () => {
    await Promise.all([couriersApi.refresh(), deliveriesApi.refresh()]);
  };

  const deliveries = deliveriesApi.data || [];
  const couriers = couriersApi.data || [];
  const todayKey = new Date().toDateString();

  // Iningatan nating gumamit ng safe formatting loops para hindi mag-crash kung walang benta ang merchant sa Supabase
  const toDispatch = deliveries.filter((d) => d.shippingStatus === "unfulfilled").length;
  const inTransit = deliveries.filter((d) => d.shippingStatus === "shipped").length;
  const deliveredToday = deliveries.filter(
    (d) => d.shippingStatus === "delivered" && d.deliveredAt && new Date(d.deliveredAt).toDateString() === todayKey
  ).length;
  const ridersAvailable = couriers.filter((c) => c.status === "available").length;
  const ridersOnDuty = couriers.filter((c) => c.status !== "inactive").length;

  const stats = [
    { label: "To dispatch", value: toDispatch, hint: "Waiting for a rider", icon: ClipboardList },
    { label: "Out for delivery", value: inTransit, hint: "With riders now", icon: Truck },
    { label: "Delivered today", value: deliveredToday, hint: "Completed since midnight", icon: PackageCheck },
    { label: "Riders available", value: `${ridersAvailable}/${ridersOnDuty}`, hint: "Free / on duty", icon: Bike },
  ];

  return (
    <div className="space-y-5">
      {/* SUMMARY */}
      <section aria-label="Logistics summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {stats.map(({ label, value, hint, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Icon size={16} />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{value}</p>
            <p className="mt-1 text-xs text-slate-400">{hint}</p>
          </div>
        ))}
      </section>

      <Tabs value={tab} onValueChange={setTab} className="w-full space-y-5">
        {/* ✅ Ginawang grid-cols-3 ang TabsList para magkasya ang tatlong buttons */}
        <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 sm:max-w-md">
          <TabsTrigger value="dispatch" className={triggerClass}>
            <Truck size={16} aria-hidden />
            Dispatch
            {toDispatch > 0 && (
              <span className="rounded-full bg-[var(--brand,#0f172a)] px-1.5 py-0.5 text-[11px] font-bold leading-none text-white tabular-nums">
                {toDispatch}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="riders" className={triggerClass}>
            <Bike size={16} aria-hidden />
            Riders
            <span className="text-xs text-slate-400 tabular-nums">{couriers.length}</span>
          </TabsTrigger>
          {/* ✅ ANG BAGONG TAB TRIGGER PARA SA MAPA */}
          <TabsTrigger value="map" className={triggerClass}>
            <MapPin size={16} aria-hidden />
            Live Map
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dispatch" className="border-none p-0 outline-none">
          <DispatchTab
            slug={slug}
            storeName={storeName}
            pickupAddress={pickupAddress}
            deliveries={deliveries}
            couriers={couriers}
            loading={deliveriesApi.loading}
            error={deliveriesApi.error}
            onChanged={refreshAll}
          />
        </TabsContent>

        <TabsContent value="riders" className="border-none p-0 outline-none">
          <RidersTab
            slug={slug}
            couriers={couriers}
            loading={couriersApi.loading}
            error={couriersApi.error}
            onChanged={refreshAll}
          />
        </TabsContent>

        {/* ✅ ANG BAGONG TABS CONTENT NA MAGPAPAKITA NG MAPA */}
        <TabsContent value="map" className="border-none p-0 outline-none">
          <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-500 mb-3">Live Rider Tracking</p>
            <div className="w-full h-[430px] rounded-lg overflow-hidden">
              <LogisticsMap />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
