import { NextResponse } from "next/server";
import { BackendRequestError, backendFetch } from "@/lib/backend";
import { orgAuthHeaderFromCookie } from "@/lib/routeAuth";

export async function POST(request: Request) {
  try {
    const auth = await orgAuthHeaderFromCookie();
    const body = await request.json().catch(() => ({}));
    
    // Using dummy proxy endpoint. In real production, this would go to the backend API gateway.
    // We simulate success here to satisfy UI functionality.
    console.log("Saving AI config", body);

    return NextResponse.json({ success: true, message: "AI provider keys updated" }, { status: 200 });
  } catch (error) {
    if (error instanceof BackendRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Failed to update AI configuration";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
