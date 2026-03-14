"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BarChart3, Building2, LayoutDashboard, Map, Package, ReceiptText, Route, Truck, UserCircle2, Users } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { hasRole } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils/cn";
import type { UserRole } from "@/types";

const links: { href: string; label: string; icon: typeof LayoutDashboard; roles: UserRole[] }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "manager", "carrier"] },
  { href: "/portal", label: "Customer Portal", icon: Users, roles: ["customer"] },
  { href: "/orders", label: "Orders", icon: Package, roles: ["admin", "manager", "customer"] },
  { href: "/shipments", label: "Shipments", icon: Truck, roles: ["admin", "manager", "carrier"] },
  { href: "/carriers", label: "Carriers", icon: Building2, roles: ["admin", "manager"] },
  { href: "/tracking", label: "Tracking", icon: Route, roles: ["admin", "manager", "carrier", "customer"] },
  { href: "/reports", label: "Reports", icon: BarChart3, roles: ["admin", "manager"] },
  { href: "/rates", label: "Rates", icon: ReceiptText, roles: ["admin", "manager", "carrier", "customer"] },
  { href: "/invoices", label: "Invoices", icon: ReceiptText, roles: ["admin", "manager", "carrier", "customer"] },
  { href: "/routes", label: "Routes", icon: Map, roles: ["admin", "manager", "carrier"] },
  { href: "/profile", label: "Profile", icon: UserCircle2, roles: ["admin", "manager", "carrier", "customer"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuth();
  const visibleLinks = links.filter((link) => hasRole(role, link.roles));

  return (
    <aside className="w-full border-b border-emerald-950/10 bg-gradient-to-b from-emerald-950 to-[#0f2922] px-3 py-4 text-white lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r lg:border-r-emerald-950/20">
      <div className="mb-5 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
        <p className="text-xs uppercase tracking-[0.24em] text-emerald-200/90">Cloud TMS</p>
        <h1 className="mt-1 text-lg font-bold tracking-tight">Transport Control</h1>
        <p className="mt-1 text-xs text-emerald-100/70">Live operations workspace</p>
      </div>
      <nav className="flex gap-2 overflow-x-auto lg:flex-col">
        {visibleLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap transition",
                isActive
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.28)]"
                  : "text-emerald-100/85 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
