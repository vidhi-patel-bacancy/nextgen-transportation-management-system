import { NextResponse } from "next/server";

import { getAppBaseUrl, isSandboxSmtp, sendEmail } from "@/lib/email/mailer";
import { generateSecureToken, hashSecret, minutesFromNow } from "@/lib/auth/tokens";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const RESET_TTL_MINUTES = 30;

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { email?: string };
    const email = payload.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (authUsersError) {
      return NextResponse.json({ error: "Unable to process reset request." }, { status: 500 });
    }

    const authUser = authUsers.users.find((item) => item.email?.toLowerCase() === email);
    if (!authUser?.id || !authUser.email) {
      return NextResponse.json({ success: true });
    }

    const rawToken = generateSecureToken(24);
    const tokenHash = hashSecret(rawToken);

    await supabase.from("password_reset_requests").delete().eq("email", authUser.email.toLowerCase());

    const { error: insertError } = await supabase.from("password_reset_requests").insert({
      user_id: authUser.id,
      email: authUser.email.toLowerCase(),
      token_hash: tokenHash,
      expires_at: minutesFromNow(RESET_TTL_MINUTES),
    });

    if (insertError) {
      return NextResponse.json({ error: "Unable to create reset token." }, { status: 500 });
    }

    await supabase
      .from("users")
      .update({
        password_reset_token_hash: tokenHash,
        password_reset_expires_at: minutesFromNow(RESET_TTL_MINUTES),
        password_reset_sent_at: new Date().toISOString(),
      })
      .ilike("email", authUser.email);

    const resetUrl = new URL("/reset-password", getAppBaseUrl());
    resetUrl.searchParams.set("email", authUser.email);
    resetUrl.searchParams.set("token", rawToken);

    await sendEmail({
      to: authUser.email,
      subject: "Reset your Cloud TMS password",
      text: `Use this link to reset your password: ${resetUrl.toString()} (expires in ${RESET_TTL_MINUTES} minutes).`,
      html: `<p>Use this link to reset your password:</p><p><a href="${resetUrl.toString()}">${resetUrl.toString()}</a></p><p>This link expires in ${RESET_TTL_MINUTES} minutes.</p>`,
    });

    return NextResponse.json({
      success: true,
      sandbox: isSandboxSmtp(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
