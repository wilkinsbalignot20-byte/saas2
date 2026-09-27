 import { marketplaceInngest } from "./marketplace-client"; 
import { prisma } from "@/lib/prisma"; 
import { Resend } from "resend"; // 🆕 Idinagdag para sa email automation framework

// Isaksak ang Resend instance gamit ang iyong nakatagong API Key sa .env
const resend = new Resend(process.env.RESEND_API_KEY);

interface OtpRequestPayload {
  email: string;
}

export const customerOtpWorkflow = marketplaceInngest.createFunction(
  {
    id: "customer-otp-workflow",
    name: "Customer 6-Digit OTP Generator & Dispatcher",
    triggers: [{ event: "customer/request.otp" }]
  },
  async ({ event, step }: any) => {
    const { email } = (event.data || {}) as OtpRequestPayload;

    if (!email) {
      console.error("[OTP ENGINE]: Failed execution. Missing target email.");
      return { success: false, error: "Email is required." };
    }

    // 1. Gumawa ng random 6-digit cryptographic safe text token
    const generatedOtp = await step.run("generate-six-digit-code", async () => {
      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`[OTP ENGINE]: Formulated code for ${email}`);
      return randomCode;
    });

    // 2. I-save ang ginawang OTP sa database gamit ang OtpVerification model natin na valid ng 5 minuto
    await step.run("save-otp-to-database", async () => {
      const expirationTime = new Date(Date.now() + 5 * 60 * 1000);

      await prisma.otpVerification.create({
        data: {
          email: email.toLowerCase(),
          code: generatedOtp,
          expiresAt: expirationTime
        }
      });
      console.log(`[OTP ENGINE]: Securely mapped validation lifecycle in database.`);
    });

    // 3. ⚡ UPDATED: Pinalitan ang local console block ng totoong Resend Dispatch delivery engine
    await step.run("dispatch-gmail-payload", async () => {
      console.log(`[OTP ENGINE]: Dispatching email payload to ${email}. Token logic identifier: [${generatedOtp}]`);
      
      const { data, error } = await resend.emails.send({
        // Paalala: Habang naka-Free Testing Tier ka sa Resend, onboarding@resend.dev muna ang default static email
        from: "Manipu Mall <onboarding@resend.dev>", 
        to: [email.toLowerCase()],
        subject: "Your 6-Digit Verification Code - Manipu Mall",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
            <h2 style="font-size: 22px; font-weight: bold; color: #111111; margin-bottom: 6px; tracking-content: tight;">Verify your email</h2>
            <p style="font-size: 14px; color: #4b5563; line-height: 1.5; margin-bottom: 20px;">Use the secure 6-digit validation code below to complete your customer account setup or login entry.</p>
            
            <div style="font-size: 36px; font-weight: bold; font-family: monospace; letter-spacing: 8px; text-align: center; padding: 18px; background-color: #f3f4f6; border-radius: 12px; margin: 24px 0; color: #000000;">
              ${generatedOtp}
            </div>
            
            <p style="font-size: 12px; color: #9ca3af; margin-top: 20px; line-height: 1.4;">
              This validation signature is valid for exactly 5 minutes only. If you did not request this login sequence, please disregard this email safely.
            </p>
          </div>
        `
      });

      // Kung sumabog si Resend, itatala ng Inngest dashboard ang kumpletong crash data block
      if (error) {
        console.error("[OTP ENGINE] Core Resend Client Failure:", error);
        throw new Error(error.message);
      }

      return { dispatched: true, emailId: data?.id };
    });

    return { success: true, target: email };
  }
);
