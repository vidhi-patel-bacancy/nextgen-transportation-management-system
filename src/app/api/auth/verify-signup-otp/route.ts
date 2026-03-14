import { NextResponse } from "next/server";

import { hashSecret } from "@/lib/auth/tokens";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { email?: string; otp?: string };
    const email = payload.email?.trim().toLowerCase();
    const otp = payload.otp?.trim();

    if (!email || !otp || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: "Valid email and 6-digit OTP are required." }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email_verified_at, signup_otp_hash, signup_otp_expires_at")
      .ilike("email", email)
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json({ error: "Invalid OTP." }, { status: 400 });
    }

    if (user.email_verified_at) {
      return NextResponse.json({ success: true });
    }

    if (!user.signup_otp_hash || !user.signup_otp_expires_at) {
      return NextResponse.json({ error: "OTP is missing or expired. Please resend OTP." }, { status: 400 });
    }

    const isExpired = new Date(user.signup_otp_expires_at).getTime() < Date.now();
    if (isExpired) {
      return NextResponse.json({ error: "OTP has expired. Please resend OTP." }, { status: 400 });
    }

    const otpHash = hashSecret(otp);
    if (otpHash !== user.signup_otp_hash) {
      return NextResponse.json({ error: "Invalid OTP." }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({
        email_verified_at: new Date().toISOString(),
        signup_otp_hash: null,
        signup_otp_expires_at: null,
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json({ error: "Unable to verify email." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
