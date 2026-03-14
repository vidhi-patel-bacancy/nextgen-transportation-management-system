"use client";

import { useRouter } from "next/navigation";

import { UserCircle2 } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function TopNavbar() {
  const router = useRouter();
  const { user, role, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <header className="flex flex-col gap-3 border-b border-emerald-950/10 bg-white/60 px-5 py-4 backdrop-blur-md md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-700">Transportation Management</p>
        <h2 className="text-lg font-semibold tracking-tight text-slate-950">Operational Overview</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-900/15 bg-white/80 px-3 py-2 text-sm shadow-sm">
          <UserCircle2 className="h-4 w-4 text-emerald-700" />
          <span className="text-slate-700">{user?.email ?? "Guest"}</span>
          <span className="text-slate-400">({role ?? "unknown"})</span>
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
