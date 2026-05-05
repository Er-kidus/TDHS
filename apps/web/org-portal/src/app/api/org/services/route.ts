import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { orgAuthHeaderFromCookie } from "@/lib/routeAuth";

export async function GET() {
  const auth = await orgAuthHeaderFromCookie();
  const upstream = await backendFetch("/services", { method: "GET", headers: { ...auth } });
  const text = await upstream.text();
  let payload: unknown = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }
  return NextResponse.json(payload, { status: upstream.status });
}

export async function POST(request: Request) {
  const auth = await orgAuthHeaderFromCookie();
  const body = await request.json().catch(() => ({}));
  const upstream = await backendFetch("/services", {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await upstream.text();
  let payload: unknown = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }
  return NextResponse.json(payload, { status: upstream.status });
}
