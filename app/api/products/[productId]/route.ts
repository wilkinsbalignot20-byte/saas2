// app/api/products/[productId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: any
) {
  try {
    // 🛡️ Ligtas na kunin at i-await ang params para sa Next.js 16 requirements context
    const params = await context.params;
    const productId = params.productId;

    if (!productId) {
      return NextResponse.json({ error: "Missing required product identification parameter." }, { status: 400 });
    }

    const body = await request.json();
    const { 
      slug, 
      name, 
      description, 
      categoryId, 
      status, 
      images, 
      variants 
    } = body;

    // 1. TENANT SECURITY CHECK
    // Siguraduhing ang produkto ay pag-aari talaga ng store tenant na nag-papadala ng request
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        store: { slug: slug }
      }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product credentials not found or unauthorized access." }, { status: 404 });
    }

    // 2. CORE DATABASE BATCH TRANSACTION
    // Patakbuhin natin sa loob ng transaction para sigurado tayong hindi masisira ang catalog kung magka-error
    const updatedProduct = await prisma.$transaction(async (tx) => {
      
      // A. I-update ang pangunahing impormasyon ng produkto
      const prod = await tx.product.update({
        where: { id: productId },
        data: {
          name,
          description,
          categoryId: categoryId || null,
          status,
          images
        }
      });

      // B. KUNIN ANG MGA KASALUKUYANG VARIANTS SA DB
      const currentDbVariants = await tx.productVariant.findMany({
        where: { productId }
      });

      // C. MAP AT RECONCILE VIA SKU LAYER
      // Alamin kung alin ang mga dapat burahin (mga wala sa bagong listahan na ipinadala ng client)
      const incomingSkus = variants.map((v: any) => v.sku.trim());
      const variantsToDelete = currentDbVariants.filter(
        (dbV) => !incomingSkus.includes(dbV.sku)
      );

      // Burahin ang mga tinanggal na variants sa optimizer UI table
      if (variantsToDelete.length > 0) {
        await tx.productVariant.deleteMany({
          where: {
            id: {
              in: variantsToDelete.map((v) => v.id)
            }
          }
        });
      }

      // D. UPSERT OPERATIONAL LOOPS (Mag-save o Mag-update batay sa SKU)
      for (const variant of variants) {
        await tx.productVariant.upsert({
          where: { sku: variant.sku.trim() },
          update: {
            name: variant.name || "Standard",
            price: variant.price,
            stock: variant.stock
          },
          create: {
            productId: productId,
            sku: variant.sku.trim(),
            name: variant.name || "Standard",
            price: variant.price,
            stock: variant.stock
          }
        });
      }

      return prod;
    });

    return NextResponse.json({
      success: true,
      message: "Product and catalog variations successfully integrated.",
      product: updatedProduct
    });

  } catch (error: any) {
    console.error("[PRODUCT_PATCH_API_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
