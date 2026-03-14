"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BarChart3, Building2, LayoutDashboard, Map, Package, ReceiptText, Route, Truck } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { hasRole } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils/cn";
import type { UserRole } from "@/types";

const links: { href: string; label: string; icon: typeof LayoutDashboard; roles: UserRole[] }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "manager", "carrier", "customer"] },
  { href: "/orders", label: "Orders", icon: Package, roles: ["admin", "manager", "customer"] },
  { href: "/shipments", label: "Shipments", icon: Truck, roles: ["admin", "manager", "carrier"] },
  { href: "/carriers", label: "Carriers", icon: Building2, roles: ["admin", "manager"] },
  { href: "/tracking", label: "Tracking", icon: Route, roles: ["admin", "manager", "carrier", "customer"] },
  { href: "/reports", label: "Reports", icon: BarChart3, roles: ["admin", "manager"] },
  { href: "/rates", label: "Rates", icon: ReceiptText, roles: ["admin", "manager", "carrier", "customer"] },
  { href: "/invoices", label: "Invoices", icon: ReceiptText, roles: ["admin", "manager", "carrier", "customer"] },
  { href: "/routes", label: "Routes", icon: Map, roles: ["admin", "manager", "carrier"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuth();
  const visibleLinks = links.filter((link) => hasRole(role, link.roles));

  return (
    <aside className="w-full border-b border-slate-200 bg-slate-950 px-3 py-4 text-white lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="mb-4 px-3">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Cloud TMS</p>
        <h1 className="mt-1 text-lg font-bold">Transport Control</h1>
      </div>
      <nav className="flex gap-2 overflow-x-auto lg:flex-col">
        {visibleLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition",
                isActive ? "bg-cyan-700 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white",
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
