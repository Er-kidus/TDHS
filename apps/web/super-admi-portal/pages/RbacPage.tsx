/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CardShell } from "./common";

export default function RbacPage(props: any) {
  const { permissionMatrix, togglePermission, toast } = props;
  const keys = Object.keys(permissionMatrix.superAdmin) as string[];

  return (
    <CardShell title="Role-Based Access Control" description="Permission matrix for platform modules">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button onClick={() => toast({ title: "Custom role created", description: "Clinical Auditor role added." })}>Create Custom Role</Button>
        <Button variant="outline" onClick={() => toast({ title: "Template imported", description: "Hospital network RBAC template imported." })}>
          Import Template
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/70">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Permission</th>
              <th className="px-3 py-2 text-center font-medium">Super Admin</th>
              <th className="px-3 py-2 text-center font-medium">Org Admin</th>
              <th className="px-3 py-2 text-center font-medium">Support</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((permissionKey) => (
              <tr key={permissionKey} className="border-t border-border/60">
                <td className="px-3 py-3 capitalize">{permissionKey}</td>
                <td className="px-3 py-3 text-center">
                  <Switch checked={permissionMatrix.superAdmin[permissionKey]} onCheckedChange={() => togglePermission("superAdmin", permissionKey)} />
                </td>
                <td className="px-3 py-3 text-center">
                  <Switch checked={permissionMatrix.orgAdmin[permissionKey]} onCheckedChange={() => togglePermission("orgAdmin", permissionKey)} />
                </td>
                <td className="px-3 py-3 text-center">
                  <Switch checked={permissionMatrix.support[permissionKey]} onCheckedChange={() => togglePermission("support", permissionKey)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardShell>
  );
}