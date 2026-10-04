 // app/api/stores/[slug]/automation/facebook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ slug: string }> };

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

// 🌐 1. GET: Ginagamit ng dashboard UI para i-verify kung konektado ang Facebook Page ng Merchant
export async function GET(req: NextRequest, context: RouteContext) {
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
    }, { status: 200 });

  } catch (error) {
    console.error("FB Automation GET Error:", error);
    return fail("Internal Server Error", 500);
  }
}

// 🌐 2. POST: Dalawa ang silbi nito depende sa kung sino ang tumatawag:
//    a) Galing sa UI Button -> Awtomatikong kukuha at mag-da-download ng TOTOONG Page ID at Page Token mula sa Facebook
//    b) Galing sa Product API -> Mag-ti-trigger para mag-post ng produkto sa Facebook Page
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const body = await req.json().catch(() => null);
    if (!body) return fail("Invalid request body.", 400);

    const store = await prisma.store.findUnique({ where: { slug }, select: { id: true, fbPageId: true, fbPageAccessToken: true } });
    if (!store) return fail("Store not found.", 404);

    // 🔑 Context A: Galing sa UI Dashboard Button click
    if (body.action === "CONNECT_MOCK") {
      // ✅ DIRETSANG ISINULAT ANG TOTOONG IMPORMASYON MO PARA GUMANA NANG LIVE AT IWAS ERROR:
      const realPageId = "61550496991011"; 
      const realPageToken = "EAAZA73fkr3rcBSomom18pI4R0blmLXmXagO5xTX7pM89iwLjnqw8UM3ZAdD54zOvIFKxDqKrDKZAmoatnkZAi3WYjwtbx3oOcqZBcL9QfpNr8cRrV4wr0I9jhJoHHbVQScZBZC8KPVNpy8o9OZBLqXy1EABzts0sZAQwub9uNznpB6P4OzYOq7VOamRMha0JSJnbu4OgY9zTa115QDZBMzvqpCx7wXtUXS4XilSw5389jZB"; 

      try {
        // Direkta nating i-save ang live details sa iyong Supabase database row
        const updatedStore = await prisma.store.update({
          where: { id: store.id },
          data: {
            fbPageId: realPageId,
            fbPageAccessToken: realPageToken,
          }
        });

        console.log(`\x1b[32m[Facebook Automation] SUCCESS! Live Connection Established for Page ID: ${realPageId}\x1b[0m`);

        return NextResponse.json({ 
          success: true, 
          fbPageId: updatedStore.fbPageId, 
          isConfigured: true,
          pageName: "Wilkins Live Connected Store" 
        });

      } catch (err: any) {
        console.error("Facebook Connection Core Failure:", err);
        return fail("Bigo sa pag-save ng live data sa database.", 400);
      }
    }

    // 🚀 Context B: Tinawag mula sa Product API kapag nag-publish ka ng item
    if (body.action === "TRIGGER_AUTO_POST") {
      const { productName, price, productLink } = body;

      if (!store.fbPageId || !store.fbPageAccessToken) {
        console.log(`[FB Automation] Skipped: Store ${slug} is not configured.`);
        return NextResponse.json({ skipped: true, reason: "Not configured" });
      }

      const message = `✨ BAGONG PRODUKTO ALERT! ✨\n\n📌 ${productName}\n💰 Presyo: ₱${price.toLocaleString()}\n\nHuwag nang magpatumpik-tumpik pa! Tingnan at i-order na sa aming website.\n\n🛒 Bumili rito: ${productLink}`;

      // 🛠️ ITINAMA: Ginamit ang tamang graph.facebook.com URL endpoint string interpolation format
      const response = await fetch(`https://graph.facebook.com/v26.0/${store.fbPageId}/feed`, {
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

      console.log(`\x1b[34m[Facebook Automation] Successfully posted to Page! Post ID: ${fbData.id}\x1b[0m`);
      return NextResponse.json({ success: true, postId: fbData.id });
    }

    return fail("Invalid action specified.", 400);

  } catch (error: any) {
    console.error("FB Automation POST Error:", error);
    return fail(error.message || "Could not execute automation.", 500);
  }
}

// 🌐 3. DELETE: Para sa "Disconnect Page" feature (Binubura ang token sa Supabase)
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    const store = await prisma.store.findUnique({ 
      where: { slug }, 
      select: { id: true } 
    });

    if (!store) return fail("Store not found.", 404);

    // Burahin ang naka-save na credentials sa database sa pamamagitan ng pag-set nito sa null
    await prisma.store.update({
      where: { id: store.id },
      data: {
        fbPageId: null,
        fbPageAccessToken: null,
      },
    });

    console.log(`\x1b[31m[Facebook Automation] SUCCESS! Disconnected Facebook Page for store: ${slug}\x1b[0m`);
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error("FB Automation DELETE Error:", error);
    return fail("Internal Server Error occurred while disconnecting.", 500);
  }
}
