import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { PATIENT_TOKEN_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();

  const res = await backendFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as { token: string };

  const response = NextResponse.json(data, { status: 201 });
  response.cookies.set(PATIENT_TOKEN_COOKIE, data.token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return response;
}
