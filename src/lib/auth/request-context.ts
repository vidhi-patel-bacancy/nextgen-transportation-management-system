import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

export interface AuthContext {
  supabase: ReturnType<typeof createServerSupabaseClient>;
  userId: string;
  role: UserRole;
  organizationId: string;
}

export interface AuthContextError {
  code: "UNAUTHORIZED" | "FORBIDDEN";
  message: string;
  status: number;
}

export async function getAuthContext(): Promise<{ context?: AuthContext; error?: AuthContextError }> {
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required.",
        status: 401,
      },
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role, organization_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.role || !profile.organization_id) {
    return {
      error: {
        code: "FORBIDDEN",
        message: "User profile is missing organization or role.",
        status: 403,
      },
    };
  }

  return {
    context: {
      supabase,
      userId: user.id,
      role: profile.role as UserRole,
      organizationId: profile.organization_id,
    },
  };
}
