"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { staffService, type StaffMember, type StaffTemplate, type CreateStaffPayload } from "@/services/staff.service";
import { mapTemplateRoleToBackendRole } from "@/lib/staff-role-mapping";

function isSameOrganizationStaff(member: StaffMember, currentOrganizationId: string) {
  const memberOrganizationId = (member.organization_id || "").trim().toLowerCase();
  return !memberOrganizationId || memberOrganizationId === currentOrganizationId.trim().toLowerCase();
}

function isManageableStaff(member: StaffMember, currentOrganizationId: string) {
  const role = member.role?.trim().toLowerCase();
  return isSameOrganizationStaff(member, currentOrganizationId) && Boolean(member.staff_template_key) && role !== "admin" && role !== "superadmin";
}

export default function StaffManagementPage() {
  const defaultStaffPassword = "Reset123!";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState("");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [staffTemplates, setStaffTemplates] = useState<StaffTemplate[]>([]);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");

  // Form state
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    staff_template_key: "",
    password: defaultStaffPassword,
    professional_title: "",
    license_number: "",
    active: true,
  });

  // Bulk add state
  const [bulkTemplate, setBulkTemplate] = useState("");
  const [bulkCount, setBulkCount] = useState(3);
  const [bulkPrefix, setBulkPrefix] = useState("team");
  const [bulkDomain, setBulkDomain] = useState("tenadam.local");

  // CSV import state
  const [csvPayload, setCsvPayload] = useState("");

  const visibleTemplates = useMemo(() => {
    const query = templateSearch.trim().toLowerCase();
    return staffTemplates
      .filter((template) => template.active !== false)
      .filter((template) => mapTemplateRoleToBackendRole(template.api_role) !== "superadmin")
      .filter((template) => {
        if (!query) return true;
        const mappedRole = mapTemplateRoleToBackendRole(template.api_role);
        return (
          template.title.toLowerCase().includes(query) ||
          template.template_key.toLowerCase().includes(query) ||
          template.api_role.toLowerCase().includes(query) ||
          mappedRole.includes(query) ||
          template.role_group.toLowerCase().includes(query) ||
          template.category.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [staffTemplates, templateSearch]);

  const receptionistTemplate = useMemo(() => {
    return staffTemplates.find((template) => mapTemplateRoleToBackendRole(template.api_role) === "reception") || null;
  }, [staffTemplates]);

  /**
   * Load organization and staff data
   */
  const loadData = useCallback(async function loadData() {
    setLoading(true);
    setError(null);
    try {
      // Get organization context
      const { organization_id } = await staffService.getOrganizationContext();
      setOrganizationId(organization_id);

      // Load staff and templates in parallel
      const [staffList, templates] = await Promise.all([
        staffService.getStaff(organization_id),
        staffService.getAvailableTemplates(),
      ]);

      setStaff(staffList.filter((member) => isManageableStaff(member, organization_id)));
      setStaffTemplates(templates);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  /**
   * Clear success message after 3 seconds
   */
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  /**
   * Clear error message after 5 seconds
   */
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  /**
   * Get role from template
   */
  function getRoleFromTemplate(templateKey: string): string {
    const template = staffTemplates.find((t) => t.template_key === templateKey);
    return mapTemplateRoleToBackendRole(template?.api_role);
  }

  /**
   * Reset form to initial state
   */
  function resetForm() {
    setForm({
      full_name: "",
      email: "",
      staff_template_key: "",
      password: defaultStaffPassword,
      professional_title: "",
      license_number: "",
      active: true,
    });
    setEditingStaffId(null);
  }

  /**
   * Start editing a staff member
   */
  function startEdit(member: StaffMember) {
    setEditingStaffId(member.id);
    setForm({
      full_name: member.full_name,
      email: member.email,
      staff_template_key: member.staff_template_key || "",
      password: defaultStaffPassword,
      professional_title: member.professional_title || "",
      license_number: member.license_number || "",
      active: member.active !== false,
    });
  }

  /**
   * Add or update staff member
   */
  async function handleSaveStaff() {
    if (!organizationId) return;

    // Validation
    if (!form.full_name.trim()) {
      setError("Full name is required");
      return;
    }
    if (!form.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!form.staff_template_key) {
      setError("Staff template is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (editingStaffId) {
        // Update existing staff
        await staffService.updateStaff(organizationId, editingStaffId, {
          professional_title: form.professional_title,
          license_number: form.license_number,
          active: form.active,
        });
        setSuccess("Staff member updated successfully");
      } else {
        // Create new staff - use correct payload structure
        const payload: CreateStaffPayload = {
          email: form.email.trim().toLowerCase(),
          full_name: form.full_name.trim(),
          password: form.password,
          staff_template_key: form.staff_template_key,
          professional_title: form.professional_title.trim(),
          license_number: form.license_number.trim(),
          role: getRoleFromTemplate(form.staff_template_key),
          active: form.active,
        };

        await staffService.createStaff(organizationId, payload);
        setSuccess("Staff member added successfully");
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save staff member");
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Delete (deactivate) staff member
   */
  async function handleDeleteStaff(id: string) {
    if (!organizationId) return;
    if (!confirm("Are you sure you want to remove this staff member?")) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await staffService.deleteStaff(organizationId, id);
      setSuccess("Staff member removed");
      if (editingStaffId === id) resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete staff member");
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Add multiple staff from template
   */
  async function handleBulkAdd() {
    if (!organizationId) return;
    if (!bulkTemplate) {
      setError("Select a staff template for bulk add");
      return;
    }

    const template = staffTemplates.find((t) => t.template_key === bulkTemplate);
    if (!template) {
      setError("Selected template not found");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const count = Math.max(1, Math.min(100, bulkCount));
      let created = 0;

      for (let i = 1; i <= count; i++) {
        const suffix = String(i).padStart(2, "0");
        const mappedRole = mapTemplateRoleToBackendRole(template.api_role);
        const payload: CreateStaffPayload = {
          email: `${bulkPrefix}.${template.template_key}.${suffix}@${bulkDomain}`.toLowerCase(),
          full_name: `${template.title} ${suffix}`,
          staff_template_key: template.template_key,
          professional_title: template.title,
          license_number:
            mappedRole === "doctor" || mappedRole === "nurse"
              ? `LIC-${template.template_key}-${suffix}`.toUpperCase()
              : "",
          role: mappedRole,
          active: true,
        };

        try {
          await staffService.createStaff(organizationId, payload);
          created++;
        } catch (err) {
          console.error(`Failed to create ${payload.email}:`, err);
          // Continue with next record
        }
      }

      setSuccess(`Bulk add complete: ${created}/${count} staff members created`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk add failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Import staff from CSV
   */
  async function handleImportCsv() {
    if (!organizationId) return;

    const lines = csvPayload
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      setError("Paste CSV data before importing");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let startRow = 0;
      if (
        lines[0].toLowerCase().includes("full_name") ||
        lines[0].toLowerCase().includes("email")
      ) {
        startRow = 1;
      }

      let created = 0;

      for (let i = startRow; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim());
        if (cols.length < 3) continue;

        const [full_name, email, staff_template_key, role, professional_title, license_number] =
          cols;

        if (!full_name || !email || !staff_template_key) continue;

        const payload: CreateStaffPayload = {
          email: email.toLowerCase(),
          full_name,
          staff_template_key,
          professional_title: professional_title || "",
          license_number: license_number || "",
          role: mapTemplateRoleToBackendRole(role || getRoleFromTemplate(staff_template_key)),
          active: true,
        };

        try {
          await staffService.createStaff(organizationId, payload);
          created++;
        } catch (err) {
          console.error(`Failed to import ${email}:`, err);
        }
      }

      if (created === 0) {
        setError(
          "No rows imported. Format: full_name,email,staff_template_key,role,professional_title,license_number"
        );
      } else {
        setSuccess(`CSV import complete: ${created} staff members created`);
        setCsvPayload("");
        await loadData();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "CSV import failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-6">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-6">
      {/* Header */}
      <header className="rounded-xl border border-border bg-card p-4">
        <h1 className="text-xl font-semibold">Staff Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add, edit, and manage organization staff members with role templates and credentials.
        </p>
      </header>

      {/* Messages */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          ✓ {success}
        </div>
      )}

      {/* Main Content */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        {/* Add/Edit Form */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-4 text-sm font-semibold">
            {editingStaffId ? "Edit Staff Member" : "Add New Staff Member"}
          </h2>

          <div className="space-y-3">
            {/* Full Name */}
            <div>
              <label htmlFor="staff-full-name" className="mb-1 block text-xs font-medium text-muted-foreground">
                Full Name *
              </label>
              <input
                id="staff-full-name"
                type="text"
                value={form.full_name}
                onChange={(e) => setForm((v) => ({ ...v, full_name: e.target.value }))}
                placeholder="e.g., John Smith"
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="staff-email" className="mb-1 block text-xs font-medium text-muted-foreground">
                Email *
              </label>
              <input
                id="staff-email"
                type="email"
                disabled={Boolean(editingStaffId)}
                value={form.email}
                onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))}
                placeholder="e.g., john@tenadam.com"
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm disabled:opacity-50"
              />
              {editingStaffId && (
                <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed</p>
              )}
            </div>

            {/* Password */}
            {!editingStaffId && (
              <div>
                <label htmlFor="staff-password" className="mb-1 block text-xs font-medium text-muted-foreground">
                  Password *
                </label>
                <input
                  id="staff-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((v) => ({ ...v, password: e.target.value }))}
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm"
                />
              </div>
            )}

            {/* Staff Template */}
            <div>
              <label htmlFor="template-search" className="mb-1 block text-xs font-medium text-muted-foreground">
                Search Role Template
              </label>
              <input
                id="template-search"
                type="text"
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder="Search receptionist, ward clerk, doctor, nurse..."
                className="mb-2 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
              />

              <label htmlFor="staff-template" className="mb-1 block text-xs font-medium text-muted-foreground">
                Staff Role Template *
              </label>
              <select
                id="staff-template"
                aria-label="Staff role template"
                title="Staff role template"
                value={form.staff_template_key}
                onChange={(e) =>
                  setForm((v) => ({ ...v, staff_template_key: e.target.value }))
                }
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option value="">-- Select template --</option>
                {visibleTemplates.map((template) => (
                  <option key={template.template_key} value={template.template_key}>
                    {template.title} ({mapTemplateRoleToBackendRole(template.api_role)})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                {visibleTemplates.length} templates found. Mapped role values are normalized for backend compatibility.
              </p>
              {receptionistTemplate && (
                <button
                  type="button"
                  onClick={() => setForm((v) => ({ ...v, staff_template_key: receptionistTemplate.template_key }))}
                  className="mt-2 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                >
                  Quick select receptionist template ({receptionistTemplate.title})
                </button>
              )}
            </div>

            {/* Role (Auto-populated) */}
            {form.staff_template_key && (
              <div>
                <label htmlFor="api-role" className="mb-1 block text-xs font-medium text-muted-foreground">
                  API Role (Auto-mapped)
                </label>
                <input
                  id="api-role"
                  type="text"
                  disabled
                  value={getRoleFromTemplate(form.staff_template_key)}
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm disabled:opacity-50"
                />
              </div>
            )}

            {/* Professional Title */}
            <div>
              <label htmlFor="professional-title" className="mb-1 block text-xs font-medium text-muted-foreground">
                Professional Title
              </label>
              <input
                id="professional-title"
                type="text"
                value={form.professional_title}
                onChange={(e) =>
                  setForm((v) => ({ ...v, professional_title: e.target.value }))
                }
                placeholder="e.g., Senior Receptionist"
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm"
              />
            </div>

            {/* License Number */}
            <div>
              <label htmlFor="license-number" className="mb-1 block text-xs font-medium text-muted-foreground">
                License/ID Number
              </label>
              <input
                id="license-number"
                type="text"
                value={form.license_number}
                onChange={(e) => setForm((v) => ({ ...v, license_number: e.target.value }))}
                placeholder="e.g., LIC-12345"
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm"
              />
            </div>


            {/* Active Status */}
            {/* Active Status (Create + Edit) */}
<div>
  <label
    htmlFor="staff-status"
    className="mb-1 block text-xs font-medium text-muted-foreground"
  >
    Status
  </label>

  <select
    id="staff-status"
    aria-label="Staff status"
    title="Staff status"
    value={form.active ? "active" : "inactive"}
    onChange={(e) =>
      setForm((v) => ({ ...v, active: e.target.value === "active" }))
    }
    className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm"
  >
    <option value="active">Active</option>
    <option value="inactive">Inactive</option>
  </select>

  <p className="mt-1 text-xs text-muted-foreground">
    Controls whether this staff account is enabled
  </p>
</div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveStaff}
                disabled={isSubmitting}
                className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
              >
                {isSubmitting
                  ? "Saving..."
                  : editingStaffId
                    ? "Update Staff"
                    : "Add Staff"}
              </button>
              {editingStaffId && (
                <button
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="h-9 px-3 rounded-lg border border-border text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Staff List */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-4 text-sm font-semibold">Organization Staff ({staff.length})</h2>

          <div className="max-h-150 space-y-2 overflow-y-auto">
            {staff.length === 0 ? (
              <p className="text-xs text-muted-foreground">No staff members yet</p>
            ) : (
              staff.map((member) => (
                <div key={member.id} className="rounded-lg border border-border bg-background p-3 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{member.full_name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        member.active !== false
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {member.active !== false ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {member.staff_template_key && (
                    <p className="text-xs text-muted-foreground">{member.staff_template_title || member.staff_template_key}</p>
                  )}
                  {member.professional_title && (
                    <p className="text-xs text-muted-foreground">Title: {member.professional_title}</p>
                  )}
                  {member.license_number && (
                    <p className="text-xs text-muted-foreground">License: {member.license_number}</p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => startEdit(member)}
                      disabled={isSubmitting}
                      className="text-xs px-2 py-1 rounded border border-border hover:bg-muted disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteStaff(member.id)}
                      disabled={isSubmitting}
                      className="text-xs px-2 py-1 rounded border border-border text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bulk Operations */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Bulk Add */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Bulk Add Staff</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Quickly create multiple staff members from a template
          </p>

          <div className="space-y-3">
            <div>
              <label htmlFor="bulk-template" className="mb-1 block text-xs font-medium text-muted-foreground">
                Template *
              </label>
              <select
                id="bulk-template"
                aria-label="Bulk add template"
                title="Bulk add template"
                value={bulkTemplate}
                onChange={(e) => setBulkTemplate(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option value="">-- Select template --</option>
                {visibleTemplates.map((template) => (
                  <option key={template.template_key} value={template.template_key}>
                    {template.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="bulk-prefix" className="mb-1 block text-xs font-medium text-muted-foreground">
                  Prefix
                </label>
                <input
                  id="bulk-prefix"
                  type="text"
                  value={bulkPrefix}
                  onChange={(e) => setBulkPrefix(e.target.value)}
                  placeholder="team"
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label htmlFor="bulk-count" className="mb-1 block text-xs font-medium text-muted-foreground">
                  Count
                </label>
                <input
                  id="bulk-count"
                  type="number"
                  min="1"
                  max="100"
                  value={bulkCount}
                  onChange={(e) => setBulkCount(Number(e.target.value) || 1)}
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bulk-domain" className="mb-1 block text-xs font-medium text-muted-foreground">
                Domain
              </label>
              <input
                id="bulk-domain"
                type="text"
                value={bulkDomain}
                onChange={(e) => setBulkDomain(e.target.value)}
                placeholder="tenadam.local"
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm"
              />
            </div>

            <button
              onClick={handleBulkAdd}
              disabled={isSubmitting}
              className="w-full h-9 rounded-lg border border-border hover:bg-muted text-sm font-medium disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Run Bulk Add"}
            </button>
          </div>
        </div>

        {/* CSV Import */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">CSV Import</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Format: full_name,email,staff_template_key,role,professional_title,license_number
          </p>

          <textarea
            id="csv-payload"
            value={csvPayload}
            onChange={(e) => setCsvPayload(e.target.value)}
            placeholder="John Smith,john@tenadam.com,ward-clerk,reception,Receptionist,LIC-001"
            className="w-full h-32 rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono"
          />

          <button
            onClick={handleImportCsv}
            disabled={isSubmitting}
            className="w-full h-9 mt-3 rounded-lg border border-border hover:bg-muted text-sm font-medium disabled:opacity-50"
          >
            {isSubmitting ? "Importing..." : "Import CSV"}
          </button>
        </div>
      </div>
    </div>
  );
}
