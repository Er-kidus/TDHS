import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { getPatientAuthHeader } from "@/lib/routeAuth";

export async function GET(request: Request) {
  const headers = await getPatientAuthHeader();
  const url = new URL(request.url);
  const res = await backendFetch(`/appointments?${url.searchParams.toString()}`, { headers });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const headers = await getPatientAuthHeader();
  const body = await request.json();
  const res = await backendFetch("/appointments", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: 201 });
}
