import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { orgAuthHeaderFromCookie } from "@/lib/routeAuth";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await orgAuthHeaderFromCookie();
    const { id } = await context.params;
    const url = new URL(request.url);
    const query = url.searchParams.toString();
    const suffix = query ? `?${query}` : "";
    const upstream = await backendFetch(`/telemedicine/sessions/${encodeURIComponent(id)}/transcript-lines${suffix}`, {
      method: "GET",
      headers: { ...auth },
    });
    const payloadText = await upstream.text();
    let payload: unknown = null;
    try {
      payload = payloadText ? JSON.parse(payloadText) : null;
    } catch {
      payload = payloadText;
    }
    return NextResponse.json(payload, { status: upstream.status });
  } catch (error) {
    const status = error && typeof error === "object" && "status" in error && typeof (error as { status?: unknown }).status === "number"
      ? (error as { status: number }).status
      : 500;
    const message = error instanceof Error ? error.message : "failed to list transcript lines";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await orgAuthHeaderFromCookie();
    const body = await request.json().catch(() => ({}));
    const { id } = await context.params;
    const upstream = await backendFetch(`/telemedicine/sessions/${encodeURIComponent(id)}/transcript-lines`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payloadText = await upstream.text();
    let payload: unknown = null;
    try {
      payload = payloadText ? JSON.parse(payloadText) : null;
    } catch {
      payload = payloadText;
    }
    return NextResponse.json(payload, { status: upstream.status });
  } catch (error) {
    const status = error && typeof error === "object" && "status" in error && typeof (error as { status?: unknown }).status === "number"
      ? (error as { status: number }).status
      : 500;
    const message = error instanceof Error ? error.message : "failed to save transcript line";
    return NextResponse.json({ error: message }, { status });
  }
}
