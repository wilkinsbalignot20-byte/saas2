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
    const { paymentStatus, shippingStatus, courierId } = body; // Kasama na ang courierId mula sa front-end panel

    // 1. KUNIN ANG KASALUKUYANG ESTADO NG ORDER BAGO BAGUHIN (Kasama ang dating courierId)
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
      return NextResponse.json({ error: "Order not found for this store" }, { status: 404 });
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

    // 3. AUTOMATED LOGISTICS STATE TRANSITION MANAGEMENT
    // CASE A: Ang order ay dinala sa 'shipped' state at may piniling courier -> Gawaing BUSY ang Rider
    if (shippingStatus === "shipped" && courierId) {
      databaseOperations.push(
        prisma.courier.update({
          where: { id: courierId },
          data: { status: "busy" }
        })
      );
    }

    // CASE B: Ang order ay natapos na ('delivered') o kinansela ('cancelled') -> IBALIK SA AVAILABLE ang Rider
    // Kinukuha natin ang courierId mula sa current payload o kaya sa database instance (`existingOrder.courierId`)
    const targetCourierId = courierId || (existingOrder as any)["courierId"];
    
    if ((shippingStatus === "delivered" || shippingStatus === "cancelled") && targetCourierId) {
      databaseOperations.push(
        prisma.courier.update({
          where: { id: targetCourierId },
          data: { status: "available" }
        })
      );
    }

    // 4. ISAMA ANG PANGUNAHING PAG-UPDATE NG STATUS NG ORDER (May kasamang Courier Attachment Layer)
    databaseOperations.push(
      prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus,
          shippingStatus,
          // Ikabit ang courierId kung ito ay shipping process, o panatilihin kung ito ay delivered/cancelled transitions.
          ...(shippingStatus === "shipped" && { courierId: courierId || null }),
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
      { error: "Internal Server Error", message: error.message }, 
      { status: 500 }
    );
  }
}
