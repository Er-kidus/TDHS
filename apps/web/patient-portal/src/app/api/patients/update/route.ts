import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { getPatientAuthHeader } from "@/lib/routeAuth";

export async function PUT(request: Request) {
  const headers = await getPatientAuthHeader();
  const body = await request.json();

  const res = await backendFetch("/patients/update", {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data);
}
