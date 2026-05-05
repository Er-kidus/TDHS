import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { getPatientAuthHeader } from "@/lib/routeAuth";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = await getPatientAuthHeader();
  const { id } = await params;
  const res = await backendFetch(`/appointments/${id}`, { headers });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = await getPatientAuthHeader();
  const { id } = await params;
  const body = await request.json();
  const res = await backendFetch(`/appointments/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = await getPatientAuthHeader();
  const { id } = await params;
  await backendFetch(`/appointments/${id}`, { method: "DELETE", headers });
  return new NextResponse(null, { status: 204 });
}
