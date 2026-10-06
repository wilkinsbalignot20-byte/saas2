 import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ slug: string }> };

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

// 1. GET METHOD: Para sa Store Configurations AT para sa Facebook Webhook Verification
export async function GET(req: NextRequest, context: RouteContext) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // KUNG ITO AY GALING SA FACEBOOK WEBHOOK VERIFICATION SETUP
  if (mode && token) {
    const VERIFY_TOKEN = process.env.MESSENGER_VERIFICATION_TOKEN || "mannipu_secret_123"; // Palitan mo ito sa iyong .env file
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✔️ [Facebook Webhook] Verified Successfully!");
      return new NextResponse(challenge, { status: 200 });
    }
    return new NextResponse("Forbidden", { status: 403 });
  }

  // KUNG REGULAR NA GET REQUEST PARA SA UI STORE STATUS
  try {
    const { slug } = await context.params;

    const store = await prisma.store.findUnique({
      where: { slug },
      select: {
        id: true,
        fbPageId: true,
        fbPageAccessToken: true,
      },
    });

    if (!store) return fail("Store not found.", 404);

    return NextResponse.json({
      fbPageId: store.fbPageId || null,
      isConfigured: Boolean(store.fbPageAccessToken),
      pageName: store.fbPageAccessToken ? "Wilkins Live Connected Store" : null
    }, { status: 200 });

  } catch (error) {
    console.error("FB Automation GET Error:", error);
    return fail("Internal Server Error", 500);
  }
}

// 2. POST METHOD: Para sa Automation Actions AT Messenger Chat Webhooks
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const body = await req.json().catch(() => null);
    if (!body) return fail("Invalid request body.", 400);

    // KUNG ANG REQUEST AY GALING SA WEBHOOK NG MESSENGER CHAT
    if (body.object === "page") {
      // Hanapin natin ang tamang Page Token mula sa database base sa page ID na nagpadala ng event
      for (const entry of body.entry) {
        const webhookEvent = entry.messaging?.[0];
        if (!webhookEvent) continue;

        const senderId = webhookEvent.sender.id;
        const pageId = entry.id;

        // Kunin ang token mula sa DB gamit ang pageId para dynamic at hindi hardcoded
        const connectedStore = await prisma.store.findFirst({
          where: { fbPageId: pageId },
          select: { fbPageAccessToken: true }
        });

        if (connectedStore?.fbPageAccessToken && webhookEvent.message?.text) {
          const userMessage = webhookEvent.message.text;
          console.log(`💬 Naka-tanggap ng chat mula kay ${senderId}: "${userMessage}"`);

          // MAG-AUTO REPLY SA MESSENGER
          await fetch(`https://facebook.com{connectedStore.fbPageAccessToken}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recipient: { id: senderId },
              message: { text: `Salamat sa iyong mensahe! Nakuha ko ang iyong sinabi: "${userMessage}"` }
            })
          });
        }
      }
      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    }

    // MGA REGULAR NA ADMIN ACTIONS (CONNECT, AUTO_POST, atbp.)
    const store = await prisma.store.findUnique({ where: { slug }, select: { id: true, fbPageId: true, fbPageAccessToken: true } });
    if (!store) return fail("Store not found.", 404);

    // ACTION: CONNECT MOCK (I-paste dito ang bagong token na kinuha mo sa developer dashboard mo)
    if (body.action === "CONNECT_MOCK") {
      const realPageId = "1334813689721648"; // Palitan mo ito ng Page ID ng "Mannipu" kung magkaiba sila
      const realPageToken = "EAAlRujpV6EcBSpS5cjGE61Ea7Sl2zSyqh0nrmacJFOYZClEbWoPupBYqE005tPInHYjUrGEM0YLnGfgfZBLtAw6qhaqx3SAKcQhonb5ZBuZC57CAcCZAZCaz8OfmZCQgf98f8GC9nagtaiYBepgZAQrMdMWhz6i8hhRZBVB1zL2Q3lkzShxdQNo31ABWqDSNRdKcxY8OhXEOJJQZDZD"; 

      const updatedStore = await prisma.store.update({
        where: { id: store.id },
        data: {
          fbPageId: realPageId,
          fbPageAccessToken: realPageToken,
        }
      });

      console.log(`\x1b[32m[Facebook Automation] SUCCESS! Connection Established for Page ID: ${realPageId}\x1b[0m`);

      return NextResponse.json({ 
        success: true, 
        fbPageId: updatedStore.fbPageId, 
        isConfigured: true,
        pageName: "Wilkins Live Connected Store" 
      });
    }

    // ACTION: TRIGGER AUTO POST (Inayos ang maling URL string interpolation bug)
    if (body.action === "TRIGGER_AUTO_POST") {
      const { productName, price, productLink } = body;

      if (!store.fbPageId || !store.fbPageAccessToken) {
        return NextResponse.json({ skipped: true, reason: "Not configured" });
      }

      const message = `✨ BAGONG PRODUKTO ALERT! ✨\n\n📌 ${productName}\n💰 Presyo: ₱${price.toLocaleString()}\n\nHuwag nang magpatumpik-tumpik pa! Tingnan at i-order na sa aming website.\n\n🛒 Bumili rito: ${productLink}`;

      // INAYOS NA RE-ROUTE: Ginamit ang tamang Graph API base endpoint at template literal string
      const response = await fetch(`https://facebook.com{store.fbPageId}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message,
          link: productLink,
          access_token: store.fbPageAccessToken,
        }),
      });

      const fbData = await response.json();
      if (!response.ok) {
        throw new Error(fbData.error?.message || "Meta Server Graph Error");
      }

      return NextResponse.json({ success: true, postId: fbData.id });
    }

    return fail("Invalid action specified.", 400);

  } catch (error: any) {
    console.error("FB Automation POST Error:", error);
    return fail(error.message || "Could not execute automation.", 500);
  }
}

// 3. DELETE METHOD: Para mag-disconnect ng integration
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    const store = await prisma.store.findUnique({ 
      where: { slug }, 
      select: { id: true } 
    });

    if (!store) return fail("Store not found.", 404);

    await prisma.store.update({
      where: { id: store.id },
      data: {
        fbPageId: null,
        fbPageAccessToken: null,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error("FB Automation DELETE Error:", error);
    return fail("Internal Server Error occurred while disconnecting.", 500);
  }
}
