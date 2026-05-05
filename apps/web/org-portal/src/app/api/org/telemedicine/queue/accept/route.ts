import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { orgAuthHeaderFromCookie } from "@/lib/routeAuth";

export async function POST(request: Request) {
  try {
    const auth = await orgAuthHeaderFromCookie();
    const body = await request.json().catch(() => ({}));
    const upstream = await backendFetch("/org/telemedicine/queue/accept", {
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
    const message = error instanceof Error ? error.message : "failed to accept telemedicine session";
    return NextResponse.json({ error: message }, { status });
  }
}
