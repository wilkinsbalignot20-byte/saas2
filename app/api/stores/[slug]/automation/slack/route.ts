 // app/api/stores/[slug]/automation/slack/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ slug: string }> };

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

// 📥 GET: Kinukuha ang kasalukuyang naka-save na config para ipakita sa UI
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;

    const store = await prisma.store.findUnique({
      where: { slug },
      select: { id: true, slackWebhookUrl: true },
    });

    if (!store) return fail("Hindi nahanap ang tindahan.", 404);

    return NextResponse.json({
      slackWebhookUrl: store.slackWebhookUrl || null,
      isConfigured: Boolean(store.slackWebhookUrl),
    }, { status: 200 });

  } catch (error) {
    console.error("Slack GET Error:", error);
    return fail("Internal Server Error.", 500);
  }
}

// 📤 POST: Tagaproseso ng Live Testing at Data Saving
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const body = await req.json().catch(() => null);
    if (!body) return fail("Walang nakitang request body.", 400);

    const store = await prisma.store.findUnique({ where: { slug }, select: { id: true, name: true } });
    if (!store) return fail("Hindi nahanap ang profile ng tindahan.", 404);

    // 🧪 CONTEXT A: LIVE TESTING GATEWAY
    if (body.action === "TEST_INGEST") {
      const { webhookUrl } = body;
      
      // Sinisiguro na ang link ay opisyal na nagmumula sa hooks.slack.com
      if (!webhookUrl || !webhookUrl.includes("hooks.slack.com")) {
        return fail("Maling format. Tiyaking 'hooks.slack.com' ang iyong URL.", 400);
      }

      const slackPayload = {
        text: `🚀 *WILKINS MULTI-TENANT HANDSHAKE SUCCESS!*`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `✨ *Matagumpay na nakatawid ang Ingestion Engine mo!* \n\n🏪 *Store Name:* ${store.name}\n🔗 *Tenant Slug:* ${slug}\n📡 *Gateway Status:* Connected & Operational`
            }
          },
          {
            type: "context",
            elements: [{ type: "mrkdwn", text: `Automated System Check • Live Server Verification` }]
          }
        ]
      };

      const slackResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slackPayload),
      });

      const resultText = await slackResponse.text();
      if (!slackResponse.ok || resultText.trim() !== "ok") {
        return fail(`Tinanggihan ng Slack ang request: ${resultText}`, 400);
      }

      return NextResponse.json({ success: true, status: "connected" });
    }

    // 💾 CONTEXT B: DB PERSISTENCE LAYER
    if (body.action === "SAVE_CONFIG") {
      const { webhookUrl } = body;

      if (!webhookUrl || !webhookUrl.includes("hooks.slack.com")) {
        return fail("Hindi wastong Slack Webhook URL format.", 400);
      }

      const updatedStore = await prisma.store.update({
        where: { id: store.id },
        data: { slackWebhookUrl: webhookUrl },
      });

      return NextResponse.json({ 
        success: true, 
        message: "Matagumpay na naitabi sa database.",
        slackWebhookUrl: updatedStore.slackWebhookUrl 
      });
    }

    return fail("Maling aksyon ang hiniling sa system.", 400);

  } catch (error: any) {
    return fail(error.message || "Failed to process automation routing.", 500);
  }
}

// 🗑️ DELETE: Pagbura ng koneksyon
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;

    const store = await prisma.store.findUnique({ where: { slug }, select: { id: true } });
    if (!store) return fail("Store context missing.", 404);

    await prisma.store.update({
      where: { id: store.id },
      data: { slackWebhookUrl: null },
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    // 🛠️ FIX: I-log ang error para magamit ang variable at hindi mag-warning ang linter
    console.error("Slack DELETE Error:", error);
    return fail("Bigo sa pagtanggal ng configuration.", 500);
  }
}
