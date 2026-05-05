import { NextResponse } from "next/server";
import { backendFetch, BackendRequestError } from "@/lib/backend";
import { orgAuthHeaderFromCookie } from "@/lib/routeAuth";

export async function GET() {
  try {
    const auth = await orgAuthHeaderFromCookie();
    if (!auth.Authorization) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const upstream = await backendFetch("/org/me", { method: "GET", headers: { ...auth } });
    const payloadText = await upstream.text();
    let payload: unknown = null;
    try {
      payload = payloadText ? JSON.parse(payloadText) : null;
    } catch {
      payload = payloadText;
    }
    return NextResponse.json(payload, { status: upstream.status });
  } catch (error) {
    if (error instanceof BackendRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Failed to load organization profile";
    const status = message.toLowerCase().includes("not authenticated") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
