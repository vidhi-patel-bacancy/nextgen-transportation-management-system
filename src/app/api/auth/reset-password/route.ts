import { NextResponse } from "next/server";

import { hashSecret } from "@/lib/auth/tokens";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { email?: string; token?: string; password?: string };
    const email = payload.email?.trim().toLowerCase();
    const token = payload.token?.trim();
    const password = payload.password;

    if (!email || !token || !password || password.length < 6) {
      return NextResponse.json({ error: "Valid email, token, and password are required." }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const tokenHash = hashSecret(token);
    const { data: resetRequest, error } = await supabase
      .from("password_reset_requests")
      .select("user_id, email, token_hash, expires_at")
      .ilike("email", email)
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (error || !resetRequest) {
      return NextResponse.json({ error: "Reset token is invalid or expired." }, { status: 400 });
    }

    if (new Date(resetRequest.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: "Reset token has expired." }, { status: 400 });
    }

    const { error: passwordError } = await supabase.auth.admin.updateUserById(resetRequest.user_id, {
      password,
    });

    if (passwordError) {
      return NextResponse.json({ error: "Unable to reset password." }, { status: 500 });
    }

    const { error: clearRequestError } = await supabase.from("password_reset_requests").delete().ilike("email", email);
    if (clearRequestError) {
      return NextResponse.json({ error: "Password updated, but cleanup failed." }, { status: 500 });
    }

    await supabase
      .from("users")
      .update({
        password_reset_token_hash: null,
        password_reset_expires_at: null,
        password_reset_sent_at: null,
      })
      .ilike("email", email);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
