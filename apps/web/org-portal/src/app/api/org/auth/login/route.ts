import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BackendRequestError, backendFetch } from "@/lib/backend";
import { ORG_TOKEN_COOKIE } from "@/lib/auth";

function isPrivateIPv4(hostname: string): boolean {
  const match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return false;
  const a = Number(match[1]);
  const b = Number(match[2]);
  if (a === 10) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 127) return true;
  return false;
}

function isDevOrTunnelHost(hostname: string): boolean {
  if (!hostname) return false;
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".localhost")) return true;
  if (hostname.endsWith(".ngrok-free.dev") || hostname.endsWith(".ngrok.io")) return true;
  return isPrivateIPv4(hostname);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  let token = "";
  try {
    const upstream = await backendFetch("/org/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payloadText = await upstream.text();
    let payload: unknown = null;
    try {
      payload = payloadText ? JSON.parse(payloadText) : null;
    } catch {
      payload = payloadText;
    }

    const loginPayload = payload as { token?: string } | null;
    token = loginPayload?.token || "";
  } catch (error) {
    if (error instanceof BackendRequestError) {
      return NextResponse.json({ error: error.message || "Login failed" }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 502 });
  }

  const hostHeader = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const normalizedHost = hostHeader.toLowerCase().split(":")[0];
  const allowDevHostBypass = process.env.NODE_ENV !== "production" || process.env.ALLOW_ORG_LOGIN_DEV_HOSTS === "true";
  const isLocalHost = normalizedHost === "localhost" || normalizedHost === "127.0.0.1" || normalizedHost.endsWith(".localhost");

  if (allowDevHostBypass && isDevOrTunnelHost(normalizedHost)) {
    const cookieStore = await cookies();
    cookieStore.set(ORG_TOKEN_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    return NextResponse.json({ ok: true });
  }

  if (!isLocalHost) {
    const appResp = await backendFetch("/org/application/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const appPayload = await appResp.json().catch(() => null) as { organization_domain?: string; organization_slug?: string } | null;

    if (!appResp.ok || !appPayload) {
      return NextResponse.json({ error: "Organization portal access is not configured for this account." }, { status: 403 });
    }

    const orgDomain = (appPayload.organization_domain || "").toLowerCase();
    const orgSlug = (appPayload.organization_slug || "").toLowerCase();
    const matchesDomain = orgDomain !== "" && normalizedHost === orgDomain;
    const matchesSlugSubdomain = orgSlug !== "" && normalizedHost.startsWith(`${orgSlug}.`);
    if (!matchesDomain && !matchesSlugSubdomain) {
      return NextResponse.json({ error: "Use your organization portal domain to sign in." }, { status: 403 });
    }
  }

  const cookieStore = await cookies();
  cookieStore.set(ORG_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
