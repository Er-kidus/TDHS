import { AppShell } from "@/components/layout/AppShell";
import { getOrgRoleFromToken, getOrgToken } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const token = await getOrgToken();
  const role = getOrgRoleFromToken(token);

  return <AppShell role={role}>{children}</AppShell>;
}
