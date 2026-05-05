import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { orgAuthHeaderFromCookie } from "@/lib/routeAuth";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const auth = await orgAuthHeaderFromCookie();
    const qs = url.searchParams.toString();
    const upstream = await backendFetch(`/org/telemedicine/artifacts${qs ? `?${qs}` : ""}`, {
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
    const message = error instanceof Error ? error.message : "failed to load telemedicine artifacts";
    return NextResponse.json({ error: message }, { status });
  }
}