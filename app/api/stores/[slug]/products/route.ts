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

    // 🌐 6. AUTOMATION LAYER: FACEBOOK AUTO-POST HOOK (BAGO)
    // Awtomatikong mag-ti-trigger LAMANG kapag ang status ng produkto ay "published"
    if (status === 'published') {
      try {
        // Kunin ang base url ng system mula sa requests para sa absolute routing path mechanics
        const { origin } = new URL(request.url);
        
        // Kunin ang panimulang presyo ng unang variant para sa caption layout profiling
        const startingPrice = Number(newProduct.variants[0]?.price || 0);
        
        // Buuin ang pampublikong link ng produkto na makikita sa 'shop/[slug]' storefront marketplace sector
        const productLink = `${origin}/shop/${slug}/products/${newProduct.id}`;

        // Tawagin ang multi-method endpoint route handler na paborito mong diskarte gamit ang fetch background promise
        // Gumagamit ng payload string action na TRIGGER_AUTO_POST gaya ng isinulat natin sa facebook/route.ts
        fetch(`${origin}/api/stores/${slug}/automation/facebook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'TRIGGER_AUTO_POST',
            productName: newProduct.name,
            price: startingPrice,
            productLink: productLink,
          }),
        }).catch((err) => console.error('[FB Auto-Post Background Call Failed]:', err));

      } catch (autoErr) {
        // Ibalot sa fail-silent try-catch block para kung magka-error man ang Facebook, 
        // hindi ma-re-reject o ma-ro-roll back ang pagkaka-save ng produkto sa database mo.
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
