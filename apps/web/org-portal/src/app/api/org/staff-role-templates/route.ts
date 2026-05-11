import { NextResponse } from "next/server";
import { BackendRequestError, backendFetch } from "@/lib/backend";
import { orgAuthHeaderFromCookie } from "@/lib/routeAuth";

export async function GET() {
  try {
    const auth = await orgAuthHeaderFromCookie();
    const includeInactive = false;
    const upstream = await backendFetch("/org/staff-role-templates", {
      method: "GET",
      headers: { ...auth },
    });
    const payload = (await upstream.json().catch(() => null)) as unknown;

    if (!upstream.ok) {
      return NextResponse.json(payload, { status: upstream.status });
    }

    if (Array.isArray(payload) && !includeInactive) {
      const activeOnly = payload.filter((item) => {
        if (!item || typeof item !== "object") return false;
        const active = (item as { active?: unknown }).active;
        return active === true;
      });
      return NextResponse.json(activeOnly, { status: upstream.status });
    }

    return NextResponse.json(payload, { status: upstream.status });
  } catch (error) {
    if (error instanceof BackendRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Failed to list staff templates";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
