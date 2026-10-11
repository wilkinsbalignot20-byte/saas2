 // app/api/stores/[slug]/products/bundles/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ==========================================
// 📦 POST METHOD: GUMAWA NG BAGONG HYBRID PACK DEAL O MIX-AND-MATCH BUNDLE
// ==========================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 🌟 INAYOS: Binabasa na ang updated request indicators mula sa useBundleForm engine
    const { name, description, bundleType, tiers, choices } = body;

    // 1. BACK-END SAFETY CONSTRAINTS VALIDATION
    // 🌟 INAYOS: Tinanggal ang choices validation dito para hindi mag-error kapag FIXED_PACKAGE ang isinusumite
    if (!name || !bundleType || !tiers || tiers.length === 0) {
      return NextResponse.json(
        { error: "Missing core required promotion parameters, campaign strategy type, or package tiers." },
        { status: 400 }
      );
    }

    // 🛡️ SECURITY GUARD: Dito lang natin sapilitang hahanapin ang choices kapag ang active setting ay MIX_AND_MATCH
    if (bundleType === "MIX_AND_MATCH" && (!choices || choices.length === 0)) {
      return NextResponse.json(
        { error: "Mix & Match bundles require at least one configured item choice option." },
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

    // 2. TENANT ISOLATION PROFILE TRACKING
    const store = await prisma.store.findUnique({
      where: { slug: slug },
      select: { id: true }
    });

    if (!store) {
      return NextResponse.json({ error: "Store storefront profile metadata not found or unauthorized access." }, { status: 404 });
    }

    // 3. SECURE BATCH TRANSACTION ENGINE: Ligtas na isave ang magkakaugnay na data records
    const newBundle = await prisma.$transaction(async (tx: any) => {
      
      // A. I-insert ang core campaign data card (Kasama na ang bundleType!)
      const bundleRecord = await tx.productBundle.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          bundleType: bundleType, // ➔ "MIX_AND_MATCH" o "FIXED_PACKAGE" (Pack/Box)
          status: "published",   // Awtomatikong naka-live para magamit agad ng tenant
          storeId: store.id
        }
      });

      // B. DYNAMIC PRICING TIERS DATA INJECTION
      // Isinasaksak ang bundle configurations (e.g., Bundle of 1, 3, o 5) kasama ang Cloudinary marketing group banner links
      const tierRecords = tiers.map((t: any) => ({
        bundleId: bundleRecord.id,
        quantity: parseInt(t.quantity, 10) || 1,
        price: parseFloat(t.price) || 0,
        images: t.images || "" 
      }));

      await tx.productBundleTier.createMany({
        data: tierRecords
      });

      // C. 🌟 INAYOS AT SELYADO: 
      // Patatakbuhin LAMANG ang database insert kung MIX_AND_MATCH ang pinili AT may aktwal na laman ang choices array.
      // Kapag FIXED_PACKAGE (at empty array), lalaktawan ito nang buo para hindi mag-error ang Supabase transaction!
      if (bundleType === "MIX_AND_MATCH" && choices && choices.length > 0) {
        const choiceRecords = choices.map((c: any) => ({
          bundleId: bundleRecord.id,
          name: c.name.trim(),
          imageUrl: c.imageUrl || "" 
        }));

        await tx.bundleItemChoice.createMany({
          data: choiceRecords
        });
      }

      return bundleRecord;
    });

    return NextResponse.json({
      success: true,
      message: "Wholesale strategy package bundle campaign successfully synchronized and established.",
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