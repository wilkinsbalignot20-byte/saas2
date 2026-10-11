// app/api/stores/[slug]/products/[productId]/product-detail-controller.ts

import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary"; 
import { getCloudinaryPublicId } from "@/lib/cloudinary-utils";

/**
 * Service para sa Ligtas na Pag-Update ng Produkto (PATCH)
 * Kasama ang automated Cloudinary cleanup loop at Prisma database batch transaction reconciliation via SKU layer.
 */
export async function updateProductDetailService(productId: string, body: any) {
  const { slug, name, description, categoryId, status, images, variants, bundles } = body;

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
        categoryId: categoryId || null,
        status,
        images
      }
    });

    // B. RECONCILE VARIANTS VIA SKU
    const currentDbVariants = await tx.productVariant.findMany({
      where: { productId }
    });

    const incomingSkus = variants.map((v: any) => v.sku.trim());
    const variantsToDelete = currentDbVariants.filter(
      (dbV: any) => !incomingSkus.includes(dbV.sku)
    );

    if (variantsToDelete.length > 0) {
      await tx.productVariant.deleteMany({
        where: {
          id: { in: variantsToDelete.map((v: any) => v.id) }
        }
      });
    }

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

    // C. RECONCILE PRODUCT BUNDLES LAYER
    const currentDbBundles = await tx.productBundle.findMany({
      where: { productId }
    });

    const incomingBundleIds = bundles.map((b: any) => b.id).filter(Boolean);
    const bundlesToDelete = currentDbBundles.filter(
      (dbB: any) => !incomingBundleIds.includes(dbB.id)
    );

    if (bundlesToDelete.length > 0) {
      await tx.productBundle.deleteMany({
        where: {
          id: { in: bundlesToDelete.map((b: any) => b.id) }
        }
      });
    }

    for (const bundle of bundles) {
      if (bundle.id) {
        await tx.productBundle.update({
          where: { id: bundle.id },
          data: {
            name: bundle.name,
            quantity: bundle.quantity,
            price: bundle.price
          }
        });
      } else {
        await tx.productBundle.create({
          data: {
            productId: productId,
            name: bundle.name,
            quantity: bundle.quantity,
            price: bundle.price
          }
        });
      }
    }

    return prod;
  });
}

/**
 * Service para sa Kabuuang Pagbura ng Produkto (DELETE)
 * Permanenteng nililinis ang lahat ng image assets sa Cloudinary bago kalasin ang database product records (Cascade).
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
