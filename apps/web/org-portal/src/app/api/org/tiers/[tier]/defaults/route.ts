import { NextResponse } from "next/server";
import { BackendRequestError, backendFetch } from "@/lib/backend";
import { orgAuthHeaderFromCookie } from "@/lib/routeAuth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ tier: string }> }
) {
  try {
    const { tier } = await params;
    const auth = await orgAuthHeaderFromCookie();
    const body = await request.json().catch(() => ({}));
    
    const upstream = await backendFetch(`/org/tiers/${encodeURIComponent(tier)}/defaults`, {
      method: "PUT",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    const text = await upstream.text();
    let payload: unknown = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = text;
    }
    
    if (!upstream.ok) {
      return NextResponse.json(payload, { status: upstream.status });
    }
    
    return NextResponse.json(payload, { status: upstream.status });
  } catch (error) {
    if (error instanceof BackendRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Failed to update tier defaults";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
