import { NextResponse } from "next/server";
import { BackendRequestError, backendFetch } from "@/lib/backend";
import { PATIENT_TOKEN_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  let data: { token?: string };
  try {
    const res = await backendFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
    data = (await res.json().catch(() => ({}))) as { token?: string };
  } catch (error) {
    if (error instanceof BackendRequestError) {
      return NextResponse.json({ error: error.message || "Registration failed" }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (!data.token) {
    return NextResponse.json({ error: "Missing token" }, { status: 502 });
  }

  const response = NextResponse.json({ ok: true }, { status: 201 });
  response.cookies.set(PATIENT_TOKEN_COOKIE, data.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
}
