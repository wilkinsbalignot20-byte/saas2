 // app/(dashboard)/dashboard/[slug]/logistics/page.tsx
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import LogisticsBoard from "@/components/dashboard/logistics/LogisticsBoard";

interface LogisticsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LogisticsPage({ params }: LogisticsPageProps) {
  const { slug } = await params;

  // 🛡️ Tenant guard + brand color at pickup address ng store
  const store = await prisma.store.findUnique({
    where: { slug },
    select: { name: true, themeColor: true, pickupAddress: true },
  });

  if (!store) return notFound();

  return (
    <div
      className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-8 sm:px-6 lg:px-8"
      style={{ "--brand": store.themeColor || "#0f172a" } as CSSProperties}
    >
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Logistics</h1>
        <p className="text-sm text-slate-500">
          Dispatch orders to your riders and track every delivery for{" "}
          <span className="font-semibold" style={{ color: store.themeColor || undefined }}>
            {store.name}
          </span>
          .
        </p>
        <p className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
          <MapPin size={13} className="shrink-0" />
          Pickup point: {store.pickupAddress}
        </p>
      </header>

      <LogisticsBoard slug={slug} storeName={store.name} pickupAddress={store.pickupAddress} />
    </div>
  );
}