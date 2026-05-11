import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { getPatientAuthHeader } from "@/lib/routeAuth";

export async function GET() {
  try {
    const headers = await getPatientAuthHeader();
    const res = await backendFetch("/patients/me", { headers });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("not authenticated") || message.includes("invalid token") || message.includes("unauthorized")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch patient profile" }, { status: 500 });
  }
}
