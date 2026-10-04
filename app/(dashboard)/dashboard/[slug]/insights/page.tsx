 // app/(dashboard)/dashboard/[slug]/insights/page.tsx
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import InsightsDashboard from "@/components/dashboard/insights/Insightsdashboard";

interface InsightsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function InsightsPage({ params }: InsightsPageProps) {
  const { slug } = await params;

  // 🛡️ Tenant guard + brand color ng store
  const store = await prisma.store.findUnique({
    where: { slug },
    select: { name: true, themeColor: true },
  });

  if (!store) return notFound();

  const brand = store.themeColor || "#0f172a";

  return (
    <div
      className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-8 sm:px-6 lg:px-8"
      style={{ "--brand": brand } as CSSProperties}
    >
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Insights</h1>
        <p className="text-sm text-slate-500">
          See how{" "}
          <span className="font-semibold" style={{ color: brand }}>
            {store.name}
          </span>{" "}
          is doing: sales, best sellers, customers, and what needs your attention.
        </p>
      </header>

      <InsightsDashboard slug={slug} color={brand} />
    </div>
  );
}