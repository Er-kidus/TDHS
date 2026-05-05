import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch, getErrorMessage, readJson } from "@/lib/api";
import { CardShell } from "./common";
import type { ConfigPageProps } from "./config/types";

type StaffTemplateRow = {
  template_key: string;
  title: string;
  role_group: string;
  category: string;
  api_role: string;
  description: string;
  sort_order: number;
  active: boolean;
};

type SystemRoleRow = {
  name: string;
  description: string;
  active: boolean;
};

export default function ConfigPage(props: ConfigPageProps) {
  const {
    toast,
    handleCreateUser,
    userActionBusy = false,
    selectedStaffRoleTemplate = "",
    setSelectedStaffRoleTemplate = () => undefined,
  } = props;
  const { token } = useAuth();

  const [dbStaffTemplates, setDbStaffTemplates] = useState<StaffTemplateRow[]>([]);
  const [systemRoles, setSystemRoles] = useState<SystemRoleRow[]>([]);
  const [templateBusy, setTemplateBusy] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const [templateGroupFilter, setTemplateGroupFilter] = useState("All");
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState("All");
  const [templateForm, setTemplateForm] = useState({
    template_key: "",
    title: "",
    role_group: "Clinical Staff",
    category: "General",
    api_role: "staff",
    description: "",
    sort_order: 100,
  });

  const loadTemplates = useCallback(async () => {
    if (!token) return;
    try {
      const templatesRes = await apiFetch("/org/staff-role-templates", { token });
      if (!templatesRes.ok) {
        throw new Error(await getErrorMessage(templatesRes, "Failed to load staff templates"));
      }
      const payload = await readJson<unknown>(templatesRes);
      const rows = Array.isArray(payload) ? (payload as StaffTemplateRow[]) : [];
      setDbStaffTemplates(rows);
    } catch (error) {
      toast({
        title: "Load warning",
        description: error instanceof Error ? error.message : "Unable to load staff templates.",
        variant: "destructive",
      });
    }
  }, [toast, token]);

  const loadSystemRoles = useCallback(async () => {
    if (!token) return;
    try {
      const rolesRes = await apiFetch("/org/system/roles", { token });
      if (!rolesRes.ok) {
        throw new Error(await getErrorMessage(rolesRes, "Failed to load system roles"));
      }
      const payload = await readJson<unknown>(rolesRes);
      const rows = Array.isArray(payload) ? (payload as SystemRoleRow[]) : [];
      setSystemRoles(rows);
    } catch (error) {
      toast({
        title: "Load warning",
        description: error instanceof Error ? error.message : "Unable to load system roles.",
        variant: "destructive",
      });
    }
  }, [toast, token]);

  useEffect(() => {
    void loadTemplates();
    void loadSystemRoles();
  }, [loadTemplates, loadSystemRoles]);

  const templateGroups = useMemo(() => {
    return ["All", ...Array.from(new Set(dbStaffTemplates.map((item) => item.role_group))).sort((a, b) => a.localeCompare(b))];
  }, [dbStaffTemplates]);

  const templateCategories = useMemo(() => {
    return ["All", ...Array.from(new Set(dbStaffTemplates.map((item) => item.category))).sort((a, b) => a.localeCompare(b))];
  }, [dbStaffTemplates]);

  const visibleTemplates = useMemo(() => {
    const query = templateSearch.trim().toLowerCase();
    return dbStaffTemplates
      .filter((item) => {
        const bySearch =
          query.length === 0 ||
          item.title.toLowerCase().includes(query) ||
          item.role_group.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query);
        const byGroup = templateGroupFilter === "All" || item.role_group === templateGroupFilter;
        const byCategory = templateCategoryFilter === "All" || item.category === templateCategoryFilter;
        return bySearch && byGroup && byCategory;
      })
      .sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title));
  }, [dbStaffTemplates, templateCategoryFilter, templateGroupFilter, templateSearch]);

  const activeSystemRoles = useMemo(() => {
    return systemRoles.filter((role) => role.active).sort((a, b) => a.name.localeCompare(b.name));
  }, [systemRoles]);

  const visibleSystemRoles = useMemo(() => {
    const query = roleSearch.trim().toLowerCase();
    return systemRoles
      .filter((role) => {
        if (query.length === 0) return true;
        return role.name.toLowerCase().includes(query) || role.description.toLowerCase().includes(query);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [roleSearch, systemRoles]);

  const selectedTemplate = useMemo(() => {
    return dbStaffTemplates.find((item) => item.template_key === selectedStaffRoleTemplate) || null;
  }, [dbStaffTemplates, selectedStaffRoleTemplate]);

  async function createTemplate() {
    if (!token) return;
    if (!templateForm.template_key.trim() || !templateForm.title.trim()) {
      toast({ title: "Validation failed", description: "Template key and title are required.", variant: "destructive" });
      return;
    }

    setTemplateBusy(true);
    try {
      const response = await apiFetch("/org/staff-role-templates", {
        token,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateForm),
      });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "Failed to create staff template"));
      }
      toast({ title: "Template created", description: `${templateForm.title} added.` });
      setTemplateForm({
        template_key: "",
        title: "",
        role_group: "Clinical Staff",
        category: "General",
        api_role: "staff",
        description: "",
        sort_order: 100,
      });
      await loadTemplates();
    } catch (error) {
      toast({ title: "Create failed", description: error instanceof Error ? error.message : "Unable to create template.", variant: "destructive" });
    } finally {
      setTemplateBusy(false);
    }
  }

  async function toggleTemplate(template: StaffTemplateRow) {
    if (!token) return;
    setTemplateBusy(true);
    try {
      const response = await apiFetch(`/org/staff-role-templates/${encodeURIComponent(template.template_key)}/status`, {
        token,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !template.active }),
      });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "Failed to update template status"));
      }
      await loadTemplates();
    } catch (error) {
      toast({ title: "Status update failed", description: error instanceof Error ? error.message : "Unable to update template.", variant: "destructive" });
    } finally {
      setTemplateBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <CardShell title="System Configuration" description="Staff template configuration is fully database-backed.">
        <CardShell title="Staff Templates (Database)" description="Search and filter standardized hospital roles from the database.">
          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <Input value={templateSearch} onChange={(event) => setTemplateSearch(event.target.value)} placeholder="Search role, category, or group" aria-label="Search role templates" />
            <select aria-label="Filter templates by role group" title="Filter templates by role group" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={templateGroupFilter} onChange={(event) => setTemplateGroupFilter(event.target.value)}>
              {templateGroups.map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
            <select aria-label="Filter templates by category" title="Filter templates by category" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={templateCategoryFilter} onChange={(event) => setTemplateCategoryFilter(event.target.value)}>
              {templateCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>{visibleTemplates.length} templates loaded ({visibleTemplates.filter((item) => item.active).length} active). {activeSystemRoles.length} active system roles loaded. Selected template: {selectedTemplate ? `${selectedTemplate.title} (${selectedTemplate.api_role})` : "none"}.</p>
            <Button
              size="sm"
              variant="outline"
              disabled={userActionBusy || !selectedTemplate}
              onClick={() => handleCreateUser?.()}
            >
              Create User From Template
            </Button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border/70">
            <table className="min-w-[980px] w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Role Title</th>
                  <th className="px-3 py-2 text-left font-medium">Role Group</th>
                  <th className="px-3 py-2 text-left font-medium">Category</th>
                  <th className="px-3 py-2 text-left font-medium">Mapped System Role</th>
                  <th className="px-3 py-2 text-left font-medium">Use</th>
                </tr>
              </thead>
              <tbody>
                {visibleTemplates.slice(0, 160).map((role) => (
                  <tr key={role.template_key} className="border-t border-border/60 hover:bg-muted/30">
                    <td className="px-3 py-2.5 font-medium">{role.title}</td>
                    <td className="px-3 py-2.5">{role.role_group}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{role.category}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{role.api_role}</Badge>
                        {!role.active && <Badge variant="outline">Inactive</Badge>}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <Button size="sm" variant={selectedStaffRoleTemplate === role.template_key ? "default" : "outline"} onClick={() => setSelectedStaffRoleTemplate(role.template_key)}>
                        {selectedStaffRoleTemplate === role.template_key ? "Selected" : "Set Template"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardShell>

        <CardShell title="System Roles (Database)" description="Inspect all registered backend roles and their current status.">
          <div className="mb-3 grid gap-3 md:grid-cols-3">
            <Input
              value={roleSearch}
              onChange={(event) => setRoleSearch(event.target.value)}
              placeholder="Search role name or description"
              aria-label="Search system roles"
            />
            <div className="rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
              Active: {systemRoles.filter((role) => role.active).length}
            </div>
            <div className="rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
              Total: {systemRoles.length}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border/70">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Role Name</th>
                  <th className="px-3 py-2 text-left font-medium">Description</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {visibleSystemRoles.map((role) => (
                  <tr key={role.name} className="border-t border-border/60">
                    <td className="px-3 py-2 font-medium">
                      <Badge variant="secondary">{role.name}</Badge>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{role.description || "-"}</td>
                    <td className="px-3 py-2">
                      <Badge variant={role.active ? "default" : "outline"}>{role.active ? "Active" : "Inactive"}</Badge>
                    </td>
                  </tr>
                ))}
                {visibleSystemRoles.length === 0 && (
                  <tr>
                    <td className="px-3 py-3 text-muted-foreground" colSpan={3}>No roles found for this search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardShell>

        <CardShell title="Add / Manage Template" description="Add additional role templates and activate/deactivate existing ones.">
          <div className="grid gap-3 md:grid-cols-3">
            <Input value={templateForm.template_key} onChange={(event) => setTemplateForm((prev) => ({ ...prev, template_key: event.target.value }))} placeholder="template_key" />
            <Input value={templateForm.title} onChange={(event) => setTemplateForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Template title" />
            <Input value={templateForm.role_group} onChange={(event) => setTemplateForm((prev) => ({ ...prev, role_group: event.target.value }))} placeholder="Role group" />
            <Input value={templateForm.category} onChange={(event) => setTemplateForm((prev) => ({ ...prev, category: event.target.value }))} placeholder="Category" />
            <select
              aria-label="Select API role"
              title="Select API role"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={templateForm.api_role}
              onChange={(event) => setTemplateForm((prev) => ({ ...prev, api_role: event.target.value }))}
            >
              {activeSystemRoles.map((role) => (
                <option key={role.name} value={role.name}>{role.name}</option>
              ))}
            </select>
            <Input value={String(templateForm.sort_order)} onChange={(event) => setTemplateForm((prev) => ({ ...prev, sort_order: Number(event.target.value) || 100 }))} placeholder="Sort order" />
            <Input className="md:col-span-3" value={templateForm.description} onChange={(event) => setTemplateForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Description" />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Button disabled={templateBusy || !token} onClick={() => void createTemplate()}>
              Add Staff Template
            </Button>
            <Button variant="outline" disabled={templateBusy || !token} onClick={() => void loadTemplates()}>
              Refresh
            </Button>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-border/70">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Key</th>
                  <th className="px-3 py-2 text-left font-medium">Title</th>
                  <th className="px-3 py-2 text-left font-medium">Group</th>
                  <th className="px-3 py-2 text-left font-medium">Category</th>
                  <th className="px-3 py-2 text-left font-medium">API Role</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {dbStaffTemplates.map((template) => (
                  <tr key={template.template_key} className="border-t border-border/60">
                    <td className="px-3 py-2">{template.template_key}</td>
                    <td className="px-3 py-2">{template.title}</td>
                    <td className="px-3 py-2">{template.role_group}</td>
                    <td className="px-3 py-2">{template.category}</td>
                    <td className="px-3 py-2"><Badge variant="secondary">{template.api_role}</Badge></td>
                    <td className="px-3 py-2">
                      <Button size="sm" variant="outline" disabled={templateBusy || !token} onClick={() => void toggleTemplate(template)}>
                        {template.active ? "Deactivate" : "Activate"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardShell>
      </CardShell>
    </div>
  );
}
