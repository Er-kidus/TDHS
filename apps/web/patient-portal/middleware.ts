import { NextResponse, type NextRequest } from "next/server";

const TOKEN_COOKIE = "patient_token";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/appointments") ||
    pathname.startsWith("/medical-records") ||
    pathname.startsWith("/messages") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/telemedicine") ||
    pathname.startsWith("/session-history") ||
    pathname.startsWith("/session-recordings") ||
    pathname.startsWith("/api/telemedicine");

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!token && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/dashboard/:path*",
    "/appointments/:path*",
    "/medical-records/:path*",
    "/messages/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/telemedicine/:path*",
    "/session-history/:path*",
    "/session-recordings/:path*",
    "/api/telemedicine/:path*",
  ],
};
