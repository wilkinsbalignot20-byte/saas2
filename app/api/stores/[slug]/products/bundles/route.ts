 // app/api/stores/[slug]/products/bundles/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// ==========================================
// 📦 POST METHOD: GUMAWA NG CAMPAIGN BUNDLE
// ==========================================
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { name, description, bundleType, tiers, choices } = body;

    // 1. BACK-END VALIDATION SECURITY
    if (!name || !bundleType || !tiers || tiers.length === 0) {
      return NextResponse.json({ error: "Missing required parameters or package tiers." }, { status: 400 });
    }

    // 2. TENANT PROFILE RESOLUTION
    const store = await prisma.store.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!store) {
      return NextResponse.json({ error: "Store storefront profile metadata not found." }, { status: 404 });
    }

    // 3. ATOMIC DATABASE TRANSACTION WRITE
    const newBundle = await prisma.$transaction(async (tx: any) => {
      const bundleRecord = await tx.productBundle.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          bundleType,
          status: "published",
          storeId: store.id
        }
      });

      // Itinugma ang mapping sa single string structure ng t.images
      const tierRecords = tiers.map((t: any) => ({
        bundleId: bundleRecord.id,
        quantity: parseInt(t.quantity, 10) || 1,
        price: new Prisma.Decimal(t.price || 0), // Ligtas sa runtime database typing validation blocks
        images: t.images || ""
      }));

      await tx.productBundleTier.createMany({ data: tierRecords });

      // Isasave lamang ang choices kung ang operational type ay MIX_AND_MATCH
      if (bundleType === "MIX_AND_MATCH" && choices && choices.length > 0) {
        const choiceRecords = choices.map((c: any) => ({
          bundleId: bundleRecord.id,
          name: c.name.trim(),
          imageUrl: c.imageUrl || ""
        }));

        await tx.bundleItemChoice.createMany({ data: choiceRecords });
      }

      return bundleRecord;
    });

    return NextResponse.json({
      success: true,
      message: "Wholesale campaign bundle successfully integrated.",
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

// ==========================================
// 🎟️ GET METHOD: KUNIN ANG LAHAT NG BUNDLES
// ==========================================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const store = await prisma.store.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!store) {
      return NextResponse.json({ error: "Store storefront profile metadata not found." }, { status: 404 });
    }

    const bundles = await prisma.productBundle.findMany({
      where: { storeId: store.id },
      include: {
        tiers: { orderBy: { quantity: 'asc' } },
        choices: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(bundles);

  } catch (error: any) {
    console.error("[PRODUCT_BUNDLES_GET_API_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server database lookup rejection error occurred." },
      { status: 500 }
    );
  }
}
