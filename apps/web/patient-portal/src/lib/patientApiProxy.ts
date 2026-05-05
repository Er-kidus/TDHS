import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { getPatientAuthHeader } from "@/lib/routeAuth";

function parseErrorStatus(error: unknown): number {
  if (error && typeof error === "object" && "status" in error && typeof (error as { status?: unknown }).status === "number") {
    return (error as { status: number }).status;
  }
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("not authenticated") || message.includes("invalid token")) return 401;
  return 500;
}

async function parsePayload(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function proxyGet(path: string) {
  try {
    const headers = await getPatientAuthHeader();
    const res = await backendFetch(path, { headers });
    const data = await parsePayload(res);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    const status = parseErrorStatus(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function proxyPost(path: string, request: Request) {
  try {
    const headers = await getPatientAuthHeader();
    const body = await request.json();
    const res = await backendFetch(path, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await parsePayload(res);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    const status = parseErrorStatus(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function proxyPut(path: string, request: Request) {
  try {
    const headers = await getPatientAuthHeader();
    const body = await request.json();
    const res = await backendFetch(path, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });
    const data = await parsePayload(res);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    const status = parseErrorStatus(error);
    return NextResponse.json({ error: message }, { status });
  }
}
