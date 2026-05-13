import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { getPatientAuthHeader } from "@/lib/routeAuth";

export async function GET() {
  try {
    const headers = await getPatientAuthHeader();
    await backendFetch("/patients/me", { headers });
    return NextResponse.json({ authenticated: true });
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("not authenticated") || message.includes("invalid token") || message.includes("unauthorized")) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to verify session" }, { status: 500 });
  }
}
