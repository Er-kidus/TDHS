import { cookies } from "next/headers";
import { PATIENT_TOKEN_COOKIE } from "@/lib/auth";

export async function getPatientAuthHeader(): Promise<{ Authorization: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PATIENT_TOKEN_COOKIE)?.value;
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
}
