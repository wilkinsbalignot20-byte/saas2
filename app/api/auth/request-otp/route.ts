import { NextResponse } from "next/server";
import { marketplaceInngest } from "@/inngest/marketplace-client";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // ⚡ I-trigger ang Inngest event handler na nagpapadala sa Gmail SMTP mo ngayon
    await marketplaceInngest.send({
      name: "customer/request.otp",
      data: {
        email: email.toLowerCase(),
      },
    });

    return NextResponse.json({ success: true, message: "OTP event triggered successfully." });
  } catch (error: any) {
    console.error("[API REQUEST OTP ERROR]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to trigger registration workflow." },
      { status: 500 }
    );
  }
}
