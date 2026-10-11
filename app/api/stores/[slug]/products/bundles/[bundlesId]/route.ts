 // app/api/stores/[slug]/products/bundles/[bundlesId]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client"; // I-import ang Prisma para sa safe Decimal formatting

// Helper para sa string array extraction ng images
const toImageArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string" && v.length > 0);
  return typeof value === "string" && value ? [value] : [];
};

// ==========================================
// 📝 1. PATCH METHOD: MAG-UPDATE NG BUNDLE
// ==========================================
export async function PATCH(
  request: Request,
  // 🟢 HOTFIX: Itinuwid ang pangalan mula bundleId patungong bundlesId para sumakto sa [bundlesId] folder name mo!
  { params }: { params: Promise<{ slug: string; bundlesId: string }> }
) {
  try {
    const { slug, bundlesId } = await params;
    const body = await request.json();
    const { name, description, bundleType, tiers, choices } = body;

    // 1. BACK-END VALIDATION
    if (!name || !bundleType || !tiers || tiers.length === 0) {
      return NextResponse.json(
        { error: "Missing core required promotion parameters, campaign strategy type, or package tiers." },
        { status: 400 }
      );
    }

    if (bundleType !== "MIX_AND_MATCH" && bundleType !== "FIXED_PACKAGE") {
      return NextResponse.json({ error: "Invalid bundle type." }, { status: 400 });
    }

    if (bundleType === "MIX_AND_MATCH" && (!choices || choices.length === 0)) {
      return NextResponse.json(
        { error: "Mix & Match bundles require at least one configured item choice option." },
        { status: 400 }
      );
    }

    // 2. TENANT ISOLATION
    const store = await prisma.store.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!store) {
      return NextResponse.json({ error: "Store storefront profile metadata not found or unauthorized access." }, { status: 404 });
    }

    const existing = await prisma.productBundle.findFirst({
      where: { id: bundlesId, storeId: store.id },
      select: { id: true }
    });

    if (!existing) {
      return NextResponse.json({ error: "Wholesale campaign bundle not found or unauthorized resource access." }, { status: 404 });
    }

    // 3. ATOMIC TRANSACTION (Delete + Recreate Tiers & Choices)
    const updated = await prisma.$transaction(async (tx: any) => {
      const bundleRecord = await tx.productBundle.update({
        where: { id: bundlesId },
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          bundleType
        }
      });

      // Linisin ang lumang tiers at gumawa ng bago gamit ang safe Prisma.Decimal tracking
      await tx.productBundleTier.deleteMany({ where: { bundleId: bundlesId } });
      await tx.productBundleTier.createMany({
        data: tiers.map((t: any) => ({
          bundleId: bundlesId,
          quantity: parseInt(t.quantity, 10) || 1,
          // 🟢 HOTFIX: Ginawang secure Prisma.Decimal para hindi tanggihan ng database layout mapping
          price: new Prisma.Decimal(t.price || 0), 
          images: toImageArray(t.images)
        }))
      });

      // Linisin ang lumang item choices at gumawa ng bago kung Mix & Match
      await tx.bundleItemChoice.deleteMany({ where: { bundleId: bundlesId } });
      if (bundleType === "MIX_AND_MATCH" && choices && choices.length > 0) {
        await tx.bundleItemChoice.createMany({
          data: choices.map((c: any) => ({
            bundleId: bundlesId,
            name: c.name.trim(),
            imageUrl: c.imageUrl || ""
          }))
        });
      }

      return bundleRecord;
    });

    return NextResponse.json({ 
      success: true, 
      message: "Wholesale package configurations successfully integrated.",
      bundle: updated 
    }, { status: 200 });

  } catch (error: any) {
    console.error("[PRODUCT_BUNDLES_PATCH_API_ERROR]", error);
    return NextResponse.json(
      { error: "Internal System Database write rejection error occurred.", message: error.message },
      { status: 500 }
    );
  }
}

// ==========================================
// 🗑️ 2. DELETE METHOD: MAGBURA NG BUNDLE
// ==========================================
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string; bundlesId: string }> }
) {
  try {
    const { slug, bundlesId } = await params;

    // Tenant Verification
    const store = await prisma.store.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!store) {
      return NextResponse.json({ error: "Store storefront profile metadata not found." }, { status: 404 });
    }

    const bundleToDelete = await prisma.productBundle.findFirst({
      where: { id: bundlesId, storeId: store.id }
    });

    if (!bundleToDelete) {
      return NextResponse.json({ error: "Bundle campaign record not found or unauthorized execution." }, { status: 404 });
    }

    // Awtomatikong mabubura ang mga tiers at choices dahil sa Cascade configuration ng schema mo
    await prisma.productBundle.delete({
      where: { id: bundlesId }
    });

    return NextResponse.json({
      success: true,
      message: "Wholesale bundle strategy record successfully destroyed."
    });

  } catch (error: any) {
    console.error("[PRODUCT_BUNDLES_DELETE_API_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
