import { NextResponse } from "next/server";
import { proxyPost } from "@/lib/patientApiProxy";
import { backendFetch } from "@/lib/backend";
import { getPatientAuthHeader } from "@/lib/routeAuth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const headers = await getPatientAuthHeader();
    const { id } = await params;
    const url = new URL(request.url);
    const query = url.searchParams.toString();
    const suffix = query ? `?${query}` : "";
    const upstream = await backendFetch(`/telemedicine/sessions/${encodeURIComponent(id)}/transcript-lines${suffix}`, {
      method: "GET",
      headers,
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
    if (status >= 500) {
      // Transcript storage is optional for room connectivity; return empty list on transient backend errors.
      return NextResponse.json([], { status: 200 });
    }
    const message = error instanceof Error ? error.message : "failed to list transcript lines";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyPost(`/telemedicine/sessions/${encodeURIComponent(id)}/transcript-lines`, request);
}
