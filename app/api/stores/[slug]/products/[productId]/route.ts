 import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary"; // Shared helper config natin
import { getCloudinaryPublicId } from "@/lib/cloudinary-utils"; // Folder-safe parser natin

// ==========================================
// 1. PATCH METHOD (EDIT / UPDATE PRODUCT)
// ==========================================
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

    // 🌟 AUTOMATED CLOUDINARY CLEANUP LOOP (Folder-Safe)
    // Kinukumpara ang mga lumang URL sa database laban sa mga bagong URL mula sa client
    const oldImages: string[] = existingProduct.images || [];
    const incomingImages: string[] = images || [];

    // Hahanapin ang mga lumang larawan na tinanggal o pinalitan na sa UI form ng tenant
    const imagesToDelete = oldImages.filter((imgUrl) => !incomingImages.includes(imgUrl));

    if (imagesToDelete.length > 0) {
      for (const imageUrl of imagesToDelete) {
        const publicId = getCloudinaryPublicId(imageUrl);
        if (publicId) {
          try {
            // Permanenteng buburahin sa Cloudinary account kasama ang folder reference nito
            await cloudinary.uploader.destroy(publicId);
            console.log(`[CLOUDINARY_CLEANUP_SUCCESS]: Permanently deleted -> ${publicId}`);
          } catch (cloudErr) {
            // Naka-catch upang kung sakaling mag-error sa cloud server, hindi ma-crash o ma-roll back ang Prisma database transaction mo
            console.error(`[CLOUDINARY_CLEANUP_FAILED] for ${publicId}:`, cloudErr);
          }
        }
      }
    }

    // 2. CORE DATABASE BATCH TRANSACTION
    const updatedProduct = await prisma.$transaction(async (tx: any) => {
      
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
      const incomingSkus = variants.map((v: any) => v.sku.trim());
      const variantsToDelete = currentDbVariants.filter(
        (dbV: any) => !incomingSkus.includes(dbV.sku)
      );

      // Burahin ang mga tinanggal na variants sa optimizer UI table
      if (variantsToDelete.length > 0) {
        await tx.productVariant.deleteMany({
          where: {
            id: {
              in: variantsToDelete.map((v: any) => v.id)
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

// ==========================================
// 2. DELETE METHOD (FULL PRODUCT DELETION)
// ==========================================
// Hanapin ang simula ng iyong DELETE function sa backend route at tiyaking ganito ito:
export async function DELETE(
  request: Request,
  context: any
) {
  try {
    const params = await context.params;
    const productId = params.productId;
    const slug = params.slug; // <-- DIREKTA NA ITONG MAKUUKUHA DITO MULA SA RUTA!

    if (!productId || !slug) {
      return NextResponse.json({ error: "Missing required product or tenant identification parameters." }, { status: 400 });
    } 

    // 1. TENANT SECURITY CHECK & EXTRACTION
    // Kunin ang produkto upang matiyak na pag-aari talaga ito ng store tenant na nag-papadala ng command
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        store: { slug: slug }
      }
    });

    if (!product) {
      return NextResponse.json({ error: "Product credentials not found or unauthorized access." }, { status: 404 });
    }

    // 🌟 CLOUDINARY HARD CLEANUP LOOP
    // Permanenteng burahin ang lahat ng kasalukuyang larawan ng produktong ito sa Cloudinary bago natin kalasin ang DB records
    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        const publicId = getCloudinaryPublicId(imageUrl);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
            console.log(`[CLOUDINARY_DELETE_SUCCESS]: Permanently removed asset -> ${publicId}`);
          } catch (cloudErr) {
            // Naka-catch para kung may temporary problem sa Cloudinary side, tuloy pa rin ang core database workflow
            console.error(`[CLOUDINARY_DELETE_FAILED] for ${publicId}:`, cloudErr);
          }
        }
      }
    }

    // 2. CORE DATABASE DELETION
    // Dahil may 'onDelete: Cascade' ang iyong product variants schema reference, 
    // kusa na ring madadamay na mabubura ang lahat ng variants nito sa database!
    await prisma.product.delete({
      where: { id: productId }
    });

    return NextResponse.json({
      success: true,
      message: "Product record and cloud media assets successfully destroyed."
    });

  } catch (error: any) {
    console.error("[PRODUCT_DELETE_API_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
