import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { orgAuthHeaderFromCookie } from "@/lib/routeAuth";

export async function GET() {
  const auth = await orgAuthHeaderFromCookie();
  const upstream = await backendFetch("/org/ai/models", {
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
}
