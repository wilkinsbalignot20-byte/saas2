 // app/api/stores/[slug]/orders/[orderId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string; orderId: string }> }
) {
  try {
    // Ligtas na i-await ang params para sa Next.js 16 execution context
    const { slug, orderId } = await context.params;
    const body = await request.json();
    const { paymentStatus, shippingStatus } = body;

    // 1. Kunin ang kasalukuyang estado ng order bago baguhin
    const existingOrder = await prisma.order.findFirst({
      where: {
        id: orderId,
        store: { slug },
      },
      include: {
        orderItems: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ message: "Order not found for this store" }, { status: 404 });
    }

    // Gagawa ng listahan ng mga updates para sa database transactions
    const databaseOperations: any[] = [];

    // 2. INVENTORY TRANSACTION LOGIC
    // Kung ginawang 'shipped' at dati ay HINDI pa 'shipped' -> BAWAS STOCK
    if (shippingStatus === "shipped" && existingOrder.shippingStatus !== "shipped") {
      for (const item of existingOrder.orderItems) {
        if (item.variantId) {
          databaseOperations.push(
            prisma.productVariant.update({
              where: { id: item.variantId },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            })
          );
        }
      }
    }
    
    // Kung binalik sa 'cancelled' mula sa pagiging 'shipped' -> IBALIK ANG STOCK
    if (shippingStatus === "cancelled" && existingOrder.shippingStatus === "shipped") {
      for (const item of existingOrder.orderItems) {
        if (item.variantId) {
          databaseOperations.push(
            prisma.productVariant.update({
              where: { id: item.variantId },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            })
          );
        }
      }
    }

    // 3. ISAMA ANG PANGUNAHING PAG-UPDATE NG STATUS NG ORDER
    databaseOperations.push(
      prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus,
          shippingStatus,
        },
      })
    );

    // Patakbuhin ang buong operasyon sa isang ligtas at sabay-sabay na transaction block
    const transactionResults = await prisma.$transaction(databaseOperations);
    
    // Kunin ang pinakahuling resulta (ang updated order)
    const updatedOrder = transactionResults[transactionResults.length - 1];

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error("[ORDER_STATUS_PATCH_ERROR]", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message }, 
      { status: 500 }
    );
  }
}
