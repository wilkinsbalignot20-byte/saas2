// app/api/stores/[slug]/deliveries/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ slug: string }> };

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

// TODO(auth): idagdag dito ang pag-check kung ang naka-login ay may-ari ng store.

async function getStore(slug: string) {
  return prisma.store.findUnique({ where: { slug }, select: { id: true } });
}

const orderSelect = {
  id: true,
  orderNumber: true,
  createdAt: true,
  customerName: true,
  customerPhone: true,
  shippingAddress: true,
  notes: true,
  totalAmount: true,
  paymentStatus: true,
  shippingStatus: true,
  courierId: true,
  dispatchedAt: true,
  deliveredAt: true,
  courier: { select: { id: true, name: true, phone: true } },
  orderItems: { select: { id: true, productName: true, variantName: true, quantity: true } },
} as const;

// 📦 GET: dispatch board (para i-deliver, nasa daan, at kamakailang na-deliver)
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const store = await getStore(slug);
    if (!store) return fail("Store not found.", 404);

    const since = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const orders = await prisma.order.findMany({
      where: {
        storeId: store.id,
        paymentStatus: { notIn: ["failed", "refunded"] },
        OR: [
          { shippingStatus: { in: ["unfulfilled", "shipped"] } },
          { shippingStatus: "delivered", deliveredAt: { gte: since } },
        ],
      },
      select: orderSelect,
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Deliveries GET Error:", error);
    return fail("Server error.", 500);
  }
}

// 📦 PATCH: { orderId, action: "assign" | "unassign" | "deliver", courierId?, cashCollected? }
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const body = await req.json().catch(() => null);
    const { orderId, action, courierId, cashCollected } = body ?? {};

    if (!orderId || !["assign", "unassign", "deliver"].includes(action)) {
      return fail("orderId and a valid action are required.", 400);
    }

    const store = await getStore(slug);
    if (!store) return fail("Store not found.", 404);

    // 🛡️ Tenant isolation
    const order = await prisma.order.findFirst({ where: { id: orderId, storeId: store.id } });
    if (!order) return fail("Order not found.", 404);

    if (action === "assign") {
      if (!courierId) return fail("Choose a rider first.", 400);
      if (!["unfulfilled", "shipped"].includes(order.shippingStatus)) {
        return fail("This order can no longer be dispatched.", 400);
      }
      if (["failed", "refunded"].includes(order.paymentStatus)) {
        return fail("This order's payment failed or was refunded.", 400);
      }
      const courier = await prisma.courier.findFirst({ where: { id: courierId, storeId: store.id } });
      if (!courier) return fail("Rider not found.", 404);
      if (courier.status === "inactive") return fail(`${courier.name} is off duty.`, 400);

      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { courierId: courier.id, shippingStatus: "shipped", dispatchedAt: new Date(), deliveredAt: null },
        select: orderSelect,
      });
      return NextResponse.json(updated);
    }

    if (action === "unassign") {
      if (order.shippingStatus !== "shipped") return fail("Only orders out for delivery can be returned to the queue.", 400);
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { courierId: null, shippingStatus: "unfulfilled", dispatchedAt: null },
        select: orderSelect,
      });
      return NextResponse.json(updated);
    }

    // deliver
    if (order.shippingStatus !== "shipped") return fail("Only orders out for delivery can be marked delivered.", 400);
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        shippingStatus: "delivered",
        deliveredAt: new Date(),
        // Kung may koleksyon ng cash sa pag-deliver, paid na ang order
        ...(cashCollected === true && order.paymentStatus === "pending" ? { paymentStatus: "paid" } : {}),
      },
      select: orderSelect,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Deliveries PATCH Error:", error);
    return fail("Could not update the delivery.", 500);
  }
}