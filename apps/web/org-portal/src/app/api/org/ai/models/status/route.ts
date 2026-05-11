import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { orgAuthHeaderFromCookie } from "@/lib/routeAuth";

export async function PUT(request: Request) {
  const auth = await orgAuthHeaderFromCookie();
  const body = await request.json().catch(() => ({}));

  const upstream = await backendFetch("/org/ai/models/status", {
    method: "PUT",
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
}
