 import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server"; // Gamitin ang server instance para sa API endpoint

export async function POST(request: Request) {
  try {
    const { email, code, profile } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and verification token are required." }, { status: 400 });
    }

    // 1. Hanapin ang OTP record sa iyong Supabase database gamit ang Prisma model
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        email: email.toLowerCase(),
        code: code,
      },
    });

    // Kung hindi tugma ang code
    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid verification code. Please check your inbox." }, { status: 400 });
    }

    // Kung lumipas na ang 5 minutong itinakda natin sa lifecycle mapping
    if (new Date() > new Date(otpRecord.expiresAt)) {
      return NextResponse.json({ error: "Verification code has already expired." }, { status: 400 });
    }

    // 2. I-set up ang Supabase Server Client para irehistro ang Authentication User
    const supabase = await createClient();
    
    // Gagawa tayo ng random password placeholder dahil passwordless ang register screen mo ngayon
    const secureTemporaryPassword = Math.random().toString(36) + "M@n1puMall!";

    const { data: authData, error: authSignUpError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password: secureTemporaryPassword,
      options: {
        data: {
          full_name: profile.fullName,
          role: "customer",
        },
      },
    });

    if (authSignUpError) throw authSignUpError;

    // 3. Matapos magawa ang user ID sa Supabase, i-save ang structured delivery profile sa core customer table
    if (authData.user) {
      // Ginamit ang signupCustomer model base sa iyong Prisma configuration mapping
      await prisma.signupCustomer.create({
        data: {
          id: authData.user.id, // I-map ang UUID mula sa Supabase Auth System
          email: email.toLowerCase(), // Idinagdag dahil NOT NULL ito sa iyong DB constraint
          fullName: profile.fullName,
          phone: profile.phone,
          altPhone: profile.altPhone || null,
          street: profile.street,
          barangay: profile.barangay,
          city: profile.city,  
          province: profile.province,
          zipCode: profile.zipCode,
        },
      });

      // Linisin ang otp_verifications table matapos ang matagumpay na registration
      await prisma.otpVerification.deleteMany({
        where: { email: email.toLowerCase() },
      });
    }

    return NextResponse.json({ success: true, user: authData.user });
  } catch (error: any) {
    console.error("[API VERIFY OTP ERROR]:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during database lifecycle assignment." },
      { status: 500 }
    );
  }
}
