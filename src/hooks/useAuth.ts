"use client";

import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/hooks/useAuthStore";
import type { UserRole } from "@/types";

async function fetchRole(userId: string): Promise<UserRole | null> {
  const supabase = createClient();
  const { data } = await supabase.from("users").select("role").eq("id", userId).single();

  return data?.role ?? null;
}

export function useAuth() {
  const { user, session, role, loading, setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    const initializeAuth = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      const sessionData = data.session;
      const roleData = sessionData?.user ? await fetchRole(sessionData.user.id) : null;

      if (isMounted) {
        setAuth({
          user: sessionData?.user ?? null,
          session: sessionData ?? null,
          role: roleData,
        });
      }
    };

    void initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void (async () => {
        const nextRole = nextSession?.user ? await fetchRole(nextSession.user.id) : null;
        setAuth({
          user: nextSession?.user ?? null,
          session: nextSession ?? null,
          role: nextRole,
        });
      })();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setAuth, setLoading]);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearAuth();
  };

  return {
    user,
    session,
    role,
    loading,
    logout,
  };
}
