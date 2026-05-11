import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function GET() {
  try {
    const endpoints = ["/organizations", "/org/hospitals"];
    for (const endpoint of endpoints) {
      try {
        const upstream = await backendFetch(endpoint, { method: "GET" });
        const data = (await upstream.json()) as unknown;
        return NextResponse.json(data);
      } catch {
        // Try the next endpoint.
      }
    }

    return NextResponse.json({ error: "Failed to load organizations" }, { status: 502 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load organizations";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
