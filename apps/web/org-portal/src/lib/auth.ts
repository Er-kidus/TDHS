import { cookies } from "next/headers";
import { normalizeOrgRole, type OrgRole } from "@/lib/rbac";

export const ORG_TOKEN_COOKIE = "org_token";

export async function getOrgToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ORG_TOKEN_COOKIE)?.value ?? null;
}

export function getOrgRoleFromToken(token: string | null | undefined): OrgRole {
  if (!token) return "staff";
  const parts = token.split(".");
  if (parts.length < 2) return "staff";

  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8")) as { role?: string };
    return normalizeOrgRole(payload.role);
  } catch {
    return "staff";
  }
}
