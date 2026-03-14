import type { UserRole } from "@/types";

export const APP_ROUTE_PERMISSIONS: { prefix: string; roles: UserRole[] }[] = [
  { prefix: "/dashboard", roles: ["admin", "manager", "carrier", "customer"] },
  { prefix: "/orders", roles: ["admin", "manager", "customer"] },
  { prefix: "/shipments", roles: ["admin", "manager", "carrier"] },
  { prefix: "/carriers", roles: ["admin", "manager"] },
  { prefix: "/tracking", roles: ["admin", "manager", "carrier", "customer"] },
  { prefix: "/reports", roles: ["admin", "manager"] },
  { prefix: "/rates", roles: ["admin", "manager", "carrier", "customer"] },
  { prefix: "/invoices", roles: ["admin", "manager", "carrier", "customer"] },
  { prefix: "/routes", roles: ["admin", "manager", "carrier"] },
  { prefix: "/profile", roles: ["admin", "manager", "carrier", "customer"] },
];

export const CARRIER_MANAGERS: UserRole[] = ["admin", "manager"];
export const SHIPMENT_CREATORS: UserRole[] = ["admin", "manager"];
export const ORDER_CREATORS: UserRole[] = ["admin", "manager", "customer"];

export function hasRole(role: UserRole | null | undefined, allowedRoles: UserRole[]): role is UserRole {
  if (!role) return false;
  return allowedRoles.includes(role);
}

export function canAccessAppPath(pathname: string, role: UserRole): boolean {
  const permission = APP_ROUTE_PERMISSIONS.find((item) => pathname === item.prefix || pathname.startsWith(`${item.prefix}/`));
  if (!permission) {
    return true;
  }

  return permission.roles.includes(role);
}
