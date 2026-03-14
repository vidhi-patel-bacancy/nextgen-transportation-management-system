import { NextResponse } from "next/server";

import { getAppBaseUrl, sendEmail } from "@/lib/email/mailer";
import { generateNumericOtp, hashSecret, minutesFromNow } from "@/lib/auth/tokens";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const OTP_TTL_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 45;

export const runtime = "nodejs";

function getSecondsSince(dateValue: string | null) {
  if (!dateValue) return Number.POSITIVE_INFINITY;
  return (Date.now() - new Date(dateValue).getTime()) / 1000;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { email?: string };
    const email = payload.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, email_verified_at, signup_otp_sent_at")
      .ilike("email", email)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: "Unable to process OTP request." }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ success: true });
    }

    if (user.email_verified_at) {
      return NextResponse.json({ error: "Email is already verified." }, { status: 400 });
    }

    const secondsSinceLastSent = getSecondsSince(user.signup_otp_sent_at);
    if (secondsSinceLastSent < OTP_RESEND_COOLDOWN_SECONDS) {
      return NextResponse.json(
        { error: `Please wait ${Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLastSent)}s before requesting another OTP.` },
        { status: 429 },
      );
    }

    const otp = generateNumericOtp(6);
    const otpHash = hashSecret(otp);

    const { error: updateError } = await supabase
      .from("users")
      .update({
        signup_otp_hash: otpHash,
        signup_otp_expires_at: minutesFromNow(OTP_TTL_MINUTES),
        signup_otp_sent_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json({ error: "Unable to save OTP." }, { status: 500 });
    }

    const appBaseUrl = getAppBaseUrl();

    await sendEmail({
      to: user.email,
      subject: "Verify your Cloud TMS email",
      text: `Your verification OTP is ${otp}. It expires in ${OTP_TTL_MINUTES} minutes.`,
      html: `<p>Your verification OTP is <strong>${otp}</strong>.</p><p>It expires in ${OTP_TTL_MINUTES} minutes.</p><p>You can verify it at <a href="${appBaseUrl}/verify-email?email=${encodeURIComponent(user.email)}">${appBaseUrl}/verify-email</a>.</p>`,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
