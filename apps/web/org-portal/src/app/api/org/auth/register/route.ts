import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const upstream = await backendFetch("/org/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
