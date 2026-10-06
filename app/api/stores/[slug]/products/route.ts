 // app/api/products/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, name, description, categoryId, newCategoryName, status, variants, images } = body;

    // 1. BACK-END SAFETY VALIDATION CHECK
    if (!slug || !name || !variants || variants.length === 0) {
      return NextResponse.json(
        { error: 'Missing core required platform parameters.' },
        { status: 400 }
      );
    }

    // 2. HANAPIN ANG STORE ID GAMIT ANG TENANT SLUG
    const store = await prisma.store.findUnique({
      where: { slug: slug },
      select: { id: true }
    });

    if (!store) {
      return NextResponse.json({ error: 'Tenant storefront profile not found.' }, { status: 404 });
    }

    // 3. SMART CATEGORY RESOLUTION
    let finalCategoryId = categoryId;

    if (!finalCategoryId && newCategoryName) {
      const generatedSlug = newCategoryName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      // Isolation check sa kategorya para sa store na ito
      const existingCategory = await prisma.category.findFirst({
        where: {
          storeId: store.id,
          slug: generatedSlug
        }
      });

      if (existingCategory) {
        finalCategoryId = existingCategory.id;
      } else {
        const createdCategory = await prisma.category.create({
          data: {
            name: newCategoryName,
            slug: generatedSlug,
            storeId: store.id
          }
        });
        finalCategoryId = createdCategory.id;
      }
    }

    if (!finalCategoryId) {
      return NextResponse.json(
        { error: 'Please specify a category by typing a new one or selecting from the list.' },
        { status: 400 }
      );
    }

    // 4. MULTI-TENANT SKU ENFORCEMENT & INTEGRITY GUARD
    const cleanStorePrefix = slug.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 4);
    
    const isolatedVariants = variants.map((v: any) => {
      const rawSku = v.sku.trim().toUpperCase();
      
      const securedSku = rawSku.startsWith(cleanStorePrefix) 
        ? rawSku 
        : `${cleanStorePrefix}-${rawSku}`;

      return {
        name: v.name,
        sku: securedSku,
        price: v.price,
        stock: v.stock,
      };
    });

    // 5. DATABASE TRANSACTION LAYER: SAVE PRODUCT & INVENTORY
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        images: images || [],
        status,
        storeId: store.id,
        categoryId: finalCategoryId,
        variants: {
          create: isolatedVariants,
        },
      },
      include: {
        variants: true,
      },
    });

// 🌐 6. AUTOMATION LAYER: FACEBOOK AUTO-POST HOOK (DIREKTA AT LIGTAS)
if (status === 'published') {
  try {
    const { origin } = new URL(request.url);
    const startingPrice = Number(newProduct.variants[0]?.price || 0);
    const productLink = `${origin}/shop/${slug}/products/${newProduct.id}`;

    // 1. Kuhanin ang Facebook Credentials nang direkta mula sa nahanap nang store record
    const fbStoreCredentials = await prisma.store.findUnique({
      where: { id: store.id },
      select: { fbPageId: true, fbPageAccessToken: true }
    });

    // 2. Patakbuhin lamang kung kumpleto ang integration ng tenant
    if (fbStoreCredentials?.fbPageId && fbStoreCredentials?.fbPageAccessToken) {
      const message = `✨ BAGONG PRODUKTO ALERT! ✨\n\n📌 ${newProduct.name}\n💰 Presyo: ₱${startingPrice.toLocaleString()}\n\nHuwag nang magpatumpik-tumpik pa! Tingnan at i-order na sa aming website.\n\n🛒 Bumili rito: ${productLink}`;

      // Inilagay sa background execution nang hindi hinaharangan ang response ng Product creation
      (async () => {
        try {
          // Ginamit ang v21.0 (Stable Active Meta Graph Version)
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
        } catch (fetchErr) {
          console.error("[FB Network Request Failed]:", fetchErr);
        }
      })();
    } else {
      console.log(`[FB Automation] Skipped: Store ${slug} is not fully configured for Facebook posting.`);
    }

  } catch (autoErr) {
    console.error('[FB Automation Initialization Error]:', autoErr);
  }
}

    return NextResponse.json(newProduct, { status: 201 });

  } catch (error: any) {
    console.error('BACK-END SAVE REJECTION ERROR:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'The SKU barcode already exists or is being used by another shop on the platform.' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal system database insertion error occurred.' }, { status: 500 });
  }
}
