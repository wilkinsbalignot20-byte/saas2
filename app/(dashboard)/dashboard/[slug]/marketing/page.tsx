  // app/(dashboard)/dashboard/[slug]/marketing/page.tsx
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { Ticket, Zap, Boxes, Rocket } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VoucherManagementTab from "@/components/dashboard/marketing/VoucherManagementTab";
import FlashSaleManagementTab from "@/components/dashboard/marketing/FlashSaleManagementTab";
import BundleManagementTab from "@/components/dashboard/marketing/BundleManagementTab";
import PremiumBoostTab from "@/components/dashboard/marketing/PremiumBoostTab";

interface MarketingPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const triggerClass =
  "gap-2 rounded-lg py-2.5 text-sm font-medium text-slate-500 transition-all hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm";

const TABS = [
  { value: "vouchers", label: "Vouchers", icon: Ticket },
  { value: "flash-sales", label: "Flash Sales", icon: Zap },
  { value: "bundles", label: "Bundles & BOGO", icon: Boxes },
  { value: "premium-boost", label: "Premium Boost", icon: Rocket },
] as const;

export default async function MarketingDashboardPage({ params }: MarketingPageProps) {
  const { slug } = await params;

  // 🛡️ Tenant guard + brand color ng store
  const store = await prisma.store.findUnique({
    where: { slug },
    select: { name: true, themeColor: true },
  });

  if (!store) return notFound();

  return (
    <div
      className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-8 sm:px-6 lg:px-8"
      style={{ "--brand": store.themeColor || "#0f172a" } as CSSProperties}
    >
      {/* HEADER */}
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Marketing</h1>
        <p className="text-sm text-slate-500">
          Set up vouchers, sales, and bundle deals for{" "}
          <span className="font-semibold" style={{ color: store.themeColor || undefined }}>
            {store.name}
          </span>
          , then boost your best promos on the Marketplace.
        </p>
      </header>

      {/* TABS */}
      <Tabs defaultValue="vouchers" className="w-full space-y-5">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 sm:grid-cols-4 lg:max-w-3xl">
          {TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className={triggerClass}>
              <Icon size={16} aria-hidden />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="vouchers" className="border-none p-0 outline-none">
          <VoucherManagementTab tenantSlug={slug} />
        </TabsContent>

        <TabsContent value="flash-sales" className="border-none p-0 outline-none">
          <FlashSaleManagementTab tenantSlug={slug} />
        </TabsContent>

        <TabsContent value="bundles" className="border-none p-0 outline-none">
          <BundleManagementTab tenantSlug={slug} />
        </TabsContent>

        <TabsContent value="premium-boost" className="border-none p-0 outline-none">
          <PremiumBoostTab tenantSlug={slug} />
        </TabsContent>
      </Tabs>
    </div>
  );
}