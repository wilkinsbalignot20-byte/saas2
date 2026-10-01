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
    // Sinisiguro natin na ang bawat SKU ay may kasamang identifier ng store slug sa unahan
    // para hindi magka-clash ang magkaibang merchants na may parehong product structure.
    const cleanStorePrefix = slug.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 4);
    
    const isolatedVariants = variants.map((v: any) => {
      const rawSku = v.sku.trim().toUpperCase();
      
      // Kung ang merchant ay manu-manong nag-type ng SKU at hindi nito sinimulan sa store slug prefix,
      // awtomatiko nating ididikit ito sa unahan para sa database isolation layer.
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
          create: isolatedVariants, // Gamitin ang isolated variants na may protektadong SKU
        },
      },
      include: {
        variants: true,
      },
    });

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
