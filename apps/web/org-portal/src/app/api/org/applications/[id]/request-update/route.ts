import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { orgAuthHeaderFromCookie } from "@/lib/routeAuth";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await orgAuthHeaderFromCookie();
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));

  const upstream = await backendFetch(`/org/applications/${encodeURIComponent(id)}/request-update`, {
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
