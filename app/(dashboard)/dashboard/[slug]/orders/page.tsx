 // app/(dashboard)/dashboard/[slug]/orders/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrdersDataTable } from "@/components/dashboard/orders/OrdersDataTable";

interface OrdersPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

export default async function OrdersPage({ params }: OrdersPageProps) {
  const { slug } = await params;

  // 🛡️ TENANT ISOLATION GUARD
  const store = await prisma.store.findUnique({
    where: { slug },
    select: { id: true, name: true, themeColor: true },
  });

  if (!store) {
    return notFound();
  }

  // 📑 FETCH ORDERS
  const orders = await prisma.order.findMany({
    where: { storeId: store.id },
    include: { orderItems: true },
    orderBy: { createdAt: "desc" },
  });

  // 📊 SUMMARY (cancelled orders hindi isinasama sa revenue at pending counts)
  const active = orders.filter((o) => o.shippingStatus !== "cancelled");
  const revenue = active
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const toFulfill = active.filter((o) => o.shippingStatus === "unfulfilled").length;
  const awaitingPayment = active.filter((o) => o.paymentStatus === "pending").length;

  const stats = [
    { label: "Total orders", value: orders.length.toLocaleString("en-PH"), hint: "All time" },
    { label: "Revenue", value: peso.format(revenue), hint: "Paid orders only" },
    { label: "To fulfill", value: toFulfill.toLocaleString("en-PH"), hint: "Unfulfilled orders" },
    { label: "Awaiting payment", value: awaitingPayment.toLocaleString("en-PH"), hint: "Pending payment" },
  ];

  // Safe serialization para sa Decimal at Date types
  const serializedOrders = orders.map((order) => ({
    ...order,
    subtotal: order.subtotal.toString(),
    shippingFee: order.shippingFee.toString(),
    discount: order.discount.toString(),
    totalAmount: order.totalAmount.toString(),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    orderItems: order.orderItems.map((item) => ({
      ...item,
      priceAtPurchase: item.priceAtPurchase.toString(),
    })),
  }));

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* HEADER */}
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Orders</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Track payments, fulfillment, and shipping for{" "}
          <span className="font-semibold" style={{ color: store.themeColor }}>
            {store.name}
          </span>
          .
        </p>
      </header>

      {/* SUMMARY */}
      <section aria-label="Orders summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-5"
          >
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className="mt-2 truncate text-xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-white sm:text-2xl">
              {s.value}
            </p>
            <p className="mt-1 text-xs text-slate-400">{s.hint}</p>
          </div>
        ))}
      </section>

      {/* TABLE */}
      <OrdersDataTable orders={serializedOrders} themeColor={store.themeColor} slug={slug} />
    </div>
  );
}