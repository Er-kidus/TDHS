import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { orgAuthHeaderFromCookie } from "@/lib/routeAuth";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const auth = await orgAuthHeaderFromCookie();
  const body = await request.json().catch(() => ({}));
  const upstream = await backendFetch(`/services/${encodeURIComponent(id)}`, {
    method: "PUT",
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

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const auth = await orgAuthHeaderFromCookie();
  const upstream = await backendFetch(`/services/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { ...auth },
  });
  if (upstream.status === 204) return new NextResponse(null, { status: 204 });
  const text = await upstream.text();
  let payload: unknown = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }
  return NextResponse.json(payload, { status: upstream.status });
}
