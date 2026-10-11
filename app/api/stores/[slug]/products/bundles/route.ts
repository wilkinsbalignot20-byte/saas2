// app/api/stores/[slug]/products/bundles/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ==========================================
// 📦 POST METHOD: GUMAWA NG BAGONG PACK DEAL BUNDLE
// ==========================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, quantity, price, images, productIds } = body;

    // 1. BACK-END SAFETY CONSTRAINTS CHECK
    if (!name || !productIds || productIds.length === 0) {
      return NextResponse.json(
        { error: "Missing core required promotion parameters or product selection tags." },
        { status: 400 }
      );
    }

    // Kinukuha natin ang url pathname para ma-extract ang multi-tenant store slug parameters
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const slugIndex = pathParts.indexOf("stores");
    const slug = slugIndex !== -1 ? pathParts[slugIndex + 1] : null;

    if (!slug) {
      return NextResponse.json({ error: "Missing required store tenant identity context." }, { status: 400 });
    }

    // 2. TIMING AND IDENTIFICATION TRACKING
    const store = await prisma.store.findUnique({
      where: { slug: slug },
      select: { id: true }
    });

    if (!store) {
      return NextResponse.json({ error: "Store storefront profile metadata not found." }, { status: 404 });
    }

    // 3. SECURE BATCH TRANSACTION: Isave ang Bundle at i-tag ang Maramihang Produkto
    const newBundle = await prisma.$transaction(async (tx: any) => {
      
      // A. I-insert ang core data row sa product_bundles table structure
      const bundleRecord = await tx.productBundle.create({
        data: {
          name,
          quantity,
          price,
          images: images && images.length > 0 ? images[0] : "", // Isinasave ang group promotional picture link
          storeId: store.id
        }
      });

      // B. MAP CROSS-REFERENCE JUNCTION RECONCILIATION
      // Gumagawa ng linkages data structure para sa bundle_products join link tables framework
      const junctionLinks = productIds.map((pId: string) => ({
        bundleId: bundleRecord.id,
        productId: pId
      }));

      // Maramihang isasaksak sa junction schema mapping stack core array
      await tx.bundleProduct.createMany({
        data: junctionLinks
      });

      return bundleRecord;
    });

    return NextResponse.json({
      success: true,
      message: "Wholesale tier package bundle promotion successfully established.",
      bundle: newBundle
    }, { status: 201 });

  } catch (error: any) {
    console.error("[PRODUCT_BUNDLES_POST_API_ERROR]", error);
    return NextResponse.json(
      { error: "Internal System Database write rejection error occurred.", message: error.message },
      { status: 500 }
    );
  }
}
