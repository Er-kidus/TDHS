import { NextResponse } from "next/server";
import { BackendRequestError, backendFetch } from "@/lib/backend";
import { orgAuthHeaderFromCookie } from "@/lib/routeAuth";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const auth = await orgAuthHeaderFromCookie();
    const body = await request.json().catch(() => ({}));
    const upstream = await backendFetch(`/appointments/${encodeURIComponent(id)}/assign`, {
      method: "POST",
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
    return NextResponse.json(payload, { status: upstream.status });
  } catch (error) {
    if (error instanceof BackendRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Failed to assign resources";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
