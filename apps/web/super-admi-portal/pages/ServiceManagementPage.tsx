import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch, getErrorMessage, readJson } from "@/lib/api";
import { MoreVertical } from "lucide-react";
import { CardShell } from "./common";
import { tierLabel } from "./config/catalog";

type OrganizationRow = {
  id: string;
  name: string;
  slug: string;
  tier: string;
  enabled_services?: string[];
  min_staff?: Record<string, number>;
};

type OrganizationConfiguration = {
  organization_id: string;
  organization_name: string;
  organization_slug: string;
  tier: string;
  installed_services: string[];
  enabled_services?: string[];
};

type TierRequirement = {
  tier: string;
  description?: string;
  min_staff?: Record<string, number>;
  default_services?: string[];
};

type ServiceDefinitionApi = {
  id: string;
  name: string;
  serviceType?: string;
  serviceCategory?: string;
  active?: boolean;
};

type TierDocKey = "tier-a" | "tier-b" | "tier-c" | "tier-d" | "tier-e";
type TierCategoryCatalog = { category: string; services: string[] };

const TIER_MAP_BY_BACKEND_TIER: Record<string, TierDocKey> = {
  "health-post": "tier-a",
  "health-center": "tier-b",
  "primary-hospital": "tier-c",
  "general-specialized-hospital": "tier-d",
  "national-health-system": "tier-e",
};

function resolveTierDocKey(tier: string): TierDocKey {
  return TIER_MAP_BY_BACKEND_TIER[tier] || "tier-b";
}

const BACKEND_TIER_BY_DOC_KEY: Record<TierDocKey, string> = {
  "tier-a": "health-post",
  "tier-b": "health-center",
  "tier-c": "primary-hospital",
  "tier-d": "general-specialized-hospital",
  "tier-e": "national-health-system",
};

const SERVICES_BY_TIER_CATALOG: Record<TierDocKey, TierCategoryCatalog[]> = {
  "tier-a": [
    { category: "Community Health Worker (HEW)", services: ["Patient Registration", "Encounter & Triage", "Condition Capture", "Referral Management", "Immunization", "MCH (ANC/PNC)", "Nutrition", "Emergency Detection", "Reporting", "Longitudinal Care", "Follow-Up Tracking", "Clinical Document Exchange", "Audit Logging", "Basic Treatment", "Disease Surveillance", "Family Planning", "Health Education", "Outreach"] },
    { category: "Triage Nurse (Light)", services: ["Advanced Triage", "MCH Monitoring", "Emergency Detection", "Referral Validation", "Follow-Up Tracking", "Audit Logging"] },
    { category: "Mobile Outreach Agent", services: ["Patient Registration", "Encounter Capture", "Immunization", "Outreach", "Offline Sync", "Audit Logging"] },
    { category: "Health Post Admin", services: ["Reporting", "User Management", "Service Config", "Referral Oversight", "Audit Monitoring", "Document Exchange Oversight"] },
    { category: "Patient (Self-Service)", services: ["Registration", "View Records", "Appointment Request", "Notifications", "Follow-Up Compliance", "Consent Management"] },
    { category: "AI Assistant", services: ["Triage Support", "MCH Risk Detection", "Data Entry Assist", "Follow-Up Prediction"] },
  ],
  "tier-b": [
    { category: "General Practitioner (GP)", services: ["OPD Consultation", "Condition Management", "Clinical Assessment", "Prescription Service", "Minor Procedures", "Referral Management", "Care Planning", "Longitudinal Care", "Follow-Up Management", "Medication Reconciliation", "Drug Interaction Check", "Clinical Document Exchange", "Audit Logging"] },
    { category: "Registered Nurse", services: ["Triage Service", "Medication Administration", "Follow-Up Monitoring", "Wound Care", "Follow-Up Tracking", "Patient Education", "Audit Logging"] },
    { category: "Lab Tech", services: ["Specimen Collection", "Lab Testing", "Result Reporting", "Sample Processing", "Result Validation", "Audit Logging"] },
    { category: "Pharmacist", services: ["Prescription Validation", "Medication Dispensing", "Medication Counseling", "Drug Interaction Check", "Inventory Tracking", "Audit Logging"] },
    { category: "Health Information Officer (HIO)", services: ["Record Management", "Data Quality Control", "Document Management", "Interoperability", "Audit Monitoring"] },
    { category: "Clinic Administrator", services: ["Patient Flow", "Appointment Scheduling", "Staff Management", "Reporting", "Billing", "Financial Reporting", "Audit Monitoring", "Referral Oversight"] },
    { category: "Patient", services: ["OPD Visit", "View Records", "Prescription Access", "Appointment Booking", "Follow-Up Compliance", "Consent Management"] },
    { category: "AI Clinical Assistant", services: ["Symptom Analysis", "Risk Scoring", "Prescription Draft", "Clinical Summary", "Follow-Up Prediction", "Decision Support"] },
  ],
  "tier-c": [
    { category: "Medical Officer (MO)", services: ["OPD Consultation", "Clinical Assessment", "Inpatient Admission", "Inpatient Management", "Emergency Stabilization", "Prescription Service", "Referral Management", "Minor Surgery", "Delivery Oversight", "Longitudinal Care", "Follow-Up Management", "Medication Reconciliation", "Drug Safety Check", "Clinical Document Exchange", "Audit Logging"] },
    { category: "Midwife", services: ["ANC Monitoring", "Labor Monitoring", "Delivery Management", "Postnatal Care", "Neonatal Stabilization", "Referral Escalation", "Follow-Up Tracking", "Risk Detection", "Audit Logging"] },
    { category: "Ward Nurse", services: ["Inpatient Monitoring", "Medication Administration", "Care Plan Execution", "Wound Care", "Patient Observation", "Follow-Up Tracking", "Infection Control Logging", "Audit Logging"] },
    { category: "Lab Tech", services: ["Specimen Collection", "Basic Lab Testing", "Diagnostic Reporting", "Sample Processing", "Result Validation", "Audit Logging"] },
    { category: "Radiology Tech", services: ["X-Ray Imaging", "Basic Ultrasound", "Image Reporting", "Audit Logging"] },
    { category: "Pharmacy Unit", services: ["Prescription Validation", "Dispensing", "Inventory Management", "Medication Administration Support", "Drug Interaction Check", "Audit Logging"] },
    { category: "Administrator", services: ["Bed Management", "Patient Flow", "Scheduling", "Reporting", "Staff Management", "Billing", "Financial Reporting", "Audit Monitoring", "Referral Tracking"] },
    { category: "Patient", services: ["OPD Visit", "Admission", "Delivery Service", "View Records", "Discharge Summary", "Follow-Up Compliance", "Consent Management"] },
    { category: "AI Clinical Assistant", services: ["Risk Monitoring", "Delivery Risk Scoring", "Clinical Suggestions", "Lab Interpretation", "Follow-Up Prediction", "Decision Support"] },
  ],
  "tier-d": [
    { category: "Attending Physician", services: ["Diagnosis", "OPD Consultation", "Inpatient Management", "Clinical Assessment", "Prescription Service", "Lab Ordering", "Imaging Ordering", "Care Planning", "Discharge Planning", "Referral Management", "Medication Reconciliation", "Drug Interaction Safety", "Longitudinal Care", "Audit Logging"] },
    { category: "General Surgeon", services: ["Surgical Assessment", "Surgery Execution", "Pre-op Planning", "Post-op Care", "Emergency Surgery", "Surgical Referral", "OR Scheduling", "Surgical Inventory", "Sterilization Workflow"] },
    { category: "Anesthesiologist", services: ["Pre-op Assessment", "Anesthesia Delivery", "Intra-op Monitoring", "Airway Management", "Drug Dose Control", "ICU Handoff"] },
    { category: "Emergency Physician", services: ["Triage", "Emergency Stabilization", "Trauma Care", "Admission Decision", "Emergency Surgery Referral", "Resuscitation Tracking", "Mass Casualty Handling"] },
    { category: "Ward Nurse", services: ["Vital Monitoring", "Medication Admin", "Care Execution", "Wound Care", "Patient Observation", "Infection Control", "Discharge Preparation", "Audit Logging"] },
    { category: "ICU Nurse", services: ["Continuous Monitoring", "Ventilator Management", "IV Infusion Control", "Emergency Response"] },
    { category: "Lab/Radiology/Pharmacy/Admin", services: ["Specimen Processing", "Data Upload", "Image Interpretation", "Report Validation", "OR Optimization (AI)", "ICU Monitoring (AI)"] },
  ],
  "tier-e": [
    { category: "Consultant", services: ["Complex Diagnosis", "Specialist Consultation", "Advanced Care Planning", "Multidisciplinary Care", "Procedure Approval", "Referral Acceptance", "Genetic Risk Stratification", "Oncology Protocols", "ICU Escalation Oversight", "Audit Clinical Governance"] },
    { category: "Super-Specialist Surgeon", services: ["Complex Surgery", "Transplant Surgery", "Surgical Planning", "Post-Op Management", "Emergency Surgery", "OR Command System", "Organ Allocation System", "Surgical Inventory Control"] },
    { category: "Intensivist", services: ["ICU Management", "Ventilator Control", "Hemodynamic Support", "Multi-organ Failure Care", "Code Blue Leadership", "ICU Bed Allocation", "Critical Risk Prediction"] },
    { category: "Specialized Roles - Resident", services: ["Draft Diagnosis", "Care Plan Drafting", "Order Requests", "Documentation"] },
    { category: "Specialized Roles - Intern", services: ["Data Entry", "Documentation", "Procedure Assistance"] },
    { category: "Specialized Roles - Specialized Nurse", services: ["Oncology Care", "Dialysis Operation", "Device Management"] },
    { category: "Specialized Roles - Lab Specialist", services: ["Genetic Testing", "Histopathology", "Advanced Diagnostics"] },
    { category: "Specialized Roles - Radiologist", services: ["CT/MRI Interpretation", "Angiography Analysis", "Interventional Guidance"] },
    { category: "Specialized Roles - Clinical Pharmacist", services: ["ICU Medication Control", "Oncology Drugs"] },
    { category: "Specialized Roles - Educator/Researcher", services: ["Teaching Rounds", "Skill Evaluation", "Clinical Trials", "Patient Enrollment", "Data Analysis"] },
    { category: "AI Advanced Assistant", services: ["ICU Risk Prediction", "Imaging Assistance", "Treatment Optimization", "Clinical Decision Support"] },
  ],
};

const TIER_DISPLAY_OPTIONS: Array<{ key: TierDocKey; label: string }> = [
  { key: "tier-a", label: "Community Health Post" },
  { key: "tier-b", label: "Clinic" },
  { key: "tier-c", label: "Primary Hospital" },
  { key: "tier-d", label: "Specialized Hospital" },
  { key: "tier-e", label: "Tertiary / Teaching / Research" },
];

function toArrayPayload<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: T[] }).data;
  }
  return [];
}

function defaultServicesForTier(tier: string): string[] {
  const tierKey = resolveTierDocKey(tier);
  const grouped = SERVICES_BY_TIER_CATALOG[tierKey] || [];
  return Array.from(new Set(grouped.flatMap((group) => group.services)));
}

function servicesForTierKey(tierKey: TierDocKey): string[] {
  const grouped = SERVICES_BY_TIER_CATALOG[tierKey] || [];
  return Array.from(new Set(grouped.flatMap((group) => group.services)));
}

function defaultServicesForBackendTier(
  backendTier: string,
  tierRequirementMap: Map<string, TierRequirement>,
  serviceNameByKey: Map<string, string>,
): string[] {
  const defaults = tierRequirementMap.get(backendTier)?.default_services || [];
  if (defaults.length === 0) return [];
  return defaults.map((service) => serviceNameByKey.get(service.toLowerCase()) || toLabel(service));
}

function toLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ServiceManagementPage() {
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationRow[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [configuration, setConfiguration] = useState<OrganizationConfiguration | null>(null);
  const [enabledServices, setEnabledServices] = useState<string[]>([]);
  const [catalogTier, setCatalogTier] = useState<TierDocKey>("tier-b");
  const [installedTier, setInstalledTier] = useState<TierDocKey | "all">("all");
  const [tierRequirements, setTierRequirements] = useState<TierRequirement[]>([]);
  const [serviceDefinitions, setServiceDefinitions] = useState<ServiceDefinitionApi[]>([]);

  const serviceNameByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const service of serviceDefinitions) {
      if (service.serviceType) {
        map.set(service.serviceType.toLowerCase(), service.name);
      }
      if (service.name) {
        map.set(service.name.toLowerCase(), service.name);
      }
    }
    return map;
  }, [serviceDefinitions]);

  const tierRequirementMap = useMemo(() => {
    const map = new Map<string, TierRequirement>();
    for (const requirement of tierRequirements) {
      if (requirement.tier) {
        map.set(requirement.tier, requirement);
      }
    }
    return map;
  }, [tierRequirements]);

  const selectedOrganization = useMemo(
    () => organizations.find((org) => org.id === selectedOrgId) || organizations[0] || null,
    [organizations, selectedOrgId],
  );

  const tierServices = useMemo(() => {
    const backendTier = BACKEND_TIER_BY_DOC_KEY[catalogTier];
    const tierDefaults = tierRequirementMap.get(backendTier)?.default_services || [];
    if (tierDefaults.length > 0) {
      return tierDefaults.map((service) => serviceNameByKey.get(service.toLowerCase()) || toLabel(service));
    }

    const grouped = SERVICES_BY_TIER_CATALOG[catalogTier] || [];
    return Array.from(new Set(grouped.flatMap((group) => group.services)));
  }, [catalogTier, serviceNameByKey, tierRequirementMap]);

  const tierServiceCategories = useMemo(() => {
    return [{ category: "Database Tier Services", services: tierServices }];
  }, [tierServices]);

  const visibleServices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tierServices.filter((service) => {
      if (!q) return true;
      return service.toLowerCase().includes(q);
    });
  }, [search, tierServices]);

  const visibleCategoryCatalog = useMemo(() => {
    const visibleSet = new Set(visibleServices);
    return tierServiceCategories
      .map((group) => ({
        ...group,
        services: group.services.filter((service) => visibleSet.has(service)),
      }))
      .filter((group) => group.services.length > 0);
  }, [tierServiceCategories, visibleServices]);

  const installedSet = useMemo(() => new Set(enabledServices), [enabledServices]);

  const installedServicesByTier = useMemo(() => {
    const byTier = {
      "tier-a": [] as string[],
      "tier-b": [] as string[],
      "tier-c": [] as string[],
      "tier-d": [] as string[],
      "tier-e": [] as string[],
    };

    TIER_DISPLAY_OPTIONS.forEach((option) => {
      const backendTier = BACKEND_TIER_BY_DOC_KEY[option.key];
      const tierDefaults = tierRequirementMap.get(backendTier)?.default_services || [];
      const normalizedInstalled = new Set(enabledServices.map((service) => service.toLowerCase()));
      const dbResolved = tierDefaults
        .map((service) => serviceNameByKey.get(service.toLowerCase()) || toLabel(service))
        .filter((service) => normalizedInstalled.has(service.toLowerCase()));

      byTier[option.key] = dbResolved.length > 0
        ? dbResolved
        : servicesForTierKey(option.key).filter((service) => installedSet.has(service));
    });

    return byTier;
  }, [enabledServices, installedSet, serviceNameByKey, tierRequirementMap]);

  const installedTierOptions = useMemo(
    () => TIER_DISPLAY_OPTIONS.filter((option) => installedServicesByTier[option.key].length > 0),
    [installedServicesByTier],
  );

  const visibleInstalledServices = useMemo(() => {
    if (installedTier === "all") {
      return enabledServices;
    }
    return installedServicesByTier[installedTier] || [];
  }, [enabledServices, installedServicesByTier, installedTier]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [orgRes, tiersRes, servicesRes] = await Promise.all([
        apiFetch(`/org/organizations/manage?search=${encodeURIComponent(search)}`, { token }),
        apiFetch(`/org/tiers`, { token }),
        apiFetch(`/services`, { token }),
      ]);

      if (!orgRes.ok) {
        throw new Error(await getErrorMessage(orgRes, "Failed to load organizations"));
      }

      const orgPayload = toArrayPayload<OrganizationRow>(await readJson<unknown>(orgRes));
      setOrganizations(orgPayload);

      if (tiersRes.ok) {
        const tiersPayload = toArrayPayload<TierRequirement>(await readJson<unknown>(tiersRes));
        setTierRequirements(tiersPayload);
      }

      if (servicesRes.ok) {
        const servicesPayload = toArrayPayload<ServiceDefinitionApi>(await readJson<unknown>(servicesRes));
        setServiceDefinitions(servicesPayload);
      }

      if (!selectedOrgId && orgPayload.length > 0) {
        setSelectedOrgId(orgPayload[0].id);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load service management data");
    } finally {
      setLoading(false);
    }
  }, [search, selectedOrgId, token]);

  const loadConfiguration = useCallback(async (orgId: string) => {
    if (!orgId) return;
    const res = await apiFetch(`/org/organizations/${encodeURIComponent(orgId)}/configuration`, { token });
    if (!res.ok) {
      setConfiguration(null);
      setEnabledServices([]);
      return;
    }
    const payload = await readJson<OrganizationConfiguration>(res);
    setConfiguration(payload);
    setEnabledServices(payload?.installed_services || payload?.enabled_services || []);
  }, [token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!selectedOrganization?.id) return;
    void loadConfiguration(selectedOrganization.id);
  }, [loadConfiguration, selectedOrganization?.id]);

  useEffect(() => {
    const orgTier = configuration?.tier || selectedOrganization?.tier;
    if (!orgTier) return;
    setCatalogTier(resolveTierDocKey(orgTier));
  }, [configuration?.tier, selectedOrganization?.tier]);

  useEffect(() => {
    if (installedTierOptions.length === 0) {
      setInstalledTier("all");
      return;
    }

    if (installedTier !== "all" && !installedTierOptions.some((option) => option.key === installedTier)) {
      setInstalledTier(installedTierOptions[0].key);
    }
  }, [installedTier, installedTierOptions]);

  async function saveInstallState(nextEnabledServices: string[]) {
    if (!selectedOrganization) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        tier: configuration?.tier || selectedOrganization.tier,
        enabled_services: nextEnabledServices,
      };
      const res = await apiFetch(`/org/organizations/${encodeURIComponent(selectedOrganization.id)}/configuration`, {
        token,
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(await getErrorMessage(res, "Failed to save service install state"));
      }
      const saved = await readJson<OrganizationConfiguration>(res);
      setConfiguration(saved);
      setEnabledServices(saved?.installed_services || saved?.enabled_services || nextEnabledServices);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save service install state");
    } finally {
      setSaving(false);
    }
  }

  function updateService(service: string, checked: boolean) {
    const next = checked ? Array.from(new Set([...enabledServices, service])) : enabledServices.filter((item) => item !== service);
    setEnabledServices(next);
    void saveInstallState(next);
  }

  if (loading && organizations.length === 0) {
    return (
      <CardShell title="Service Management" description="Loading service catalog and organization install state...">
        <p className="text-sm text-muted-foreground">Loading service catalog and organization install state...</p>
      </CardShell>
    );
  }

  return (
    <div className="space-y-4">
      <header className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">National Service Control</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Service Management & Organization Installation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pharmacy and telemedicine are managed in dedicated modules. This workspace handles the general national catalog and organization installation state.
        </p>
        <div className="mt-3">
          <Button size="sm" variant="outline" onClick={() => window.location.assign("/pharmacy")}>Open Pharmacy</Button>
        </div>
      </header>

      {error ? <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

      <section className="grid gap-3 md:grid-cols-4">
        <CardShell title="General services" description="Catalog entries shown here">
          <p className="text-2xl font-semibold">{tierServices.length}</p>
        </CardShell>
        <CardShell title="Organizations" description="Loaded from backend">
          <p className="text-2xl font-semibold">{organizations.length}</p>
        </CardShell>
        <CardShell title="Installed services" description="Selected organization">
          <p className="text-2xl font-semibold">{enabledServices.length}</p>
        </CardShell>
        <CardShell title="Tier template" description="Selected organization tier">
          <p className="text-2xl font-semibold">{TIER_DISPLAY_OPTIONS.find((option) => option.key === catalogTier)?.label || "-"}</p>
        </CardShell>
      </section>

      <Tabs defaultValue="catalog" className="space-y-4">
        <TabsList className="grid h-auto w-full grid-cols-3 gap-2 md:grid-cols-3">
          <TabsTrigger value="catalog">Catalog</TabsTrigger>
          <TabsTrigger value="install">Installed Lists</TabsTrigger>
          <TabsTrigger value="compliance">FHIR & Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search service, role, or FHIR resource" className="max-w-md" />
            <div className="flex flex-wrap gap-1 rounded-lg border border-border/70 p-1">
              {TIER_DISPLAY_OPTIONS.map((option) => (
                <Button
                  key={option.key}
                  size="sm"
                  variant={catalogTier === option.key ? "default" : "ghost"}
                  onClick={() => setCatalogTier(option.key)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            {saving ? <span className="self-center text-xs text-muted-foreground">Saving install state...</span> : null}
          </div>

          <CardShell
            title="Tier Service Catalog"
            description={`Tier-category services for ${TIER_DISPLAY_OPTIONS.find((option) => option.key === catalogTier)?.label || catalogTier}`}
          >
            <div className="space-y-4">
              {visibleCategoryCatalog.map((group) => (
                <div key={group.category} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{group.category}</p>
                  {group.services.map((service) => (
                    <div key={`${group.category}-${service}`} className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/70 p-3">
                      <p className="text-sm font-medium">{service}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={installedSet.has(service) ? "default" : "secondary"}>{installedSet.has(service) ? "Installed" : "Available"}</Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="outline" aria-label={`Actions for ${service}`}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem disabled={saving || installedSet.has(service)} onClick={() => updateService(service, true)}>
                              Install
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem disabled={saving || !installedSet.has(service)} onClick={() => updateService(service, false)}>
                              {installedSet.has(service) ? "Uninstall from Installed Lists" : "Remove Service"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {visibleCategoryCatalog.length === 0 ? <p className="text-sm text-muted-foreground">No services found for this tier/search.</p> : null}
            </div>
          </CardShell>
        </TabsContent>

        <TabsContent value="install" className="space-y-4">
          <CardShell title={selectedOrganization ? `${selectedOrganization.name} installed lists` : "Installed lists"} description="Installed services only">
            {!selectedOrganization ? (
              <p className="text-sm text-muted-foreground">No organization selected.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant={installedTier === "all" ? "default" : "outline"}
                    onClick={() => setInstalledTier("all")}
                  >
                    All Installed
                  </Button>
                  {installedTierOptions.map((option) => (
                    <Button
                      key={option.key}
                      size="sm"
                      variant={installedTier === option.key ? "default" : "outline"}
                      onClick={() => setInstalledTier(option.key)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  {visibleInstalledServices.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No installed services yet.</p>
                  ) : visibleInstalledServices.map((service) => (
                    <div key={service} className="flex items-start justify-between gap-3 rounded-lg border border-border/70 p-3">
                      <div>
                        <p className="text-sm font-medium">{service}</p>
                        <p className="text-xs text-muted-foreground">Installed for selected organization</p>
                      </div>
                      <Button size="sm" variant="outline" disabled={saving} onClick={() => updateService(service, false)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={saving || !selectedOrganization}
                    onClick={() => {
                      if (!selectedOrganization) return;
                      const dbDefaults = defaultServicesForBackendTier(selectedOrganization.tier, tierRequirementMap, serviceNameByKey);
                      void saveInstallState(dbDefaults.length > 0 ? dbDefaults : defaultServicesForTier(selectedOrganization.tier));
                    }}
                  >
                    Reset to tier defaults
                  </Button>
                  <Button variant="outline" disabled={saving} onClick={() => saveInstallState(enabledServices)}>
                    {saving ? "Saving..." : "Save install state"}
                  </Button>
                  <Badge variant="secondary">{enabledServices.length} active services</Badge>
                </div>
              </div>
            )}
          </CardShell>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <CardShell title="Tier Service Matrix" description="Services listed from selected tier doc and install status">
            <div className="space-y-2">
              {tierServices.map((service) => (
                <div key={service} className="flex items-center justify-between rounded-lg border border-border/70 p-3 text-sm">
                  <span>{service}</span>
                  <Badge variant={installedSet.has(service) ? "default" : "secondary"}>{installedSet.has(service) ? "Installed" : "Not installed"}</Badge>
                </div>
              ))}
            </div>
          </CardShell>
        </TabsContent>
      </Tabs>
    </div>
  );
}
