"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { mapTemplateRoleToBackendRole } from "@/lib/staff-role-mapping";

type OrgIdentity = {
  organization_id?: string;
};

type Configuration = {
  tier: string;
  enabled_services: string[];
  enabled_features?: string[];
  feature_flags?: Record<string, boolean>;
  workflow_rules?: Record<string, { enabled?: boolean; severity?: string }>;
  communication?: {
    smsProvider?: string;
    emailSender?: string;
    ussdGateway?: string;
    notifyBySms?: boolean;
    notifyByEmail?: boolean;
  };
  billing?: {
    enableBilling?: boolean;
    enableInsurance?: boolean;
    pricingModel?: string;
    claimAutomation?: boolean;
  };
  min_staff: Record<string, number>;
  queue_enabled: boolean;
};

type StaffMember = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  staff_template_key?: string;
  professional_title?: string;
  license_number?: string;
  active?: boolean;
};

type Patient = {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  active: boolean;
};

type Appointment = {
  id: string;
  status?: string;
};

type StaffTemplate = {
  template_key: string;
  title: string;
  api_role: string;
  category: string;
  role_group: string;
};

type TabId = "configuration" | "patients";

function toArrayPayload<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }
  if (payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: T[] }).data;
  }
  return [];
}

function toObjectPayload<T>(payload: unknown): T | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const candidate = payload as { data?: unknown };
  if (candidate.data && typeof candidate.data === "object" && !Array.isArray(candidate.data)) {
    return candidate.data as T;
  }
  if (!Array.isArray(payload)) {
    return payload as T;
  }
  return null;
}

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<TabId>("configuration");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string>("");
  const [configuration, setConfiguration] = useState<Configuration | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointmentSummary, setAppointmentSummary] = useState({ booked: 0, cancelled: 0, rescheduled: 0 });
  const [staffTemplates, setStaffTemplates] = useState<StaffTemplate[]>([]);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  const [staffForm, setStaffForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "staff",
    active: true,
    professional_title: "",
    license_number: "",
    staff_template_key: "",
  });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const meRes = await fetch("/api/org/me");
      if (!meRes.ok) {
        throw new Error("Failed to load organization identity");
      }
      const me = (await meRes.json().catch(() => ({}))) as OrgIdentity;
      if (!me.organization_id) {
        throw new Error("Organization context is missing for this admin account.");
      }

      setOrganizationId(me.organization_id);

      const [cfgRes, staffRes] = await Promise.all([
        fetch(`/api/org/organizations/${encodeURIComponent(me.organization_id)}/configuration`),
        fetch(`/api/org/organizations/${encodeURIComponent(me.organization_id)}/staff?limit=200`),
      ]);

      const [patientsRes, templatesRes, appointmentsRes] = await Promise.all([
        fetch("/api/org/patients?limit=200"),
        fetch("/api/org/staff-role-templates"),
        fetch("/api/appointments?limit=500"),
      ]);

      if (cfgRes.ok) {
        const cfgPayload = (await cfgRes.json().catch(() => null)) as Configuration | null;
        setConfiguration(toObjectPayload<Configuration>(cfgPayload));
      } else {
        setConfiguration(null);
      }

      if (staffRes.ok) {
        const staffPayload = (await staffRes.json().catch(() => [])) as unknown;
        setStaff(toArrayPayload<StaffMember>(staffPayload));
      } else {
        setStaff([]);
      }

      if (patientsRes.ok) {
        const patientPayload = (await patientsRes.json().catch(() => [])) as unknown;
        setPatients(toArrayPayload<Patient>(patientPayload));
      } else {
        setPatients([]);
      }

      if (templatesRes.ok) {
        const templatePayload = (await templatesRes.json().catch(() => [])) as unknown;
        setStaffTemplates(toArrayPayload<StaffTemplate>(templatePayload));
      } else {
        setStaffTemplates([]);
      }

      if (appointmentsRes.ok) {
        const appointmentPayload = (await appointmentsRes.json().catch(() => [])) as unknown;
        const rows = toArrayPayload<Appointment>(appointmentPayload);
        const summary = rows.reduce(
          (acc, row) => {
            const status = (row.status || "").toLowerCase();
            if (status === "booked") acc.booked += 1;
            if (status === "cancelled") acc.cancelled += 1;
            if (status === "rescheduled") acc.rescheduled += 1;
            return acc;
          },
          { booked: 0, cancelled: 0, rescheduled: 0 },
        );
        setAppointmentSummary(summary);
      } else {
        setAppointmentSummary({ booked: 0, cancelled: 0, rescheduled: 0 });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function selectedTemplateRole(templateKey: string): string {
    if (!templateKey) return "staff";
    const template = staffTemplates.find((item) => item.template_key === templateKey);
    return mapTemplateRoleToBackendRole(template?.api_role);
  }

  async function addStaff() {
    if (!organizationId) return;
    setError(null);
    const role = selectedTemplateRole(staffForm.staff_template_key) || staffForm.role;
    const res = await fetch(`/api/org/organizations/${encodeURIComponent(organizationId)}/staff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: staffForm.full_name,
        email: staffForm.email,
        password: staffForm.password,
        role,
        staff_template_key: staffForm.staff_template_key,
        professional_title: staffForm.professional_title,
        license_number: staffForm.license_number,
      }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error || "Failed to register staff");
      return;
    }
    setStaffForm({
      full_name: "",
      email: "",
      password: "",
      role: "staff",
      active: true,
      professional_title: "",
      license_number: "",
      staff_template_key: "",
    });
    setEditingStaffId(null);
    await load();
  }

  async function updateStaff() {
    if (!organizationId || !editingStaffId) return;
    setError(null);
    const role = selectedTemplateRole(staffForm.staff_template_key) || staffForm.role;
    const res = await fetch(`/api/org/organizations/${encodeURIComponent(organizationId)}/staff/${encodeURIComponent(editingStaffId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: staffForm.full_name,
        role,
        active: staffForm.active,
        staff_template_key: staffForm.staff_template_key,
        professional_title: staffForm.professional_title,
        license_number: staffForm.license_number,
      }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error || "Failed to update staff");
      return;
    }

    setStaffForm({
      full_name: "",
      email: "",
      password: "",
      role: "staff",
      active: true,
      professional_title: "",
      license_number: "",
      staff_template_key: "",
    });
    setEditingStaffId(null);
    await load();
  }

  async function deleteStaff(id: string) {
    if (!organizationId) return;
    setError(null);
    const res = await fetch(`/api/org/organizations/${encodeURIComponent(organizationId)}/staff/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error || "Failed to delete staff");
      return;
    }
    if (editingStaffId === id) {
      setEditingStaffId(null);
    }
    await load();
  }

  function startEdit(member: StaffMember) {
    setEditingStaffId(member.id);
    setStaffForm({
      full_name: member.full_name,
      email: member.email,
      password: "",
      role: member.role,
      active: member.active ?? true,
      professional_title: member.professional_title || "",
      license_number: member.license_number || "",
      staff_template_key: member.staff_template_key || "",
    });
  }

  function cancelEdit() {
    setEditingStaffId(null);
    setStaffForm({
      full_name: "",
      email: "",
      password: "",
      role: "staff",
      active: true,
      professional_title: "",
      license_number: "",
      staff_template_key: "",
    });
  }

  return (
    <div className="mx-auto max-w-screen-2xl space-y-4 p-4 md:p-6">
      <header className="rounded-xl border border-border bg-card p-4">
        <h1 className="text-xl font-semibold">Organization Admin Control</h1>
        <p className="mt-1 text-sm text-muted-foreground">View superadmin configuration, manage staff based on provided templates, and monitor organization patients with appointments.</p>
      </header>

      <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2">
        <button onClick={() => setTab("configuration")} className={`rounded-lg px-3 py-2 text-sm ${tab === "configuration" ? "bg-primary text-primary-foreground" : "bg-background"}`}>
          Configured Services & Features
        </button>
        <button onClick={() => setTab("patients")} className={`rounded-lg px-3 py-2 text-sm ${tab === "patients" ? "bg-primary text-primary-foreground" : "bg-background"}`}>
          Patients
        </button>
      </div>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Staff Management</h2>
        <p className="mt-1 text-sm text-muted-foreground">Staff CRUD is now available in a dedicated workspace.</p>
        <Link href="/dashboard/staff-management" className="mt-3 inline-flex rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted">
          Open Staff Management
        </Link>
      </section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : null}

      {!loading && tab === "configuration" ? (
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-2 text-sm font-semibold">Service and Capacity (Configured by Superadmin)</h2>
          {!configuration ? (
            <p className="text-sm text-muted-foreground">No organization configuration available.</p>
          ) : (
            <div className="grid gap-3">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Tier</p>
                <p className="text-sm font-medium">{configuration.tier}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Enabled services</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {configuration.enabled_services.map((service) => (
                    <span key={service} className="rounded-full border border-border bg-background px-2 py-1 text-xs">
                      {service}
                    </span>
                  ))}
                  {configuration.enabled_services.length === 0 ? <p className="text-xs text-muted-foreground">No services configured.</p> : null}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Enabled features</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {(configuration.enabled_features || []).map((feature) => (
                    <span key={feature} className="rounded-full border border-border bg-background px-2 py-1 text-xs">
                      {feature}
                    </span>
                  ))}
                  {(configuration.enabled_features || []).length === 0 ? <p className="text-xs text-muted-foreground">No features configured.</p> : null}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Workflow rules</p>
                <div className="mt-1 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(configuration.workflow_rules || {}).map(([ruleKey, rule]) => (
                    <div key={ruleKey} className="rounded-lg border border-border bg-background px-2 py-1 text-xs">
                      {ruleKey}: {rule.enabled ? "enabled" : "disabled"} ({rule.severity || "flexible"})
                    </div>
                  ))}
                  {Object.keys(configuration.workflow_rules || {}).length === 0 ? <p className="text-xs text-muted-foreground">No workflow rules configured.</p> : null}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Communication</p>
                <div className="mt-1 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-lg border border-border bg-background px-2 py-1 text-xs">SMS provider: {configuration.communication?.smsProvider || "Not set"}</div>
                  <div className="rounded-lg border border-border bg-background px-2 py-1 text-xs">Email sender: {configuration.communication?.emailSender || "Not set"}</div>
                  <div className="rounded-lg border border-border bg-background px-2 py-1 text-xs">USSD gateway: {configuration.communication?.ussdGateway || "Not set"}</div>
                  <div className="rounded-lg border border-border bg-background px-2 py-1 text-xs">SMS notifications: {configuration.communication?.notifyBySms ? "on" : "off"}</div>
                  <div className="rounded-lg border border-border bg-background px-2 py-1 text-xs">Email notifications: {configuration.communication?.notifyByEmail ? "on" : "off"}</div>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Billing & claims</p>
                <div className="mt-1 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-lg border border-border bg-background px-2 py-1 text-xs">Billing: {configuration.billing?.enableBilling ? "enabled" : "disabled"}</div>
                  <div className="rounded-lg border border-border bg-background px-2 py-1 text-xs">Insurance: {configuration.billing?.enableInsurance ? "enabled" : "disabled"}</div>
                  <div className="rounded-lg border border-border bg-background px-2 py-1 text-xs">Pricing: {configuration.billing?.pricingModel || "Not set"}</div>
                  <div className="rounded-lg border border-border bg-background px-2 py-1 text-xs">Claim automation: {configuration.billing?.claimAutomation ? "enabled" : "disabled"}</div>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Minimum staff capacity</p>
                <div className="mt-1 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(configuration.min_staff).map(([role, count]) => (
                    <div key={role} className="rounded-lg border border-border bg-background px-2 py-1 text-xs">
                      {role}: {count}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Only superadmin can update these settings.</p>
            </div>
          )}
        </section>
      ) : null}

      {!loading && tab === "patients" ? (
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-2 text-sm font-semibold">Patients With Organization Appointments</h2>
          <div className="mb-3 grid gap-2 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs">
              <p className="text-muted-foreground">Booked</p>
              <p className="text-base font-semibold">{appointmentSummary.booked}</p>
            </div>
            <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs">
              <p className="text-muted-foreground">Cancelled</p>
              <p className="text-base font-semibold">{appointmentSummary.cancelled}</p>
            </div>
            <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs">
              <p className="text-muted-foreground">Rescheduled</p>
              <p className="text-base font-semibold">{appointmentSummary.rescheduled}</p>
            </div>
          </div>
          <div className="space-y-2">
            {patients.map((patient) => (
              <article key={patient.id} className="rounded-lg border border-border bg-background p-3 text-sm">
                <p className="font-medium">{patient.full_name}</p>
                <p className="text-xs text-muted-foreground">{patient.email} {patient.phone ? `| ${patient.phone}` : ""}</p>
                <p className="text-xs text-muted-foreground">Status: {patient.active ? "active" : "inactive"}</p>
              </article>
            ))}
            {patients.length === 0 ? <p className="text-sm text-muted-foreground">No appointment-linked patients found for this organization.</p> : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
