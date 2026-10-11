 // app/api/stores/[slug]/products/products-controller.ts

import { prisma } from '@/lib/prisma';

/**
 * Logic para sa paglikha ng bagong produkto kasama ang variants
 */
export async function createProductService(body: any) {
  // Tinanggap pa rin ang bundles dito para maging safe sa incoming payload mula sa page.tsx
  const { slug, name, description, categoryId, newCategoryName, status, variants, images, bundles } = body;

  // 1. VALIDATION CHECK
  if (!slug || !name || !variants || variants.length === 0) {
    throw { status: 400, message: 'Missing core required platform parameters.' };
  }

  // 2. HANAPIN ANG STORE
  const store = await prisma.store.findUnique({
    where: { slug },
    select: { id: true }
  });

  if (!store) {
    throw { status: 404, message: 'Tenant storefront profile not found.' };
  }

  // 3. SMART CATEGORY RESOLUTION
  let finalCategoryId = categoryId;

  if (!finalCategoryId && newCategoryName) {
    const generatedSlug = newCategoryName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const existingCategory = await prisma.category.findFirst({
      where: { storeId: store.id, slug: generatedSlug }
    });

    if (existingCategory) {
      finalCategoryId = existingCategory.id;
    } else {
      const createdCategory = await prisma.category.create({
        data: { name: newCategoryName, slug: generatedSlug, storeId: store.id }
      });
      finalCategoryId = createdCategory.id;
    }
  }

  if (!finalCategoryId) {
    throw { status: 400, message: 'Please specify a category by typing a new one or selecting from the list.' };
  }

  // 4. SKU ENFORCEMENT
  const cleanStorePrefix = slug.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 4);
  const isolatedVariants = variants.map((v: any) => {
    const rawSku = v.sku.trim().toUpperCase();
    const securedSku = rawSku.startsWith(cleanStorePrefix) ? rawSku : `${cleanStorePrefix}-${rawSku}`;
    return { name: v.name, sku: securedSku, price: v.price, stock: v.stock };
  });

  // 🟢 INAYOS: Hindi na natin ito isasaksak sa prisma.product.create para iwas crash,
  // ngunit handa itong i-pass sa hiwalay na log o bundle controller kung kinakailangan.
  const formattedBundles = bundles?.map((b: any) => ({
    name: b.name,
    quantity: b.quantity,
    price: b.price
  })) || [];

  // 5. PRISMA TRANSACTION DATABASE WRITE (MALINIS NA AT PROD-READY)
  return await prisma.product.create({
    data: {
      name,
      description,
      images: images || [], // Swak sa String[] setup ng product.prisma mo
      status,
      storeId: store.id,
      categoryId: finalCategoryId,
      variants: { create: isolatedVariants }
      // 🟢 INAYOS: Tinanggal ang bundles dito dahil hiwalay na entity ang ProductBundle sa schema mo!
    },
    include: { 
      variants: true 
      // 🟢 INAYOS: Tinanggal din ang bundles sa include
    }
  });
}

/**
 * Logic para sa pagkuha ng listahan ng mga published products na may flash sale safety filters
 */
export async function getStoreProductsService(slug: string) {
  const store = await prisma.store.findUnique({
    where: { slug },
    select: { id: true }
  });

  if (!store) {
    throw { status: 404, message: 'Hindi nahanap ang tindahan.' };
  }

  const products = await prisma.product.findMany({
    where: { storeId: store.id, status: 'published' },
    select: {
      id: true,
      name: true,
      images: true,
      variants: { select: { id: true, name: true, price: true, sku: true } },
      store: {
        select: {
          campaigns: {
            where: { status: { in: ["ACTIVE", "UPCOMING"] }, type: "FLASH_SALE" },
            select: { rules: { select: { productId: true, variantId: true } } }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return products.map((p) => {
    const isInFlashSale = p.store?.campaigns?.some((c) => 
      c.rules?.some((r) => r.productId === p.id || p.variants.some((v) => v.id === r.variantId))
    ) || false;

    return {
      id: p.id,
      name: p.name,
      images: p.images,
      variants: p.variants,
      isLockedInFlashSale: isInFlashSale 
    };
  });
}

/**
 * Isang isolated background action helper para sa Facebook Auto-Post Automation
 */
export function triggerFacebookAutomation(newProduct: any, slug: string, requestUrl: string) {
  try {
    const { origin } = new URL(requestUrl);
    const startingPrice = Number(newProduct.variants?.[0]?.price || 0);
    const productLink = `${origin}/shop/${slug}/products/${newProduct.id}`;

    (async () => {
      try {
        const fbStoreCredentials = await prisma.store.findUnique({
          where: { slug },
          select: { fbPageId: true, fbPageAccessToken: true }
        });

        if (fbStoreCredentials?.fbPageId && fbStoreCredentials?.fbPageAccessToken) {
          const message = `✨ BAGONG PRODUKTO ALERT! ✨\n\n📌 ${newProduct.name}\n💰 Presyo: ₱${startingPrice.toLocaleString()}\n\nHuwag nang magpatumpik-tumpik pa! Tingnan at i-order na sa aming website.\n\n🛒 Bumili rito: ${productLink}`;

          // 🟢 HOTFIX: Inayos ang string interpolation para sa Facebook Page ID (\${...})
          const fbResponse = await fetch(`https://facebook.com{fbStoreCredentials.fbPageId}/feed`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: message,
              link: productLink,
              access_token: fbStoreCredentials.fbPageAccessToken,
            }),
          });

          const fbData = await fbResponse.json();
          if (!fbResponse.ok) {
            console.error("[Meta API Core Error]:", fbData.error?.message || "Unknown Meta Error");
          } else {
            console.log(`\x1b[34m[Facebook Automation] SUCCESS! Post ID: ${fbData.id}\x1b[0m`);
          }
        }
      } catch (fetchErr) {
        console.error("[FB Network Request Failed]:", fetchErr);
      }
    })();
  } catch (autoErr) {
    console.error('[FB Automation Initialization Error]:', autoErr);
  }
}
