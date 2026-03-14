import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types";
import type { Database } from "@/types/supabase";

type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];

export async function login(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
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
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .insert({ name: organizationName })
    .select("*")
    .single();
  if (orgError) throw orgError;
  const org = organization as OrganizationRow;

  if (data.user?.id) {
    const { error: profileError } = await supabase.from("users").upsert({
      id: data.user.id,
      email,
      role,
      organization_id: org.id,
    });

    if (profileError) throw profileError;
  }

  return data;
}

export async function logout() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
