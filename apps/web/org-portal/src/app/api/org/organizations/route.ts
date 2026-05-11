import { NextResponse } from "next/server";
import { BackendRequestError, backendFetch } from "@/lib/backend";
import { orgAuthHeaderFromCookie } from "@/lib/routeAuth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const auth = await orgAuthHeaderFromCookie();
    const upstream = await backendFetch(`/org/organizations/manage?search=${encodeURIComponent(search)}`, {
      method: "GET",
      headers: { ...auth },
    });
    const payload = (await upstream.json().catch(() => null)) as unknown;
    return NextResponse.json(payload, { status: upstream.status });
  } catch (error) {
    if (error instanceof BackendRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Failed to load organizations";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
