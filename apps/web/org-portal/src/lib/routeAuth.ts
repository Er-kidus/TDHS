import { getOrgToken } from "./auth";

export async function orgAuthHeaderFromCookie(): Promise<Record<string, string>> {
  const token = await getOrgToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
