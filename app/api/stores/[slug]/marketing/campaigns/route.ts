 import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

// ⚡ 1. GET METHOD: I-load ang mga Campaigns kasama ang kanilang CampaignRules at piniling mga produkto
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const { searchParams } = new URL(req.url);
    const typeFilter = searchParams.get("type");

    const store = await prisma.store.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!store) {
      return NextResponse.json({ error: "Hindi nahanap ang tindahan." }, { status: 404 });
    }

    const whereQuery: any = { storeId: store.id };
    
    if (typeFilter === "bundles") {
      whereQuery.type = { in: ["BUY_1_TAKE_1", "BUNDLE"] };
    } else if (typeFilter === "sales") {
      whereQuery.type = { in: ["FLASH_SALE", "THREE_DAY_SALE"] };
    }

    const campaigns = await prisma.campaign.findMany({
      where: whereQuery,
      include: {
        rules: true // 🌟 ISINAMA: Ibinabalik ang mga rules para malaman kung anong mga produkto ang may discount
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Campaign GET Error:", error);
    return NextResponse.json({ error: "Backend server error." }, { status: 500 });
  }
}

// ⚡ 2. POST METHOD: Mag-save ng Bagong Promo Campaign kasama ang mga piniling produkto at discount values
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const body = await req.json();
    
    // 🌟 GINAMIT: Tinatanggap na ang array ng `rules` mula sa frontend payload
    const { name, type, startDate, endDate, rules = [] } = body;

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

    // Paggawa ng campaign kasama ang nested rules block sa iisang database transaction
    const newCampaign = await prisma.campaign.create({
      data: {
        name,
        type,
        startDate,
        endDate,
        storeId: store.id,
        status: "UPCOMING", // Default status, si Inngest na ang mag-a-activate nito pagdating ng oras
        rules: {
          create: rules.map((rule: any) => ({
            productId: rule.productId || null,
            variantId: rule.variantId || null,
            promoPrice: rule.promoPrice ? Number(rule.promoPrice) : null,
            discountType: rule.discountType || "PERCENTAGE", // "PERCENTAGE" o "FIXED"
            discountValue: rule.discountValue ? Number(rule.discountValue) : 0.00,
            requiredQuantity: rule.requiredQuantity ? Number(rule.requiredQuantity) : 1,
            freeQuantity: rule.freeQuantity ? Number(rule.freeQuantity) : 0,
          }))
        }
      },
      include: {
        rules: true // I-include ang mga bagong gawang rules sa response payload ng frontend
      }
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

    const updatedCampaign = await prisma.campaign.update({
      where: { 
        id: campaignId,
        storeId: store.id 
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

// ⚡ 4. DELETE METHOD: Para burahin ang campaign gamit ang URL query parameter (?id=CAMPAIGN_ID)
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("id");

    if (!campaignId) {
      return NextResponse.json({ error: "Kulang ang Campaign ID." }, { status: 400 });
    }

    // Siguraduhin muna natin na ang tindahan ay may-ari talaga ng buburahing campaign
    const store = await prisma.store.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!store) {
      return NextResponse.json({ error: "Hindi nahanap ang tindahan." }, { status: 404 });
    }

    // 🌟 MAHALAGA: Kung may cascade delete ang Prisma schema mo para sa CampaignRules, sapat na ito.
    // Kung walang cascade delete sa schema, kailangan muna nating burahin nang manu-mano ang mga rules:
    await prisma.campaignRule.deleteMany({
      where: { campaignId: campaignId }
    });

    // Pagbura sa mismong campaign record
    const deletedCampaign = await prisma.campaign.delete({
      where: {
        id: campaignId,
        storeId: store.id,
      },
    });

    return NextResponse.json({ success: true, message: "Matagumpay na nabura ang campaign.", deletedCampaign });
  } catch (error) {
    console.error("Campaign DELETE Error:", error);
    return NextResponse.json({ error: "Hindi ma-delete ang campaign." }, { status: 500 });
  }
}
