import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function GET() {
  try {
    const upstream = await backendFetch("/org/hospitals", { method: "GET" });
    const data = (await upstream.json()) as unknown;
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load registered hospitals";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
