 // app/api/stores/[slug]/insights/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ slug: string }> };

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

// TODO(auth): idagdag dito ang pag-check kung ang naka-login ay may-ari ng store.

const DAY = 24 * 60 * 60 * 1000;
const PH_OFFSET = 8 * 60 * 60 * 1000; // Philippine Time (UTC+8), para tama ang "araw" kahit UTC ang server
const RANGES: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const LOW_STOCK_LIMIT = 5;

const toPH = (d: Date) => new Date(d.getTime() + PH_OFFSET);
const dayKey = (d: Date) => toPH(d).toISOString().slice(0, 10);

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const rangeKey = new URL(req.url).searchParams.get("range") ?? "30d";
    const days = RANGES[rangeKey] ?? 30;

    const store = await prisma.store.findUnique({ where: { slug }, select: { id: true } });
    if (!store) return fail("Store not found.", 404);

    // 🗓️ Panahon: kasalukuyang period at kaparehong haba na nauna rito (para sa comparison)
    const ph = toPH(new Date());
    const todayStart = Date.UTC(ph.getUTCFullYear(), ph.getUTCMonth(), ph.getUTCDate()) - PH_OFFSET;
    const start = todayStart - (days - 1) * DAY;
    const prevStart = start - days * DAY;

    const orders = await prisma.order.findMany({
      where: { storeId: store.id, createdAt: { gte: new Date(prevStart) } },
      select: {
        createdAt: true,
        totalAmount: true,
        discount: true,
        paymentStatus: true,
        shippingStatus: true,
        customerEmail: true,
      },
    });

    // Depinisyon:
    //  valid   = hindi cancelled, failed, o refunded (ito ang "benta")
    //  paid    = valid at bayad na
    //  pending = valid at hindi pa bayad (hal. COD na kokolektahin pa)
    const isValid = (o: (typeof orders)[number]) =>
      o.shippingStatus !== "cancelled" && !["failed", "refunded"].includes(o.paymentStatus);

    const blank = () => ({ sales: 0, collected: 0, orders: 0, pendingAmount: 0, pendingOrders: 0, discount: 0, cancelled: 0 });
    const cur = blank();
    const prev = blank();

    const dailyMap = new Map<string, { sales: number; orders: number }>();
    for (let i = 0; i < days; i++) dailyMap.set(dayKey(new Date(start + i * DAY)), { sales: 0, orders: 0 });

    const weekday = WEEKDAYS.map((day) => ({ day, orders: 0, sales: 0 }));
    const fulfillment: Record<string, number> = { unfulfilled: 0, shipped: 0, delivered: 0, cancelled: 0 };
    const payment: Record<string, number> = { paid: 0, pending: 0, failed: 0, refunded: 0 };
    const currentEmails = new Set<string>();

    for (const o of orders) {
      const inCurrent = o.createdAt.getTime() >= start;
      const bucket = inCurrent ? cur : prev;
      const total = Number(o.totalAmount);

      if (o.shippingStatus === "cancelled") bucket.cancelled += 1;

      if (inCurrent) {
        fulfillment[o.shippingStatus] = (fulfillment[o.shippingStatus] ?? 0) + 1;
        payment[o.paymentStatus] = (payment[o.paymentStatus] ?? 0) + 1;
      }

      if (!isValid(o)) continue;

      bucket.sales += total;
      bucket.orders += 1;
      bucket.discount += Number(o.discount);
      if (o.paymentStatus === "paid") bucket.collected += total;
      if (o.paymentStatus === "pending") {
        bucket.pendingAmount += total;
        bucket.pendingOrders += 1;
      }

      if (inCurrent) {
        const d = dailyMap.get(dayKey(o.createdAt));
        if (d) {
          d.sales += total;
          d.orders += 1;
        }
        const w = weekday[toPH(o.createdAt).getUTCDay()];
        w.orders += 1;
        w.sales += total;
        currentEmails.add(o.customerEmail);
      }
    }

    // 👥 Bago vs bumabalik na customer
    let returningCustomers = 0;
    if (currentEmails.size > 0) {
      const earlier = await prisma.order.findMany({
        where: { storeId: store.id, createdAt: { lt: new Date(start) }, customerEmail: { in: Array.from(currentEmails) } },
        select: { customerEmail: true },
        distinct: ["customerEmail"],
      });
      returningCustomers = earlier.length;
    }
    const newCustomers = currentEmails.size - returningCustomers;

    // 📦 Top products (sa valid orders ng kasalukuyang period)
    const items = await prisma.orderItem.findMany({
      where: {
        order: {
          storeId: store.id,
          createdAt: { gte: new Date(start) },
          shippingStatus: { not: "cancelled" },
          paymentStatus: { notIn: ["failed", "refunded"] },
        },
      },
      select: { productName: true, variantName: true, variantSku: true, quantity: true, priceAtPurchase: true },
    });

    const productMap = new Map<string, { name: string; sku: string; unitsSold: number; revenue: number }>();
    for (const item of items) {
      const key = item.variantSku || `${item.productName}-${item.variantName}`;
      const row = productMap.get(key) ?? {
        name: item.variantName && item.variantName !== "Standard" ? `${item.productName} (${item.variantName})` : item.productName,
        sku: item.variantSku || "N/A",
        unitsSold: 0,
        revenue: 0,
      };
      row.unitsSold += item.quantity;
      row.revenue += item.quantity * Number(item.priceAtPurchase);
      productMap.set(key, row);
    }
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 🏷️ Vouchers, 📉 low stock, 🧾 recent orders
    const [vouchers, lowStockRows, recent] = await Promise.all([
      prisma.voucher.findMany({
        where: { storeId: store.id },
        select: {
          code: true,
          claimedCount: true,
          maxClaims: true,
          discountType: true,
          discountValue: true,
          isActive: true,
          expiresAt: true,
        },
        orderBy: { claimedCount: "desc" },
        take: 5,
      }),
      prisma.productVariant.findMany({
        where: { stock: { lte: LOW_STOCK_LIMIT }, product: { storeId: store.id, status: "published" } },
        select: { name: true, sku: true, stock: true, product: { select: { name: true } } },
        orderBy: { stock: "asc" },
        take: 8,
      }),
      prisma.order.findMany({
        where: { storeId: store.id },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          totalAmount: true,
          paymentStatus: true,
          shippingStatus: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

    const metric = (value: number, previous: number) => ({ value, previous });

    return NextResponse.json({
      range: RANGES[rangeKey] ? rangeKey : "30d",
      days,
      kpis: {
        sales: metric(cur.sales, prev.sales),
        collected: metric(cur.collected, prev.collected),
        orders: metric(cur.orders, prev.orders),
        aov: metric(cur.orders ? cur.sales / cur.orders : 0, prev.orders ? prev.sales / prev.orders : 0),
      },
      extras: {
        pendingAmount: cur.pendingAmount,
        pendingOrders: cur.pendingOrders,
        discountGiven: cur.discount,
        cancelledOrders: cur.cancelled,
        newCustomers,
        returningCustomers,
      },
      daily: Array.from(dailyMap.entries()).map(([date, v]) => ({ date, ...v })),
      topProducts,
      fulfillment: Object.entries(fulfillment).map(([status, count]) => ({ status, count })),
      payment: Object.entries(payment).map(([status, count]) => ({ status, count })),
      weekday: [1, 2, 3, 4, 5, 6, 0].map((i) => weekday[i]), // Mon → Sun
      vouchers: vouchers.map((v: any) => ({
        code: v.code,
        claims: v.claimedCount,
        maxClaims: v.maxClaims,
        type: v.discountType,
        value: Number(v.discountValue),
        isActive: v.isActive,
        expiresAt: v.expiresAt,
      })),
      lowStock: lowStockRows.map((v: any) => ({ productName: v.product.name, variantName: v.name, sku: v.sku, stock: v.stock })),
      recentOrders: recent.map((o: any) => ({ ...o, totalAmount: Number(o.totalAmount) })),
    });
  } catch (error) {
    console.error("Insights GET Error:", error);
    return fail("Could not calculate analytics data.", 500);
  }
}