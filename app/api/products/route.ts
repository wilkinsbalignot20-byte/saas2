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

    // 3. SMART CATEGORY RESOLUTION (Dito natin aayusin ang problema mo)
    let finalCategoryId = categoryId;

    // Kung walang napiling kategorya sa dropdown pero may tinype sa input box:
    if (!finalCategoryId && newCategoryName) {
      const generatedSlug = newCategoryName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      // I-check muna kung umiiral na ang kategoryang ito para sa store na ito para maiwasan ang duplicate
      const existingCategory = await prisma.category.findFirst({
        where: {
          storeId: store.id,
          slug: generatedSlug
        }
      });

      if (existingCategory) {
        finalCategoryId = existingCategory.id;
      } else {
        // Kung talagang bago, awtomatikong gawin ang kategorya sa database real-time
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

    // Kung parehong walang dropdown selection at walang tinype na kategorya:
    if (!finalCategoryId) {
      return NextResponse.json(
        { error: 'Please specify a category by typing a new one or selecting from the list.' },
        { status: 400 }
      );
    }

    // 4. DATABASE TRANSACTION LAYER: SAVE PRODUCT & INVENTORY
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        images: images || [],
        status,
        storeId: store.id,
        categoryId: finalCategoryId, // Gamitin ang nalikha o nahanap na Category ID
        variants: {
          create: variants.map((v: any) => ({
            name: v.name,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
          })),
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
        { error: 'The SKU barcode you provided already exists in the system database inventory.' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal system database insertion error occurred.' }, { status: 500 });
  }
}
