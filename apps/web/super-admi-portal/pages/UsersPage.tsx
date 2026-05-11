/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, KeyRound, Shield, Trash2, UserPlus } from "lucide-react";
import { CardShell } from "./common";

type UserTab = "patients" | "organization" | "staff" | "system-admin";

export default function UsersPage(props: any) {
  const {
    orgRole,
    userActionBusy,
    statusBadge,
    handleCreateUser,
    handleEditUser,
    handleAssignRole,
    handleForceReset,
    handleLockUnlock,
    handleDeactivate,
    users,
    patients,
    availableUserRoles,
    availableOrganizationNames,
    userPage,
    pageSize,
    setUserPage,
  } = props;

  const [activeUserTab, setActiveUserTab] = useState<UserTab>("patients");
  const [viewMode, setViewMode] = useState<"list" | "create">("list");
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [patientDetailsOpen, setPatientDetailsOpen] = useState(false);

  const [tabSearch, setTabSearch] = useState<Record<UserTab, string>>({
    patients: "",
    organization: "",
    staff: "",
    "system-admin": "",
  });

  const [createFullName, setCreateFullName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createRole, setCreateRole] = useState("admin");
  const [createPassword, setCreatePassword] = useState("Temp123!");
  const [createOrganizationId, setCreateOrganizationId] = useState("");
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [assignRole, setAssignRole] = useState("staff");
  const [resetPassword, setResetPassword] = useState("Reset123!");
  const [statusAction, setStatusAction] = useState<"lock" | "unlock">("lock");

  const organizationRows = useMemo(() => {
    return (users || []).map((row: any) => ({
      ...row,
      roleNormalized: String(row.role || "").toLowerCase(),
      organizationNormalized: String(row.organization || "").toLowerCase(),
    }));
  }, [users]);

  const patientRows = useMemo(() => {
    return (patients || []).map((row: any) => ({
      id: row.id,
      name: row.full_name || "Unknown patient",
      email: row.email || row.phone || "-",
      role: "Patient",
      roleNormalized: "patient",
      organization: "MPI Registry",
      organizationNormalized: "mpi registry",
      status: row.active ? "Active" : "Locked",
      lastActive: row.updated_at || row.created_at || "recently",
      createdAt: row.created_at || row.updated_at,
      isPatientRow: true,
    }));
  }, [patients]);

  const tabUsers = useMemo(() => {
    const activeSearch = tabSearch[activeUserTab].trim().toLowerCase();

    const sourceRows = activeUserTab === "patients" ? patientRows : organizationRows;

    return sourceRows.filter((row: any) => {
      const role = row.roleNormalized || String(row.role || "").toLowerCase();
      const org = row.organizationNormalized || String(row.organization || "").toLowerCase();

      const matchesSearch =
        activeSearch.length === 0 ||
        String(row.name || "").toLowerCase().includes(activeSearch) ||
        String(row.email || "").toLowerCase().includes(activeSearch) ||
        org.includes(activeSearch);

      if (!matchesSearch) return false;

      if (activeUserTab === "patients") {
        return role.includes("patient") || org.includes("patient");
      }

      if (activeUserTab === "organization") {
        return role === "org admin";
      }

      if (activeUserTab === "staff") {
        return role === "doctor" || role === "nurse" || role === "staff";
      }

      return role === "super admin";
    });
  }, [activeUserTab, organizationRows, patientRows, tabSearch]);

  function openEdit(row: any) {
    setSelectedRow(row);
    setEditFullName(row.name || "");
    setEditEmail(row.email || "");
    setEditOpen(true);
  }

  function openRole(row: any) {
    setSelectedRow(row);
    const role = String(row.role || "staff").toLowerCase();
    if (role === "super admin" || role === "org admin") {
      setAssignRole("admin");
    } else if (role === "doctor" || role === "nurse" || role === "staff") {
      setAssignRole(role);
    } else {
      setAssignRole("staff");
    }
    setRoleOpen(true);
  }

  function openPassword(row: any) {
    setSelectedRow(row);
    setResetPassword("Reset123!");
    setPasswordOpen(true);
  }

  function openStatus(row: any) {
    setSelectedRow(row);
    setStatusAction(row.status === "Active" ? "lock" : "unlock");
    setStatusOpen(true);
  }

  function openDeactivate(row: any) {
    setSelectedRow(row);
    setDeactivateOpen(true);
  }

  function openPatientDetails(row: any) {
    setSelectedRow(row);
    setPatientDetailsOpen(true);
  }

  async function submitCreate() {
    if (!createFullName.trim() || !createEmail.trim() || !createPassword.trim()) return;
    await handleCreateUser({
      fullName: createFullName.trim(),
      email: createEmail.trim(),
      role: createRole,
      password: createPassword,
      organizationId: createOrganizationId || undefined,
    });
    setViewMode("list");
    setCreateFullName("");
    setCreateEmail("");
    setCreateRole("admin");
    setCreateOrganizationId("");
    setCreatePassword("Temp123!");
  }

  async function submitEdit() {
    if (!selectedRow) return;
    await handleEditUser(selectedRow, { fullName: editFullName.trim(), email: editEmail.trim() });
    setEditOpen(false);
  }

  async function submitRole() {
    if (!selectedRow) return;
    await handleAssignRole(selectedRow, assignRole);
    setRoleOpen(false);
  }

  async function submitPassword() {
    if (!selectedRow) return;
    await handleForceReset(selectedRow, resetPassword);
    setPasswordOpen(false);
  }

  async function submitStatus() {
    if (!selectedRow) return;
    await handleLockUnlock(selectedRow, statusAction);
    setStatusOpen(false);
  }

  async function submitDeactivate() {
    if (!selectedRow) return;
    await handleDeactivate(selectedRow);
    setDeactivateOpen(false);
  }

  const totalPages = Math.max(1, Math.ceil(tabUsers.length / pageSize));
  const pagedTabUsers = useMemo(() => {
    const start = (userPage - 1) * pageSize;
    return tabUsers.slice(start, start + pageSize);
  }, [pageSize, tabUsers, userPage]);

  const usersTable = (
    <div className="overflow-x-auto rounded-xl border border-border/70">
      <table className="min-w-[980px] w-full text-sm">
        <thead className="bg-muted/40 text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left font-medium">User</th>
            <th className="px-3 py-2 text-left font-medium">Role</th>
            <th className="px-3 py-2 text-left font-medium">Organization</th>
            <th className="px-3 py-2 text-left font-medium">Status</th>
            <th className="px-3 py-2 text-left font-medium">Last Active</th>
            <th className="px-3 py-2 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pagedTabUsers.length === 0 ? (
            <tr>
              <td className="px-3 py-4 text-muted-foreground" colSpan={6}>
                No users matched the current filters.
              </td>
            </tr>
          ) : (
            pagedTabUsers.map((row: any) => (
              <tr key={row.id} className="border-t border-border/60 align-top hover:bg-muted/30">
                <td className="px-3 py-3"><p className="font-medium">{row.name}</p><p className="text-xs text-muted-foreground">{row.email}</p></td>
                <td className="px-3 py-3">{row.role}</td>
                <td className="px-3 py-3">{row.organization}</td>
                <td className="px-3 py-3">{statusBadge(row.status)}</td>
                <td className="px-3 py-3 text-muted-foreground">{row.lastActive}</td>
                <td className="px-3 py-3">
                  {row.isPatientRow ? (
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => openPatientDetails(row)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View info
                      </Button>
                      <span className="text-xs text-muted-foreground">MPI managed patient</span>
                    </div>
                  ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="icon" variant="outline" aria-label={`Edit ${row.name}`} title="Edit details" onClick={() => openEdit(row)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" aria-label={`Assign role for ${row.name}`} title="Assign role" onClick={() => openRole(row)}>
                      <Shield className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" aria-label={`Reset password for ${row.name}`} title="Reset password" onClick={() => openPassword(row)}>
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" disabled={userActionBusy} onClick={() => openStatus(row)}>
                      {row.status === "Active" ? "Lock" : "Unlock"}
                    </Button>
                    <Button size="icon" variant="destructive" disabled={userActionBusy} aria-label={`Deactivate ${row.name}`} title="Deactivate user" onClick={() => openDeactivate(row)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  useEffect(() => {
    setUserPage(1);
  }, [activeUserTab, setUserPage]);

  useEffect(() => {
    if (!createOrganizationId && availableOrganizationNames?.length) {
      setCreateOrganizationId(availableOrganizationNames[0].id);
    }
  }, [availableOrganizationNames, createOrganizationId]);

  if (viewMode === "create") {
    return (
      <div className="space-y-4">
        <CardShell
          title="Create New User"
          description="Create a user account with dynamic role and organization options"
          headerRight={<Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">Role: {orgRole}</Badge>}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Full name" value={createFullName} onChange={(event) => setCreateFullName(event.target.value)} />
            <Input placeholder="Email" value={createEmail} onChange={(event) => setCreateEmail(event.target.value)} />
            <Input placeholder="Temporary password" value={createPassword} onChange={(event) => setCreatePassword(event.target.value)} />

            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={createRole}
              aria-label="Select role"
              title="Select role"
              onChange={(event) => setCreateRole(event.target.value)}
            >
              {(availableUserRoles || ["admin", "doctor", "nurse", "staff"]).map((role: string) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>

            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm md:col-span-2"
              value={createOrganizationId}
              aria-label="Select organization"
              title="Select organization"
              onChange={(event) => setCreateOrganizationId(event.target.value)}
            >
              {(availableOrganizationNames || []).map((organization: { id: string; name: string }) => (
                <option key={organization.id} value={organization.id}>{organization.name}</option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setViewMode("list")}>Back to Users</Button>
            <Button disabled={userActionBusy} onClick={() => void submitCreate()}>Create User</Button>
          </div>
        </CardShell>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CardShell
        title="User Management"
        description="Manage accounts, roles, and account-level actions"
        headerRight={
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">Role: {orgRole}</Badge>
            <Button size="sm" onClick={() => setViewMode("create")}>
              <UserPlus className="mr-2 h-4 w-4" />
              New User
            </Button>
          </div>
        }
      >

        <Tabs value={activeUserTab} onValueChange={(value) => setActiveUserTab(value as UserTab)} className="space-y-4">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-2 md:grid-cols-4">
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="organization">Organization</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="system-admin">System Admin</TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="space-y-4">
            <Input
              value={tabSearch.patients}
              onChange={(event) => setTabSearch((current) => ({ ...current, patients: event.target.value }))}
              placeholder="Search MPI patients by name, email, or organization"
            />
            {usersTable}
          </TabsContent>

          <TabsContent value="organization" className="space-y-4">
            <Input
              value={tabSearch.organization}
              onChange={(event) => setTabSearch((current) => ({ ...current, organization: event.target.value }))}
              placeholder="Search organization users"
            />
            {usersTable}
          </TabsContent>

          <TabsContent value="staff" className="space-y-4">
            <Input
              value={tabSearch.staff}
              onChange={(event) => setTabSearch((current) => ({ ...current, staff: event.target.value }))}
              placeholder="Search staff users"
            />
            {usersTable}
          </TabsContent>

          <TabsContent value="system-admin" className="space-y-4">
            <Input
              value={tabSearch["system-admin"]}
              onChange={(event) => setTabSearch((current) => ({ ...current, "system-admin": event.target.value }))}
              placeholder="Search system admin users"
            />
            {usersTable}
          </TabsContent>
        </Tabs>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Showing {(userPage - 1) * pageSize + 1}-{Math.min(userPage * pageSize, tabUsers.length)} of {tabUsers.length}</p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={userPage === 1} onClick={() => setUserPage((prev: number) => Math.max(1, prev - 1))}>Previous</Button>
            <span className="text-xs text-muted-foreground">Page {userPage} / {totalPages}</span>
            <Button size="sm" variant="outline" disabled={userPage === totalPages} onClick={() => setUserPage((prev: number) => Math.min(totalPages, prev + 1))}>Next</Button>
          </div>
        </div>
      </CardShell>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update profile details for the selected user.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Full name" value={editFullName} onChange={(event) => setEditFullName(event.target.value)} />
            <Input placeholder="Email" value={editEmail} onChange={(event) => setEditEmail(event.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button disabled={userActionBusy} onClick={() => void submitEdit()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={roleOpen} onOpenChange={setRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
            <DialogDescription>Set API role for the selected user.</DialogDescription>
          </DialogHeader>
          <Input placeholder="Role (admin, doctor, nurse, staff)" value={assignRole} onChange={(event) => setAssignRole(event.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleOpen(false)}>Cancel</Button>
            <Button disabled={userActionBusy} onClick={() => void submitRole()}>Update Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>Set a temporary password for the selected user.</DialogDescription>
          </DialogHeader>
          <Input placeholder="Temporary password" value={resetPassword} onChange={(event) => setResetPassword(event.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordOpen(false)}>Cancel</Button>
            <Button disabled={userActionBusy} onClick={() => void submitPassword()}>Reset Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Account Status</DialogTitle>
            <DialogDescription>Choose lock or unlock action.</DialogDescription>
          </DialogHeader>
          <Input placeholder="lock or unlock" value={statusAction} onChange={(event) => setStatusAction(event.target.value.trim().toLowerCase() === "unlock" ? "unlock" : "lock")} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusOpen(false)}>Cancel</Button>
            <Button disabled={userActionBusy} onClick={() => void submitStatus()}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate User</DialogTitle>
            <DialogDescription>This action will deactivate the selected account.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateOpen(false)}>Cancel</Button>
            <Button variant="destructive" disabled={userActionBusy} onClick={() => void submitDeactivate()}>Deactivate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={patientDetailsOpen} onOpenChange={setPatientDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Patient Information</DialogTitle>
            <DialogDescription>Read-only MPI record details for the selected patient.</DialogDescription>
          </DialogHeader>

          {selectedRow ? (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Full name</p>
                  <p className="text-sm font-medium">{selectedRow.name || "-"}</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{selectedRow.email || "-"}</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{selectedRow.phone || "-"}</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-medium">{selectedRow.status || "-"}</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Organization</p>
                  <p className="text-sm font-medium">{selectedRow.organization || "-"}</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Last updated</p>
                  <p className="text-sm font-medium">{selectedRow.lastActive || "-"}</p>
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
                <p className="mb-2 text-xs text-muted-foreground">Profile payload</p>
                <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-foreground">
{JSON.stringify(
  selectedRow.profile || {
    id: selectedRow.id,
    createdAt: selectedRow.createdAt,
    note: "No extended profile data was returned for this record.",
  },
  null,
  2,
)}
                </pre>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPatientDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}