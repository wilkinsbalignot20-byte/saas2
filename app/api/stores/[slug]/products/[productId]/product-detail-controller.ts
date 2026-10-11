 // app/api/stores/[slug]/products/[productId]/product-detail-controller.ts

import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary"; 
import { getCloudinaryPublicId } from "@/lib/cloudinary-utils";

/**
 * Service para sa Ligtas na Pag-Update ng Produkto (PATCH)
 */
export async function updateProductDetailService(productId: string, body: any) {
  const { slug, name, description, categoryId, status, images, variants } = body;

  // 1. TENANT SECURITY CHECK
  const existingProduct = await prisma.product.findFirst({
    where: {
      id: productId,
      store: { slug: slug }
    }
  });

  if (!existingProduct) {
    throw { status: 404, message: "Product credentials not found or unauthorized access." };
  }

  // 2. AUTOMATED CLOUDINARY CLEANUP LOOP (Folder-Safe)
  const oldImages: string[] = existingProduct.images || [];
  const incomingImages: string[] = images || [];
  const imagesToDelete = oldImages.filter((imgUrl) => !incomingImages.includes(imgUrl));

  if (imagesToDelete.length > 0) {
    for (const imageUrl of imagesToDelete) {
      const publicId = getCloudinaryPublicId(imageUrl);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
          console.log(`[CLOUDINARY_CLEANUP_SUCCESS]: Permanently deleted -> ${publicId}`);
        } catch (cloudErr) {
          console.error(`[CLOUDINARY_CLEANUP_FAILED] for ${publicId}:`, cloudErr);
        }
      }
    }
  }

  // 3. CORE DATABASE BATCH TRANSACTION
  return await prisma.$transaction(async (tx: any) => {
    // A. I-update ang pangunahing impormasyon ng produkto
    const prod = await tx.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        // 🟢 HOTFIX: Ginawang fallback ang existing kung walang pinadalang bago para iwas Prisma validation crash
        categoryId: categoryId || existingProduct.categoryId, 
        status,
        images
      }
    });

    // B. SAFE RECONCILE VARIANTS (Wipe and Re-create Method para sa SKU Safety)
    // Para maiwasan ang P2002 unique constraint error kapag nagkaroon ng halo-halong edit ng SKUs ang mga tenant,
    // mas malinis at mabilis na i-delete ang lumang variants ng produktong ito at i-insert ang mga bago.
    if (variants && variants.length > 0) {
      await tx.productVariant.deleteMany({
        where: { productId: productId }
      });

      // SKU Enforcement para sa mga ina-update na variants
      const cleanStorePrefix = slug.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 4);
      
      const variantsToCreate = variants.map((v: any) => {
        const rawSku = v.sku.trim().toUpperCase();
        const securedSku = rawSku.startsWith(cleanStorePrefix) ? rawSku : `${cleanStorePrefix}-${rawSku}`;
        
        return {
          productId: productId,
          sku: securedSku,
          name: v.name || "Standard",
          price: v.price,
          stock: v.stock
        };
      });

      await tx.productVariant.createMany({
        data: variantsToCreate
      });
    }

    return prod;
  });
}

/**
 * Service para sa Kabuuang Pagbura ng Produkto (DELETE)
 */
export async function deleteProductDetailService(productId: string, slug: string) {
  // 1. TENANT SECURITY CHECK & EXTRACTION
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      store: { slug: slug }
    }
  });

  if (!product) {
    throw { status: 404, message: "Product credentials not found or unauthorized access." };
  }

  // 2. CLOUDINARY HARD CLEANUP LOOP
  if (product.images && product.images.length > 0) {
    for (const imageUrl of product.images) {
      const publicId = getCloudinaryPublicId(imageUrl);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
          console.log(`[CLOUDINARY_DELETE_SUCCESS]: Permanently removed asset -> ${publicId}`);
        } catch (cloudErr) {
          console.error(`[CLOUDINARY_DELETE_FAILED] for ${publicId}:`, cloudErr);
        }
      }
    }
  }

  // 3. CORE DATABASE DELETION
  return await prisma.product.delete({
    where: { id: productId }
  });
}
