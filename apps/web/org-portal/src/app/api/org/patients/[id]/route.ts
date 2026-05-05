import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { orgAuthHeaderFromCookie } from "@/lib/routeAuth";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const auth = await orgAuthHeaderFromCookie();

  const upstream = await backendFetch(`/org/patients/${encodeURIComponent(id)}`, {
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
}
