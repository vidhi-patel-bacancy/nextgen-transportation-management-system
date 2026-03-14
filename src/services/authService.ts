import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types";
import type { Database } from "@/types/supabase";

type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];

type AuthApiResponse = {
  success?: boolean;
  error?: string;
  sandbox?: boolean;
};

async function callAuthApi(path: string, body: Record<string, unknown>) {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => ({}))) as AuthApiResponse;

  if (!response.ok) {
    throw new Error(payload.error ?? "Authentication request failed.");
  }

  return payload;
}

export async function login(email: string, password: string) {
  const supabase = createClient();
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });
  if (error) throw error;

  if (!data.user?.id) {
    throw new Error("Unable to resolve user profile.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("email_verified_at")
    .eq("id", data.user.id)
    .single();

  if (profileError) {
    await supabase.auth.signOut();
    throw new Error("Unable to verify account status.");
  }

  if (!profile.email_verified_at) {
    await supabase.auth.signOut();
    throw new Error("Email is not verified. Please complete OTP verification.");
  }

  return data;
}

export async function signup({
  email,
  password,
  role,
  organizationName,
}: {
  email: string;
  password: string;
  role: UserRole;
  organizationName: string;
}) {
  const supabase = createClient();
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
  });
  if (error) throw error;

  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .insert({ name: organizationName })
    .select("*")
    .single();
  if (orgError) throw orgError;
  const org = organization as OrganizationRow;

  if (!data.user?.id) {
    throw new Error("User account was created without a user id.");
  }

  const { error: profileError } = await supabase.from("users").upsert({
    id: data.user.id,
    email: normalizedEmail,
    role,
    organization_id: org.id,
  });

  if (profileError) throw profileError;

  return data;
}

export async function requestSignupOtp(email: string) {
  return callAuthApi("/api/auth/send-signup-otp", {
    email,
  });
}

export async function verifySignupOtp(email: string, otp: string) {
  return callAuthApi("/api/auth/verify-signup-otp", {
    email,
    otp,
  });
}

export async function requestPasswordReset(email: string) {
  return callAuthApi("/api/auth/forgot-password", {
    email,
  });
}

export async function resetPasswordWithToken({
  email,
  token,
  password,
}: {
  email: string;
  token: string;
  password: string;
}) {
  return callAuthApi("/api/auth/reset-password", {
    email,
    token,
    password,
  });
}

export async function logout() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
