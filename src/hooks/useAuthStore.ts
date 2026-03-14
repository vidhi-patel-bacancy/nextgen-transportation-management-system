"use client";

import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";

import type { UserRole } from "@/types";

interface AuthState {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  setAuth: (payload: { user: User | null; session: Session | null; role: UserRole | null }) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  role: null,
  loading: true,
  setAuth: ({ user, session, role }) => set({ user, session, role, loading: false }),
  setLoading: (loading) => set({ loading }),
  clearAuth: () => set({ user: null, session: null, role: null, loading: false }),
}));
