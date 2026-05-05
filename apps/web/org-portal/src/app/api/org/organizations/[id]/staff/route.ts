import { NextResponse } from "next/server";
import { BackendRequestError, backendFetch } from "@/lib/backend";
import { orgAuthHeaderFromCookie } from "@/lib/routeAuth";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ?? "100";
    const auth = await orgAuthHeaderFromCookie();
    const upstream = await backendFetch(`/org/organizations/${encodeURIComponent(id)}/staff?limit=${encodeURIComponent(limit)}`, {
      method: "GET",
      headers: { ...auth },
    });
    const payload = (await upstream.json().catch(() => null)) as unknown;
    return NextResponse.json(payload, { status: upstream.status });
  } catch (error) {
    if (error instanceof BackendRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Failed to load organization staff";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const auth = await orgAuthHeaderFromCookie();
    const upstream = await backendFetch(`/org/organizations/${encodeURIComponent(id)}/staff`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await upstream.json().catch(() => null)) as unknown;
    return NextResponse.json(payload, { status: upstream.status });
  } catch (error) {
    if (error instanceof BackendRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Failed to create organization staff";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
