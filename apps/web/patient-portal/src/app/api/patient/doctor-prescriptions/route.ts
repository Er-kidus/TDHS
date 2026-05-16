import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { getPatientAuthHeader } from "@/lib/routeAuth";

export async function GET(request: Request) {
  const headers = await getPatientAuthHeader();
  const url = new URL(request.url);
  const res = await backendFetch(`/patient/doctor-prescriptions?${url.searchParams.toString()}`, { headers });
  const data = await res.json();
  return NextResponse.json(data);
}
