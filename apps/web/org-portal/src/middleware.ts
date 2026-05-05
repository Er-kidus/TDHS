import { NextRequest, NextResponse } from "next/server";
import { isPathAllowedForRole, normalizeOrgRole, roleHomePath } from "@/lib/rbac";

const PROTECTED_PREFIXES = ["/dashboard", "/patients", "/appointments", "/analytics", "/settings"]; // keep minimal

function readRoleFromToken(token: string | undefined): ReturnType<typeof normalizeOrgRole> {
  if (!token) return "staff";
  const parts = token.split(".");
  if (parts.length < 2) return "staff";

  try {
    const raw = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = raw + "=".repeat((4 - (raw.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as { role?: string };
    return normalizeOrgRole(payload.role);
  } catch {
    return "staff";
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const legacyPathRedirects: Record<string, string> = {
    "/doctor-workspace": "/dashboard/doctor",
    "/telemedicine-room": "/dashboard/telemedicine",
    "/telemedicine-room/queue": "/dashboard/telemedicine/queue",
    "/telemedicine-room/profile": "/dashboard/telemedicine/profile",
  };
  const redirectPath = legacyPathRedirects[pathname];
  if (redirectPath) {
    const url = request.nextUrl.clone();
    url.pathname = redirectPath;
    url.search = "";
    return NextResponse.redirect(url);
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const token = request.cookies.get("org_token")?.value;

  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isProtected && token) {
    const role = readRoleFromToken(token);

    if (pathname === "/dashboard") {
      const url = request.nextUrl.clone();
      url.pathname = roleHomePath(role);
      url.search = "";
      return NextResponse.redirect(url);
    }

    if (!isPathAllowedForRole(pathname, role)) {
      const url = request.nextUrl.clone();
      url.pathname = roleHomePath(role);
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
