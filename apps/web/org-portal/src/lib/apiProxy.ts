import { backendFetch, BackendRequestError } from "@/lib/backend";
import { orgAuthHeaderFromCookie } from "@/lib/routeAuth";
import { NextResponse } from "next/server";

export async function proxyGet(path: string, request?: Request) {
  const url = request ? new URL(request.url) : null;
  const search = url ? url.search : "";
  const auth = await orgAuthHeaderFromCookie();
  try {
    const upstream = await backendFetch(`${path}${search}`, {
      method: "GET",
      headers: { ...auth },
    });
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof BackendRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function proxyPost(path: string, request?: Request) {
  const url = request ? new URL(request.url) : null;
  const search = url ? url.search : "";
  const auth = await orgAuthHeaderFromCookie();
  try {
    const body = request ? await request.text() : undefined;
    const headers: Record<string, string> = { ...auth };
    if (body) {
      headers["Content-Type"] = "application/json";
    }
    const upstream = await backendFetch(`${path}${search}`, {
      method: "POST",
      headers,
      body: body || undefined,
    });
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof BackendRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
