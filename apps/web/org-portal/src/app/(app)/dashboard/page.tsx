import { redirect } from "next/navigation";
import { getOrgRoleFromToken, getOrgToken } from "@/lib/auth";
import { roleHomePath } from "@/lib/rbac";

export default async function DashboardPage() {
  const token = await getOrgToken();
  if (!token) {
    redirect("/login");
  }

  const role = getOrgRoleFromToken(token);
  redirect(roleHomePath(role));
}
