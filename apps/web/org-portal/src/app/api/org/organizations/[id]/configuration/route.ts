import { NextResponse } from "next/server";
import { BackendRequestError, backendFetch } from "@/lib/backend";
import { orgAuthHeaderFromCookie } from "@/lib/routeAuth";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const auth = await orgAuthHeaderFromCookie();
    const upstream = await backendFetch(`/org/organizations/${encodeURIComponent(id)}/configuration`, {
      method: "GET",
      headers: { ...auth },
    });
    const payload = (await upstream.json().catch(() => null)) as unknown;
    return NextResponse.json(payload, { status: upstream.status });
  } catch (error) {
    if (error instanceof BackendRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Failed to load organization configuration";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const auth = await orgAuthHeaderFromCookie();
    const upstream = await backendFetch(`/org/organizations/${encodeURIComponent(id)}/configuration`, {
      method: "PUT",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await upstream.json().catch(() => null)) as unknown;
    return NextResponse.json(payload, { status: upstream.status });
  } catch (error) {
    if (error instanceof BackendRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Failed to update organization configuration";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
