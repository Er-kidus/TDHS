import { cookies } from "next/headers";

export const PATIENT_TOKEN_COOKIE = "patient_token";

export async function getPatientToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(PATIENT_TOKEN_COOKIE)?.value ?? null;
}
