import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

// ⚡ 1. GET METHOD: I-load ang mga Campaigns ng tenant (May Filter base sa Query)
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const { searchParams } = new URL(req.url);
    const typeFilter = searchParams.get("type"); // Titingnan kung ?type=bundles ang tawag mula sa frontend

    const store = await prisma.store.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!store) {
      return NextResponse.json({ error: "Hindi nahanap ang tindahan." }, { status: 404 });
    }

    // Bumuo ng dynamic query filter para sa multi-tenant layer
    const whereQuery: any = { storeId: store.id };
    
    if (typeFilter === "bundles") {
      whereQuery.type = { in: ["BUY_1_TAKE_1", "BUNDLE"] };
    } else if (typeFilter === "sales") {
      whereQuery.type = { in: ["FLASH_SALE", "THREE_DAY_SALE"] };
    }

    const campaigns = await prisma.campaign.findMany({
      where: whereQuery,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Campaign GET Error:", error);
    return NextResponse.json({ error: "Backend server error." }, { status: 500 });
  }
}

// ⚡ 2. POST METHOD: Mag-save ng Bagong Promo Campaign (Flash Sale, BOGO, etc.)
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const body = await req.json();
    const { name, type, startDate, endDate } = body;

    if (!name || !type || !startDate || !endDate) {
      return NextResponse.json({ error: "Kulang ang detalye ng campaign." }, { status: 400 });
    }

    const store = await prisma.store.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!store) {
      return NextResponse.json({ error: "Hindi nahanap ang tindahan." }, { status: 404 });
    }

    const newCampaign = await prisma.campaign.create({
      data: {
        name,
        type,
        startDate,
        endDate,
        storeId: store.id,
        status: "UPCOMING", // Default status, si Inngest na ang mag-a-activate nito pagdating ng oras
      },
    });

    return NextResponse.json(newCampaign, { status: 201 });
  } catch (error) {
    console.error("Campaign POST Error:", error);
    return NextResponse.json({ error: "Hindi ma-save ang campaign." }, { status: 500 });
  }
}

// ⚡ 3. PATCH METHOD: Para sa Monetization (Pay & Premium Ad Boost Placement)
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const body = await req.json();
    const { campaignId, isPremiumBoosted, boostedSlotType } = body;

    if (!campaignId) {
      return NextResponse.json({ error: "Kulang ang Campaign ID." }, { status: 400 });
    }

    const store = await prisma.store.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!store) {
      return NextResponse.json({ error: "Hindi nahanap ang tindahan." }, { status: 404 });
    }

    // 🛡️ Lock: Siguraduhin na ang campaign na i-a-upgrade ay pagmamay-ari talaga ng store na ito
    const updatedCampaign = await prisma.campaign.update({
      where: { 
        id: campaignId,
        storeId: store.id // Isolation guard filter
      },
      data: {
        isPremiumBoosted,
        boostedSlotType,
      },
    });

    return NextResponse.json(updatedCampaign);
  } catch (error) {
    console.error("Campaign PATCH Error:", error);
    return NextResponse.json({ error: "Hindi ma-update ang premium ad boost status." }, { status: 500 });
  }
}
