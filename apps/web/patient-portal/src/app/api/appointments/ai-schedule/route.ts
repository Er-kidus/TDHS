import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { getPatientAuthHeader } from "@/lib/routeAuth";

export async function POST(request: Request) {
  const headers = await getPatientAuthHeader();
  const body = await request.json();
  try {
    const res = await backendFetch("/appointments/ai-schedule", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 201 : res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to schedule appointment" }, { status: error.status || 500 });
  }
}
