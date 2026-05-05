"use client";

import { useEffect, useMemo, useState } from "react";
import { Settings, Search, Building2, ClipboardList, UserPlus } from "lucide-react";

type Application = {
  id: string;
  organization_name: string;
  organization_slug: string;
  contact_name: string;
  requested_services: string[];
  selected_staff_templates: string[];
  status: string;
  created_at: string;
};

type Organization = {
  id: string;
  name: string;
  slug: string;
  tier: string;
  enabled_services: string[];
  min_staff: Record<string, number>;
  staff_count: number;
};

type TierRequirement = {
  tier: string;
  description: string;
  min_staff: Record<string, number>;
  default_services: string[];
};

type StaffTemplate = {
  template_key: string;
  title: string;
};

type OrganizationConfiguration = {
  organization_id: string;
  organization_name: string;
  tier: string;
  enabled_services: string[];
  min_staff: Record<string, number>;
  queue_enabled: boolean;
};

type OrganizationStaff = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  professional_title?: string;
  license_number?: string;
};

const STAFF_ROLE_OPTIONS = ["admin", "doctor", "nurse", "reception", "staff", "lab", "pharmacist"];

function toArrayPayload<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }
  if (payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: T[] }).data;
  }
  return [];
}

export default function SuperAdminDashboardPage() {
  const [tab, setTab] = useState<"onboarding" | "organizations">("onboarding");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [applications, setApplications] = useState<Application[]>([]);
  const [staffTemplates, setStaffTemplates] = useState<StaffTemplate[]>([]);

  const [search, setSearch] = useState("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [tiers, setTiers] = useState<TierRequirement[]>([]);

  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [configuration, setConfiguration] = useState<OrganizationConfiguration | null>(null);
  const [orgStaff, setOrgStaff] = useState<OrganizationStaff[]>([]);

  const [staffForm, setStaffForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "staff",
    professional_title: "",
    license_number: "",
    staff_template_key: "",
  });

  async function loadApplications() {
    const [appsRes, templateRes] = await Promise.all([fetch("/api/org/applications"), fetch("/api/org/staff-role-templates")]);
    if (!appsRes.ok) {
      const body = (await appsRes.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error || "Failed to load onboarding queue");
    }
    const appsPayload = (await appsRes.json().catch(() => [])) as unknown;
    setApplications(toArrayPayload<Application>(appsPayload));

    if (templateRes.ok) {
      const templatePayload = (await templateRes.json().catch(() => [])) as unknown;
      setStaffTemplates(toArrayPayload<StaffTemplate>(templatePayload));
    }
  }

  async function loadOrganizations(currentSearch = "") {
    const [orgRes, tiersRes] = await Promise.all([
      fetch(`/api/org/organizations?search=${encodeURIComponent(currentSearch)}`),
      fetch("/api/org/tiers"),
    ]);

    if (!orgRes.ok) {
      const body = (await orgRes.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error || "Failed to load organizations");
    }

    const orgPayload = (await orgRes.json().catch(() => [])) as unknown;
    setOrganizations(toArrayPayload<Organization>(orgPayload));

    if (tiersRes.ok) {
      const tierPayload = (await tiersRes.json().catch(() => [])) as unknown;
      setTiers(toArrayPayload<TierRequirement>(tierPayload));
    }
  }

  async function loadOrganizationDetails(organizationId: string) {
    const [cfgRes, staffRes] = await Promise.all([
      fetch(`/api/org/organizations/${encodeURIComponent(organizationId)}/configuration`),
      fetch(`/api/org/organizations/${encodeURIComponent(organizationId)}/staff?limit=200`),
    ]);

    if (cfgRes.ok) {
      const payload = (await cfgRes.json().catch(() => null)) as OrganizationConfiguration | null;
      setConfiguration(payload);
    } else {
      setConfiguration(null);
    }

    if (staffRes.ok) {
      const payload = (await staffRes.json().catch(() => [])) as unknown;
      setOrgStaff(toArrayPayload<OrganizationStaff>(payload));
    } else {
      setOrgStaff([]);
    }
  }

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadApplications(), loadOrganizations(search)]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load super-admin data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  async function approveApplication(applicationId: string) {
    setError(null);
    const res = await fetch(`/api/org/applications/${encodeURIComponent(applicationId)}/approve`, { method: "PATCH" });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error || "Failed to approve organization application");
      return;
    }
    await loadApplications();
    await loadOrganizations(search);
  }

  async function saveConfiguration() {
    if (!selectedOrganization || !configuration) return;
    setError(null);

    const res = await fetch(`/api/org/organizations/${encodeURIComponent(selectedOrganization.id)}/configuration`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(configuration),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error || "Failed to save organization configuration");
      return;
    }

    const payload = (await res.json().catch(() => null)) as OrganizationConfiguration | null;
    if (payload) setConfiguration(payload);
    await loadOrganizations(search);
  }

  async function addStaff() {
    if (!selectedOrganization) return;
    setError(null);
    const res = await fetch(`/api/org/organizations/${encodeURIComponent(selectedOrganization.id)}/staff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(staffForm),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error || "Failed to add staff");
      return;
    }

    setStaffForm({
      full_name: "",
      email: "",
      password: "",
      role: "staff",
      professional_title: "",
      license_number: "",
      staff_template_key: "",
    });
    await loadOrganizationDetails(selectedOrganization.id);
  }

  const filteredApplications = useMemo(
    () => applications.filter((app) => app.status === "pending" || app.status === "approved" || app.status === "verified"),
    [applications]
  );

  const tierDefaults = useMemo(() => {
    const map: Record<string, TierRequirement> = {};
    for (const tier of tiers) map[tier.tier] = tier;
    return map;
  }, [tiers]);

  return (
    <div className="mx-auto max-w-screen-2xl space-y-4 p-4 md:p-6">
      <header className="rounded-xl border border-border bg-card p-4">
        <h1 className="text-xl font-semibold">Super Admin Organization Control</h1>
        <p className="mt-1 text-sm text-muted-foreground">Compact onboarding queue, tier-based staffing requirements, and per-organization configuration.</p>
      </header>

      <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2">
        <button
          onClick={() => setTab("onboarding")}
          className={`rounded-lg px-3 py-2 text-sm ${tab === "onboarding" ? "bg-primary text-primary-foreground" : "bg-background"}`}
        >
          <ClipboardList className="mr-1 inline h-4 w-4" /> Onboarding Queue
        </button>
        <button
          onClick={() => setTab("organizations")}
          className={`rounded-lg px-3 py-2 text-sm ${tab === "organizations" ? "bg-primary text-primary-foreground" : "bg-background"}`}
        >
          <Building2 className="mr-1 inline h-4 w-4" /> Manage Organizations
        </button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : null}

      {!loading && tab === "onboarding" ? (
        <section className="rounded-xl border border-border bg-card p-4">
          <div className="grid gap-2">
            {filteredApplications.map((item) => (
              <article key={item.id} className="grid gap-2 rounded-lg border border-border bg-background p-3 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-sm font-medium">{item.organization_name} <span className="text-xs text-muted-foreground">({item.organization_slug})</span></p>
                  <p className="text-xs text-muted-foreground">Contact: {item.contact_name} | Services: {(item.requested_services || []).join(", ") || "-"}</p>
                  <p className="text-xs text-muted-foreground">Templates: {(item.selected_staff_templates || []).join(", ") || "Not set"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-border px-2 py-1 text-xs">{item.status}</span>
                  {item.status === "pending" ? (
                    <button onClick={() => approveApplication(item.id)} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                      Approve
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
            {filteredApplications.length === 0 ? <p className="text-sm text-muted-foreground">No applications in the onboarding queue.</p> : null}
          </div>
        </section>
      ) : null}

      {!loading && tab === "organizations" ? (
        <section className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search organizations"
                className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
              />
              <button
                onClick={() => loadOrganizations(search)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs"
              >
                Search
              </button>
            </div>

            <div className="space-y-2">
              {organizations.map((org) => (
                <article key={org.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                  <div>
                    <p className="text-sm font-medium">{org.name}</p>
                    <p className="text-xs text-muted-foreground">{org.slug} | Tier: {org.tier} | Staff: {org.staff_count}</p>
                  </div>
                  <button
                    aria-label={`Configure ${org.name}`}
                    onClick={() => {
                      setSelectedOrganization(org);
                      void loadOrganizationDetails(org.id);
                    }}
                    className="rounded-lg border border-border px-2 py-1.5 text-xs"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </article>
              ))}
              {organizations.length === 0 ? <p className="text-sm text-muted-foreground">No organizations found.</p> : null}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            {!selectedOrganization || !configuration ? (
              <p className="text-sm text-muted-foreground">Select an organization to configure tier, services, and staff capacity.</p>
            ) : (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold">{selectedOrganization.name} Configuration</h2>

                <label className="block text-xs text-muted-foreground">Tier</label>
                <select
                  aria-label="Organization tier"
                  value={configuration.tier}
                  onChange={(e) => {
                    const nextTier = e.target.value;
                    const defaults = tierDefaults[nextTier];
                    setConfiguration((current) =>
                      current
                        ? {
                            ...current,
                            tier: nextTier,
                            enabled_services: defaults?.default_services ?? current.enabled_services,
                            min_staff: defaults?.min_staff ?? current.min_staff,
                          }
                        : current
                    );
                  }}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
                >
                  {tiers.map((tier) => (
                    <option key={tier.tier} value={tier.tier}>{tier.tier}</option>
                  ))}
                </select>

                <label className="block text-xs text-muted-foreground">Enabled services (comma separated)</label>
                <input
                  aria-label="Enabled services"
                  value={configuration.enabled_services.join(", ")}
                  onChange={(e) =>
                    setConfiguration((current) =>
                      current
                        ? {
                            ...current,
                            enabled_services: e.target.value
                              .split(",")
                              .map((entry) => entry.trim())
                              .filter(Boolean),
                          }
                        : current
                    )
                  }
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
                />

                <label className="block text-xs text-muted-foreground">Minimum staff by role (JSON)</label>
                <textarea
                  aria-label="Minimum staff JSON"
                  value={JSON.stringify(configuration.min_staff)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value) as Record<string, number>;
                      setConfiguration((current) => (current ? { ...current, min_staff: parsed } : current));
                    } catch {
                      // Keep user typing intact; invalid JSON is ignored until valid.
                    }
                  }}
                  className="min-h-20 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs"
                />

                <button onClick={saveConfiguration} className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">
                  Save Configuration
                </button>

                <div className="border-t border-border pt-3">
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground">Add Staff</h3>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <input aria-label="Staff full name" value={staffForm.full_name} onChange={(e) => setStaffForm((v) => ({ ...v, full_name: e.target.value }))} placeholder="Full name" className="h-9 rounded-lg border border-border bg-background px-3 text-xs" />
                    <input aria-label="Staff email" value={staffForm.email} onChange={(e) => setStaffForm((v) => ({ ...v, email: e.target.value }))} placeholder="Email" className="h-9 rounded-lg border border-border bg-background px-3 text-xs" />
                    <input aria-label="Staff password" value={staffForm.password} onChange={(e) => setStaffForm((v) => ({ ...v, password: e.target.value }))} placeholder="Password" className="h-9 rounded-lg border border-border bg-background px-3 text-xs" />
                    <select aria-label="Staff role" value={staffForm.role} onChange={(e) => setStaffForm((v) => ({ ...v, role: e.target.value }))} className="h-9 rounded-lg border border-border bg-background px-3 text-xs">
                      {STAFF_ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
                    </select>
                    <input aria-label="Staff professional title" value={staffForm.professional_title} onChange={(e) => setStaffForm((v) => ({ ...v, professional_title: e.target.value }))} placeholder="Professional title" className="h-9 rounded-lg border border-border bg-background px-3 text-xs" />
                    <input aria-label="Staff license number" value={staffForm.license_number} onChange={(e) => setStaffForm((v) => ({ ...v, license_number: e.target.value }))} placeholder="License number (doctor/nurse)" className="h-9 rounded-lg border border-border bg-background px-3 text-xs" />
                    <select aria-label="Staff template" value={staffForm.staff_template_key} onChange={(e) => setStaffForm((v) => ({ ...v, staff_template_key: e.target.value }))} className="h-9 rounded-lg border border-border bg-background px-3 text-xs sm:col-span-2">
                      <option value="">Select template (optional)</option>
                      {staffTemplates.map((template) => <option key={template.template_key} value={template.template_key}>{template.title}</option>)}
                    </select>
                  </div>
                  <button onClick={addStaff} className="mt-2 rounded-lg border border-border px-3 py-2 text-xs">
                    <UserPlus className="mr-1 inline h-4 w-4" /> Add Staff
                  </button>
                </div>

                <div className="border-t border-border pt-3">
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground">Current Staff</h3>
                  <div className="mt-2 space-y-1">
                    {orgStaff.map((staff) => (
                      <div key={staff.id} className="rounded-lg border border-border bg-background px-2 py-1 text-xs">
                        {staff.full_name} | {staff.role} | {staff.email}
                        {staff.license_number ? ` | License: ${staff.license_number}` : ""}
                      </div>
                    ))}
                    {orgStaff.length === 0 ? <p className="text-xs text-muted-foreground">No staff registered for this organization.</p> : null}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
