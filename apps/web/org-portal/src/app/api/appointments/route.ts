import { NextResponse } from "next/server";
import { BackendRequestError, backendFetch } from "@/lib/backend";
import { orgAuthHeaderFromCookie } from "@/lib/routeAuth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ?? "50";

    const auth = await orgAuthHeaderFromCookie();
    const upstream = await backendFetch(`/appointments?limit=${encodeURIComponent(limit)}`, {
      method: "GET",
      headers: { ...auth },
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
    const message = error instanceof Error ? error.message : "Failed to load appointments";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => ({}));
    const bodyObj = (body && typeof body === "object" ? (body as Record<string, unknown>) : {}) as Record<
      string,
      unknown
    >;
    const patientId = typeof bodyObj.patientId === "string" ? bodyObj.patientId : undefined;
    const { patientId: _patientId, ...rest } = bodyObj;
    void _patientId;

    const auth = await orgAuthHeaderFromCookie();
    const qs = patientId ? `?patientId=${encodeURIComponent(patientId)}` : "";

    const upstream = await backendFetch(`/appointments${qs}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...auth },
      body: JSON.stringify(rest),
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
    const message = error instanceof Error ? error.message : "Failed to create appointment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
