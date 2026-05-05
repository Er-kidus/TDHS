import { NextResponse } from "next/server";
import { BackendRequestError, backendFetch } from "@/lib/backend";
import { orgAuthHeaderFromCookie } from "@/lib/routeAuth";

export async function GET() {
  try {
    const auth = await orgAuthHeaderFromCookie();
    const upstream = await backendFetch("/org/tiers", { method: "GET", headers: { ...auth } });
    const payload = (await upstream.json().catch(() => null)) as unknown;
    return NextResponse.json(payload, { status: upstream.status });
  } catch (error) {
    if (error instanceof BackendRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Failed to load organization tiers";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
