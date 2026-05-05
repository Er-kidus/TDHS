"use client";

import { useEffect, useMemo, useState } from "react";
import serviceMap from "@/data/service-map.json";

type OrganizationConfiguration = {
  organization_id: string;
  organization_name: string;
  organization_slug: string;
  tier: string;
  enabled_services: string[];
  min_staff: Record<string, number>;
  queue_enabled: boolean;
  feature_flags: Record<string, boolean>;
  workflow_rules: Record<string, { enabled?: boolean; severity?: "strict" | "flexible" }>;
  communication: Record<string, unknown>;
  billing: Record<string, unknown>;
};

type ServiceItem = {
  key: string;
  label: string;
  category: "Clinical" | "Diagnostics" | "Administration" | "Digital" | "Platform" | "General";
  fhir: string;
  role: string;
};

type ServiceCatalogRow = {
  name?: string;
  serviceType?: string;
  serviceCategory?: string;
  active?: boolean;
};

const SERVICE_ITEMS: ServiceItem[] = [
  { key: "outpatient_opd", label: "Outpatient (OPD)", category: "Clinical", fhir: "Encounter", role: "Doctor / Medical Officer" },
  { key: "emergency_care", label: "Emergency care", category: "Clinical", fhir: "Encounter / Observation", role: "Emergency Physician" },
  { key: "inpatient_admission", label: "Inpatient admission", category: "Clinical", fhir: "EpisodeOfCare", role: "Clinical Lead" },
  { key: "triage_services", label: "Triage services", category: "Clinical", fhir: "Observation / ServiceRequest", role: "Nurse" },
  { key: "chronic_follow_up", label: "Chronic follow-up care", category: "Clinical", fhir: "CarePlan", role: "Doctor / Nurse" },
  { key: "laboratory_services", label: "Laboratory services", category: "Diagnostics", fhir: "DiagnosticReport / Specimen", role: "Lab Technician" },
  { key: "imaging_services", label: "Imaging services", category: "Diagnostics", fhir: "ImagingStudy / DiagnosticReport", role: "Radiology" },
  { key: "vital_signs_monitoring", label: "Vital signs monitoring", category: "Diagnostics", fhir: "Observation", role: "Nurse" },
  { key: "patient_registration", label: "Patient registration", category: "Administration", fhir: "Patient / RelatedPerson", role: "Reception / Admin" },
  { key: "appointment_scheduling", label: "Appointment scheduling", category: "Administration", fhir: "Appointment", role: "Reception / Admin" },
  { key: "referral_management", label: "Referral management", category: "Administration", fhir: "ServiceRequest", role: "Clinician / Admin" },
  { key: "emr_access", label: "EMR access", category: "Digital", fhir: "Encounter / DocumentReference", role: "Clinical Staff" },
  { key: "patient_history_tracking", label: "Patient history tracking", category: "Digital", fhir: "Encounter / Condition", role: "Clinical Staff" },
  { key: "digital_prescriptions", label: "Digital prescriptions", category: "Digital", fhir: "MedicationRequest", role: "Doctor" },
  { key: "clinical_workflows_customization", label: "Clinical workflows customization", category: "Platform", fhir: "PlanDefinition / Task", role: "Super Admin" },
  { key: "ai_decision_support", label: "AI decision support", category: "Platform", fhir: "ClinicalImpression / Library", role: "Clinical Governance" },
  { key: "advanced_case_management", label: "Advanced case management", category: "Platform", fhir: "CarePlan / EpisodeOfCare", role: "Care Team" },
  { key: "research_data_module", label: "Research data module", category: "Platform", fhir: "ResearchStudy / Observation", role: "Research Governance" },
  { key: "cross_hospital_data_exchange", label: "Cross-hospital data exchange", category: "Platform", fhir: "Bundle / DocumentReference", role: "Integration Team" },
  { key: "full_compliance_audit_tracking", label: "Full compliance audit tracking", category: "Platform", fhir: "AuditEvent", role: "Compliance Officer" },
];

const CATEGORIES: Array<{ title: ServiceItem["category"]; description: string }> = [
  { title: "Clinical", description: "Direct care and longitudinal clinical workflows" },
  { title: "Diagnostics", description: "Observation, imaging, and result validation" },
  { title: "Administration", description: "Registration, scheduling, and referrals" },
  { title: "Digital", description: "EMR access, history, and prescription workflows" },
  { title: "Platform", description: "Governance, AI, research, and compliance" },
  { title: "General", description: "Additional services configured in the national catalog" },
];

function toArrayPayload<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: T[] }).data;
  }
  return [];
}

function defaultServicesForTier(tier?: string): string[] {
  if (tier === "health-post") {
    return ["outpatient_opd", "triage_services", "chronic_follow_up", "vital_signs_monitoring", "patient_registration", "appointment_scheduling", "emr_access", "patient_history_tracking"];
  }
  if (tier === "health-center") {
    return ["outpatient_opd", "emergency_care", "inpatient_admission", "triage_services", "chronic_follow_up", "laboratory_services", "vital_signs_monitoring", "patient_registration", "appointment_scheduling", "referral_management", "emr_access", "patient_history_tracking", "digital_prescriptions", "full_compliance_audit_tracking"];
  }
  if (tier === "primary-hospital") {
    return ["outpatient_opd", "emergency_care", "inpatient_admission", "triage_services", "chronic_follow_up", "laboratory_services", "imaging_services", "vital_signs_monitoring", "patient_registration", "appointment_scheduling", "referral_management", "emr_access", "patient_history_tracking", "digital_prescriptions", "clinical_workflows_customization", "advanced_case_management", "cross_hospital_data_exchange", "full_compliance_audit_tracking"];
  }
  return SERVICE_ITEMS.map((item) => item.key);
}

export default function ServiceControlPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [organizationSlug, setOrganizationSlug] = useState("");
  const [tier, setTier] = useState("");
  const [enabledServices, setEnabledServices] = useState<string[]>([]);
  const [queueEnabled, setQueueEnabled] = useState(true);
  const [serviceSearch, setServiceSearch] = useState("");
  const [catalogServices, setCatalogServices] = useState<ServiceCatalogRow[]>([]);

  const installedSet = useMemo(() => new Set(enabledServices), [enabledServices]);

  const mergedServices = useMemo(() => {
    const map = new Map<string, ServiceItem>();

    for (const item of SERVICE_ITEMS) {
      map.set(item.key, item);
    }

    for (const row of catalogServices) {
      if (row.active === false) continue;
      const key = (row.serviceType || "").trim();
      if (!key) continue;
      const existing = map.get(key);
      if (existing) {
        map.set(key, { ...existing, label: row.name || existing.label });
        continue;
      }

      const categoryRaw = (row.serviceCategory || "").toLowerCase();
      let category: ServiceItem["category"] = "General";
      if (categoryRaw.includes("diagnostic") || categoryRaw.includes("laboratory") || categoryRaw.includes("imaging")) category = "Diagnostics";
      else if (categoryRaw.includes("administr") || categoryRaw.includes("registr") || categoryRaw.includes("billing")) category = "Administration";
      else if (categoryRaw.includes("digital") || categoryRaw.includes("interoper") || categoryRaw.includes("data") || categoryRaw.includes("it")) category = "Digital";
      else if (categoryRaw.includes("system") || categoryRaw.includes("compliance") || categoryRaw.includes("govern")) category = "Platform";
      else if (categoryRaw.includes("clinical") || categoryRaw.includes("care") || categoryRaw.includes("surgical") || categoryRaw.includes("emergency")) category = "Clinical";

      map.set(key, {
        key,
        label: row.name || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        category,
        fhir: "Catalog-defined",
        role: "Configured by organization",
      });
    }

    return Array.from(map.values()).sort((a, b) => {
      if (a.category === b.category) return a.label.localeCompare(b.label);
      return a.category.localeCompare(b.category);
    });
  }, [catalogServices]);

  const visibleServices = useMemo(() => {
    const q = serviceSearch.trim().toLowerCase();
    return mergedServices.filter((service) => {
      if (!q) return true;
      return [service.label, service.key, service.fhir, service.role, service.category].join(" ").toLowerCase().includes(q);
    });
  }, [mergedServices, serviceSearch]);

  async function loadConfiguration(nextOrganizationId: string) {
    if (!nextOrganizationId) return;
    const res = await fetch(`/api/org/organizations/${encodeURIComponent(nextOrganizationId)}/configuration`, { cache: "no-store" });
    if (!res.ok) {
      throw new Error("Failed to load organization configuration");
    }
    const payload = (await res.json().catch(() => null)) as OrganizationConfiguration | null;
    if (!payload) {
      throw new Error("Organization configuration payload was empty");
    }
    setOrganizationName(payload.organization_name || organizationName);
    setOrganizationSlug(payload.organization_slug || organizationSlug);
    setTier(payload.tier || tier);
    setEnabledServices(payload.enabled_services || []);
    setQueueEnabled(payload.queue_enabled ?? true);
  }

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const meRes = await fetch("/api/org/me", { cache: "no-store" });
      if (!meRes.ok) {
        throw new Error("Failed to resolve organization identity");
      }
      const me = (await meRes.json().catch(() => ({}))) as { organization_id?: string };
      if (!me.organization_id) {
        throw new Error("Organization context is missing for this account");
      }
      setOrganizationId(me.organization_id);

      const [servicesRes] = await Promise.all([
        fetch("/api/org/services", { cache: "no-store" }),
        loadConfiguration(me.organization_id),
      ]);

      if (servicesRes.ok) {
        const servicePayload = (await servicesRes.json().catch(() => [])) as unknown;
        setCatalogServices(toArrayPayload<ServiceCatalogRow>(servicePayload));
      } else {
        setCatalogServices([]);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load service control data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function saveConfiguration(nextEnabledServices: string[]) {
    if (!organizationId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/org/organizations/${encodeURIComponent(organizationId)}/configuration`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: tier || "health-center",
          enabled_services: nextEnabledServices,
          min_staff: {},
          queue_enabled: queueEnabled,
          feature_flags: {},
          workflow_rules: {},
          communication: {},
          billing: {},
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to save organization configuration");
      }
      await loadConfiguration(organizationId);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save organization configuration");
    } finally {
      setSaving(false);
    }
  }

  function toggleService(key: string, checked: boolean) {
    const next = checked ? Array.from(new Set([...enabledServices, key])) : enabledServices.filter((item) => item !== key);
    setEnabledServices(next);
    void saveConfiguration(next);
  }

  function resetDefaults() {
    const defaults = defaultServicesForTier(tier);
    setEnabledServices(defaults);
    void saveConfiguration(defaults);
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-screen-2xl mx-auto">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Loading service control workspace...</p>
        </div>
      </div>
    );
  }

  const wiredEndpoints = serviceMap.wiring?.patient_portal_wired ?? [];
  const missingEndpoints = serviceMap.wiring?.patient_portal_missing ?? [];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-screen-2xl mx-auto">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h1 className="text-xl font-semibold">Service Control & Install</h1>
        <p className="text-sm text-muted-foreground">
          Manage the services installed for this organization. Pharmacy and telemedicine are maintained in their own workflows.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Org: {organizationName || organizationSlug || organizationId || "-"}</p>
      </div>

      {error ? <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Installed services</p>
          <p className="text-2xl font-semibold mt-1">{enabledServices.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Tier</p>
          <p className="text-2xl font-semibold mt-1">{tier || "Unknown"}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Queue enabled</p>
          <div className="mt-2">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={queueEnabled} onChange={(event) => setQueueEnabled(event.target.checked)} />
              <span>{queueEnabled ? "Enabled" : "Disabled"}</span>
            </label>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Static scan endpoints</p>
          <p className="text-2xl font-semibold mt-1">{wiredEndpoints.length + missingEndpoints.length}</p>
        </div>
      </div>

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <input
              value={serviceSearch}
              onChange={(event) => setServiceSearch(event.target.value)}
              placeholder="Search service, FHIR resource, or role"
              className="h-10 w-full max-w-md rounded-lg border border-border bg-background px-3 text-sm"
            />
            <button type="button" className="h-10 rounded-lg border border-border px-4 text-sm" onClick={resetDefaults} disabled={saving}>Reset to tier defaults</button>
            <button type="button" className="h-10 rounded-lg bg-primary px-4 text-sm text-primary-foreground" onClick={() => saveConfiguration(enabledServices)} disabled={saving}>{saving ? "Saving..." : "Save configuration"}</button>
          </div>

          {CATEGORIES.map((group) => {
            const rows = visibleServices.filter((service) => service.category === group.title);
            if (rows.length === 0) return null;
            return (
              <div key={group.title} className="rounded-xl border border-border/70 bg-card">
                <div className="border-b px-4 py-3">
                  <h3 className="text-sm font-semibold">{group.title}</h3>
                  <p className="text-xs text-muted-foreground">{group.description}</p>
                </div>
                <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
                  {rows.map((service) => (
                    <div key={service.key} className="rounded-xl border border-border/70 bg-background p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{service.label}</p>
                          <p className="text-xs text-muted-foreground">{service.key}</p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${installedSet.has(service.key) ? "bg-emerald-600/20 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                          {installedSet.has(service.key) ? "Installed" : "Off"}
                        </span>
                      </div>
                      <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                        <p><span className="font-medium text-foreground">FHIR:</span> {service.fhir}</p>
                        <p><span className="font-medium text-foreground">Role:</span> {service.role}</p>
                      </div>
                      <div className="mt-3 flex items-center justify-between rounded-lg border border-border/70 px-3 py-2">
                        <span className="text-xs">Enabled</span>
                        <input
                          type="checkbox"
                          aria-label={`Toggle ${service.label}`}
                          title={`Toggle ${service.label}`}
                          checked={installedSet.has(service.key)}
                          onChange={(event) => toggleService(service.key, event.target.checked)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h3 className="text-sm font-semibold">Selected organization</h3>
            <div className="mt-3 space-y-2 text-sm">
              <p><span className="text-muted-foreground">Name:</span> {organizationName || "-"}</p>
              <p><span className="text-muted-foreground">Slug:</span> {organizationSlug || "-"}</p>
              <p><span className="text-muted-foreground">Tier:</span> {tier || "-"}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h3 className="text-sm font-semibold">FHIR & compliance snapshot</h3>
            <div className="mt-3 space-y-3 text-sm">
              {mergedServices.slice(0, 6).map((service) => (
                <div key={service.key} className="rounded-lg border border-border/70 p-3">
                  <p className="font-medium">{service.label}</p>
                  <p className="text-xs text-muted-foreground">FHIR: {service.fhir}</p>
                  <p className="text-xs text-muted-foreground">Role: {service.role}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h3 className="text-sm font-semibold">Static API wiring</h3>
            <p className="text-xs text-muted-foreground mt-1">Generated from backend scan at {serviceMap.generated_at}</p>
            <div className="mt-3 text-xs text-muted-foreground space-y-1">
              <p>Wired endpoints: {wiredEndpoints.length}</p>
              <p>Missing endpoints: {missingEndpoints.length}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
