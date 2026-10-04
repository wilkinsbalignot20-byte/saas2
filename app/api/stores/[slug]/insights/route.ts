// app/api/stores/[slug]/insights/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ slug: string }> };

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

async function getStore(slug: string) {
  return prisma.store.findUnique({ where: { slug }, select: { id: true } });
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const store = await getStore(slug);
    if (!store) return fail("Store not found.", 404);

    // 📊 1. KUKUHA NG SUM AT COUNT NG ORDERS (Gumagamit ng Prisma Aggregates)
    const metrics = await prisma.order.aggregate({
      where: { 
        storeId: store.id,
        // Optional Guard: Maaari mong i-filter kung gusto mo na "paid" o tapos na ang order bago isama sa benta
        paymentStatus: { not: "failed" }
      },
      _sum: {
        totalAmount: true
      },
      _count: {
        _all: true
      }
    });

    const grossSales = Number(metrics._sum.totalAmount ?? 0);
    const totalOrders = metrics._count._all ?? 0;
    const averageOrderValue = totalOrders > 0 ? grossSales / totalOrders : 0;

    // 📦 2. TOP SELLING PRODUCTS CALCULATOR (Pagsasamahin ang magkakaparehong Variant Sku)
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          storeId: store.id,
          paymentStatus: { not: "failed" }
        }
      },
      select: {
        productName: true,
        variantName: true,
        variantSku: true,
        quantity: true,
        priceAtPurchase: true
      }
    });

    // Pagsasama-samahin natin sa isang Map para makuha ang kabuuang benta at piraso per item
    const productMap = new Map<string, { name: string; sku: string; unitsSold: number; revenue: number }>();
    
    for (const item of orderItems) {
      const skuKey = item.variantSku || `${item.productName}-${item.variantName}`;
      const current = productMap.get(skuKey) ?? {
        name: item.variantName ? `${item.productName} (${item.variantName})` : item.productName,
        sku: item.variantSku || "N/A",
        unitsSold: 0,
        revenue: 0
      };

      current.unitsSold += item.quantity;
      current.revenue += item.quantity * Number(item.priceAtPurchase);
      productMap.set(skuKey, current);
    }

    // I-sort mula pinakamataas hanggang pinakamababa at kumuha lang ng Top 5 items
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 🏷️ 3. VOUCHER PERFORMANCE TRACKER
    // Kukunin natin ang mga vouchers na may kinalaman sa store na ito para sa comparison list
    const vouchers = await prisma.voucher.findMany({
      where: { storeId: store.id },
      select: {
        code: true,
        claimedCount: true,
        discountType: true,
        discountValue: true
      },
      orderBy: { claimedCount: "desc" },
      take: 5
    });

    const voucherPerformance = vouchers.map(v => ({
      code: v.code,
      claims: v.claimedCount,
      type: v.discountType,
      value: Number(v.discountValue)
    }));

    // 🚀 IPSEND LAHAT NG COMPLETED MATHEMATICAL DATA SA FRONTEND INTERFACE
    return NextResponse.json({
      grossSales,
      totalOrders,
      averageOrderValue,
      topProducts,
      voucherPerformance
    });

  } catch (error) {
    console.error("Insights GET Error:", error);
    return fail("Could not calculate analytics data.", 500);
  }
}
