import { NextResponse, type NextRequest } from "next/server";

import { createServerClient } from "@supabase/ssr";

import { canAccessAppPath } from "@/lib/auth/permissions";
import type { Database } from "@/types/supabase";

const protectedPrefixes = ["/dashboard", "/orders", "/shipments", "/carriers", "/tracking", "/reports", "/rates", "/invoices", "/routes", "/profile"];
const authPages = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  const isAuthPage = authPages.includes(pathname);

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (isProtected && user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role, email_verified_at")
      .eq("id", user.id)
      .single();

    if (!profile?.email_verified_at) {
      const url = request.nextUrl.clone();
      url.pathname = "/verify-email";
      if (user.email) {
        url.searchParams.set("email", user.email);
      }
      return NextResponse.redirect(url);
    }

    if (!profile?.role || !canAccessAppPath(pathname, profile.role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/orders/:path*",
    "/shipments/:path*",
    "/carriers/:path*",
    "/tracking/:path*",
    "/reports/:path*",
    "/rates/:path*",
    "/invoices/:path*",
    "/routes/:path*",
    "/profile/:path*",
    "/login",
    "/signup",
  ],
};
