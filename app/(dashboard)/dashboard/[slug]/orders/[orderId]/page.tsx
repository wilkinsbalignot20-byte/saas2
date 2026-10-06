 // app/(dashboard)/dashboard/[slug]/orders/[orderId]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma"; // Siguraduhing tugma sa iyong prisma path
import { OrderStatusCard } from "@/components/dashboard/orders/OrderStatusCard";
import { OrderItem } from "@prisma/client";

interface OrderIdPageProps {
  params: Promise<{
    slug: string;
    orderId: string;
  }>;
}

export default async function OrderIdPage({ params }: OrderIdPageProps) {
  const { slug, orderId } = await params;

  // 🛡️ ACCIDENT ROUTING / CACHE BLOCKER
  // Sinisiguro natin na ang pumasok na orderId ay sumusunod sa tamang UUID pattern ng database.
  // Kung ito ay isang plain string tulad ng "logistics", awtomatiko natin itong ire-reject 
  // gamit ang notFound() bago pa man ito makarating sa PostgreSQL query engine para maiwasan ang crash.
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\$/i;
  
  if (!uuidRegex.test(orderId)) {
    return notFound();
  }

  // 🛡️ TENANT ISOLATION GUARD: Siguraduhing sa store na ito talaga nakatali ang order
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      store: {
        slug: slug,
      },
    },
    include: {
      store: {
        select: {
          name: true,
          themeColor: true,
        },
      },
      orderItems: true,
    },
  });

  if (!order) {
    return notFound();
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      {/* BREADCRUMB / BACK LINK */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <Link
            href={`/dashboard/${slug}/orders`}
            className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            ← Back to Orders
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Order {order.orderNumber}
          </h1>
          <p className="text-xs text-slate-400">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}
          </p>
        </div>
      </div>

      {/* TWO COLUMN GRID LAYOUT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* LEFT COLUMN: Receipt & Itemized Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Order Items</h3>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {order.orderItems.map((item: OrderItem) => (
                <div key={item.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div>
                    <h4 className="font-medium text-sm text-slate-900 dark:text-white">{item.productName}</h4>
                    <p className="text-xs text-slate-400">
                      Variant: <span className="font-medium text-slate-600 dark:text-slate-300">{item.variantName}</span>
                    </p>
                    <p className="text-xs text-slate-400">SKU: {item.variantSku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      ₱{parseFloat(item.priceAtPurchase.toString()).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-slate-400">x{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* FINANCIAL BREAKDOWN */}
            <div className="border-t border-slate-100 dark:border-slate-800 mt-6 pt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  ₱{parseFloat(order.subtotal.toString()).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  ₱{parseFloat(order.shippingFee.toString()).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Discount</span>
                <span>-₱{parseFloat(order.discount.toString()).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-base font-bold text-slate-900 dark:text-white">
                <span>Total Amount</span>
                <span style={{ color: order.store.themeColor }}>
                  ₱{parseFloat(order.totalAmount.toString()).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Customer Details & Fulfillment Control */}
        <div className="space-y-6">
          
          {/* CONTROL CENTER: OrderStatusCard widget */}
          <OrderStatusCard
            orderId={order.id}
            slug={slug}
            currentPaymentStatus={order.paymentStatus}
            currentShippingStatus={order.shippingStatus}
            themeColor={order.store.themeColor}
          />

          {/* CUSTOMER PROFILE INFO CARD */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Customer Details</h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="block text-slate-400 font-medium">Full Name</span>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{order.customerName}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-medium">Email Address</span>
                <span className="text-slate-900 dark:text-slate-200">{order.customerEmail}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-medium">Contact Number</span>
                <span className="text-slate-900 dark:text-slate-200">{order.customerPhone}</span>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <span className="block text-slate-400 font-medium mb-1">Shipping Address</span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-md border border-slate-100 dark:border-slate-800/50">
                  {order.shippingAddress}
                </p>
              </div>
              {order.notes && (
                <div>
                  <span className="block text-slate-400 font-medium">Order Notes</span>
                  <p className="text-slate-600 dark:text-slate-400 italic">"{order.notes}"</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
