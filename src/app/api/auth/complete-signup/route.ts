import { NextResponse } from "next/server";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/types";

export const runtime = "nodejs";

const USER_ROLES: UserRole[] = ["admin", "manager", "carrier", "customer"];

function isUserRole(value: string): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      userId?: string;
      email?: string;
      role?: string;
      organizationName?: string;
    };

    const userId = payload.userId?.trim();
    const email = payload.email?.trim().toLowerCase();
    const role = payload.role?.trim().toLowerCase();
    const organizationName = payload.organizationName?.trim();

    if (!userId || !email || !role || !organizationName) {
      return NextResponse.json({ error: "Missing required signup fields." }, { status: 400 });
    }

    if (!isUserRole(role)) {
      return NextResponse.json({ error: "Invalid role selected." }, { status: 400 });
    }

    if (organizationName.length < 2) {
      return NextResponse.json({ error: "Organization name must be at least 2 characters." }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    const {
      data: { user: authUser },
      error: authUserError,
    } = await supabase.auth.admin.getUserById(userId);

    if (authUserError || !authUser?.email) {
      return NextResponse.json({ error: "Unable to verify account identity." }, { status: 400 });
    }

    if (authUser.email.toLowerCase() !== email) {
      return NextResponse.json({ error: "Email mismatch for account setup." }, { status: 400 });
    }

    const { data: existingProfile, error: existingProfileError } = await supabase.from("users").select("id").eq("id", userId).maybeSingle();
    if (existingProfileError) {
      return NextResponse.json({ error: "Unable to check existing profile." }, { status: 500 });
    }

    if (existingProfile?.id) {
      return NextResponse.json({ success: true });
    }

    const { data: organization, error: organizationError } = await supabase
      .from("organizations")
      .insert({ name: organizationName })
      .select("id")
      .single();

    if (organizationError || !organization?.id) {
      return NextResponse.json({ error: "Unable to create organization." }, { status: 500 });
    }

    const { error: profileError } = await supabase.from("users").insert({
      id: userId,
      email,
      role,
      organization_id: organization.id,
    });

    if (profileError) {
      return NextResponse.json({ error: "Unable to create user profile." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
