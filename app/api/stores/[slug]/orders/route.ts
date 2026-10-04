 // app/api/stores/[slug]/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    // 1. Hanapin ang store gamit ang slug
    const store = await prisma.store.findUnique({ 
      where: { slug }, 
      select: { id: true } 
    });
    
    if (!store) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    // 2. Kunin ang mga orders kasama ang relasyon na kailangan ng DispatchTab
    const orders = await prisma.order.findMany({
      where: { storeId: store.id },
      include: {
        orderItems: true, // Kinakailangan para sa order.orderItems.map() sa line 218
        courier: true,    // Kinakailangan para sa order.courier sa line 220
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders, { status: 200 });

  } catch (error) {
    console.error("Error sa pagkuha ng orders:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
