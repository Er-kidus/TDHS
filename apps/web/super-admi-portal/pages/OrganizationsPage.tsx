import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch, getErrorMessage, readJson } from "@/lib/api";
import { CardShell } from "./common";
import {
  billingDefaults,
  commDefaults,
  serviceCatalog,
  tierLabel,
  tierOrder,
  workflowDefaults,
} from "./config/catalog";
import {
  buildTierTemplate,
  deriveOrganizationStatus,
  normalizeTier,
  statusBadgeVariant,
} from "./config/helpers";
import type { RuleSeverity, Tier } from "./config/types";

type OrganizationApiRow = {
  id: string;
  tenant_id: string | null;
  name: string;
  slug: string;
  tier?: string;
  enabled_services?: string[];
  min_staff?: Record<string, number>;
  staff_count?: number;
  created_at: string;
  updated_at: string;
};

type OrgApplicationRow = {
  organization_slug: string;
  selected_staff_templates?: string[];
};

type TierRequirementRow = {
  tier: string;
  default_services?: string[];
};

type ServiceRow = {
  id: string;
  name: string;
  serviceType?: string;
  serviceCategory?: string;
  active?: boolean;
};

type ServiceManagementResponse = {
  organization_id: string;
  organization_name: string;
  organization_slug: string;
  tier?: string;
  installed_services?: string[];
};

type OrganizationsPageProps = {
  organizations?: OrganizationApiRow[];
  users?: Array<{ organization?: string }>;
  orgApplications?: OrgApplicationRow[];
  featureFlags?: Record<string, boolean>;
  setFeatureFlags?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  pushSystemAction?: (message: string) => void;
  toast?: (options: { title: string; description?: string; variant?: "default" | "destructive" }) => void;
};

export default function OrganizationsPage(props: OrganizationsPageProps) {
  const {
    organizations = [],
    users = [],
    orgApplications = [],
    featureFlags = {},
    setFeatureFlags = () => undefined,
    pushSystemAction = () => undefined,
    toast = () => undefined,
  } = props;
  const { token } = useAuth();

  const templatesBySlug = useMemo(() => {
    return new Map(orgApplications.map((row) => [row.organization_slug, row.selected_staff_templates || []]));
  }, [orgApplications]);

  const [activeTab, setActiveTab] = useState<"view" | "config">("view");
  const [search, setSearch] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState("");

  const [tierRequirements, setTierRequirements] = useState<TierRequirementRow[]>([]);
  const [serviceRows, setServiceRows] = useState<ServiceRow[]>([]);
  const [selectedTier, setSelectedTier] = useState<Tier>("health-center");
  const [servicesState, setServicesState] = useState<Record<string, boolean>>(buildTierTemplate("health-center") as Record<string, boolean>);
  const [workflowRules, setWorkflowRules] = useState(workflowDefaults);
  const [communication, setCommunication] = useState(commDefaults);
  const [billing, setBilling] = useState(billingDefaults);
  const [configLoading, setConfigLoading] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  const tierRequirementMap = useMemo(() => {
    const map = new Map<string, TierRequirementRow>();
    for (const row of tierRequirements) {
      map.set(row.tier, row);
    }
    return map;
  }, [tierRequirements]);

  const serviceTypeByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of serviceRows) {
      const normalizedName = row.name.trim().toLowerCase();
      if (row.serviceType?.trim()) {
        map.set(normalizedName, row.serviceType.trim().toLowerCase());
      }
    }
    return map;
  }, [serviceRows]);

  const effectiveServiceCatalog = useMemo(() => {
    const merged = new Map<string, { key: string; label: string; category: string }>();
    for (const service of serviceCatalog) {
      merged.set(service.key, { key: service.key, label: service.label, category: service.category });
    }
    for (const service of serviceRows) {
      if (service.active === false) continue;
      const key = (service.serviceType || service.name || "unknown").toLowerCase().replace(/\s+/g, "_");
      merged.set(key, {
        key,
        label: service.name,
        category: service.serviceCategory || merged.get(key)?.category || "General",
      });
    }
    return Array.from(merged.values());
  }, [serviceRows]);

  const servicesByCategory = useMemo(() => {
    return effectiveServiceCatalog.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push(service);
      return acc;
    }, {} as Record<string, Array<{ key: string; label: string; category: string }>>);
  }, [effectiveServiceCatalog]);

  const visibleOrganizations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return organizations;
    return organizations.filter((org) => {
      return (
        org.name.toLowerCase().includes(query) ||
        org.slug.toLowerCase().includes(query) ||
        String(org.tier || "").toLowerCase().includes(query)
      );
    });
  }, [organizations, search]);

  const selectedOrg = useMemo(() => {
    return organizations.find((org) => org.id === selectedOrgId) || organizations[0] || null;
  }, [organizations, selectedOrgId]);

  const enabledServicesCount = useMemo(() => Object.values(servicesState).filter(Boolean).length, [servicesState]);

  const warnings = useMemo(() => {
    const items: string[] = [];
    if (!servicesState.patient_registration) {
      items.push("Patient registration is disabled.");
    }
    if (!servicesState.emr_access) {
      items.push("EMR access is disabled.");
    }
    if (selectedTier !== "health-post" && !servicesState.emergency_care) {
      items.push("Emergency care is usually required above Health Post tier.");
    }
    if (!billing.enableBilling && servicesState.inpatient_admission) {
      items.push("Billing is disabled while inpatient admission is enabled.");
    }
    return items;
  }, [billing.enableBilling, selectedTier, servicesState]);

  const loadDynamicSources = useCallback(async () => {
    if (!token) return;
    try {
      const [tiersRes, servicesRes] = await Promise.all([
        apiFetch("/org/tiers", { token }),
        apiFetch("/services", { token }),
      ]);

      if (tiersRes.ok) {
        const payload = await readJson<unknown>(tiersRes);
        setTierRequirements(Array.isArray(payload) ? (payload as TierRequirementRow[]) : []);
      }

      if (servicesRes.ok) {
        const payload = await readJson<unknown>(servicesRes);
        setServiceRows(Array.isArray(payload) ? (payload as ServiceRow[]) : []);
      }
    } catch {
      // Keep fallback catalog defaults.
    }
  }, [token]);

  const loadOrganizationConfiguration = useCallback(async () => {
    if (!selectedOrg) return;
    const fallbackTier = normalizeTier(selectedOrg.tier);
    setConfigLoading(true);

    try {
      if (!token) {
        setSelectedTier(fallbackTier);
        setServicesState(buildTierTemplate(fallbackTier));
        return;
      }

      const response = await apiFetch(`/org/organizations/${encodeURIComponent(selectedOrg.id)}/configuration`, { token });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "Failed to load configuration"));
      }

      const payload = await readJson<ServiceManagementResponse>(response);
      const tier = normalizeTier(payload.tier || selectedOrg.tier);
      setSelectedTier(tier);

      const enabled = payload.installed_services || [];
      if (enabled.length === 0) {
        setServicesState(buildTierTemplate(tier));
      } else {
        const normalizedEnabled = new Set(enabled.map((item) => item.trim().toLowerCase()));
        const next = effectiveServiceCatalog.reduce((acc, service) => {
          const serviceKey = service.key.trim().toLowerCase();
          const serviceLabel = service.label.trim().toLowerCase();
          const resolvedType = serviceTypeByName.get(serviceLabel) || "";
          acc[service.key] =
            normalizedEnabled.has(serviceKey) ||
            normalizedEnabled.has(serviceLabel) ||
            (Boolean(resolvedType) && normalizedEnabled.has(resolvedType));
          return acc;
        }, {} as Record<string, boolean>);
        setServicesState(next);
      }
    } catch (error) {
      setSelectedTier(fallbackTier);
      setServicesState(buildTierTemplate(fallbackTier));
      toast({
        title: "Configuration load warning",
        description: error instanceof Error ? error.message : "Using tier defaults for this organization.",
        variant: "destructive",
      });
    } finally {
      setConfigLoading(false);
    }
  }, [effectiveServiceCatalog, selectedOrg, serviceTypeByName, toast, token]);

  useEffect(() => {
    void loadDynamicSources();
  }, [loadDynamicSources]);

  useEffect(() => {
    if (organizations.length === 0) {
      setSelectedOrgId("");
      return;
    }
    if (!selectedOrgId || !organizations.some((org) => org.id === selectedOrgId)) {
      setSelectedOrgId(organizations[0].id);
    }
  }, [organizations, selectedOrgId]);

  useEffect(() => {
    if (!selectedOrg) return;
    void loadOrganizationConfiguration();
  }, [loadOrganizationConfiguration, selectedOrg]);

  function applyTierTemplate(tier: Tier) {
    setSelectedTier(tier);
    const dynamicDefaults = tierRequirementMap.get(tier)?.default_services || [];
    if (dynamicDefaults.length > 0) {
      const normalizedDefaults = new Set(dynamicDefaults.map((item) => item.trim().toLowerCase()));
      const next = effectiveServiceCatalog.reduce((acc, service) => {
        const serviceKey = service.key.trim().toLowerCase();
        const serviceLabel = service.label.trim().toLowerCase();
        acc[service.key] = normalizedDefaults.has(serviceKey) || normalizedDefaults.has(serviceLabel);
        return acc;
      }, {} as Record<string, boolean>);
      setServicesState(next);
      return;
    }
    setServicesState(buildTierTemplate(tier));
  }

  async function saveConfiguration() {
    if (!selectedOrg || !token) return;
    setSavingConfig(true);
    try {
      const enabledServices = Object.entries(servicesState)
        .filter(([, enabled]) => Boolean(enabled))
        .map(([key]) => key);

      const response = await apiFetch(`/org/organizations/${encodeURIComponent(selectedOrg.id)}/configuration`, {
        token,
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: selectedTier,
          enabled_services: enabledServices,
          feature_flags: featureFlags,
          workflow_rules: workflowRules,
          communication,
          billing,
          min_staff: {},
          queue_enabled: true,
        }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "Failed to save configuration"));
      }

      pushSystemAction(`Saved configuration for ${selectedOrg.name}`);
      toast({ title: "Configuration saved", description: `${selectedOrg.name} was updated.` });
    } catch (error) {
      toast({ title: "Save failed", description: error instanceof Error ? error.message : "Unable to save configuration.", variant: "destructive" });
    } finally {
      setSavingConfig(false);
    }
  }

  function cloneFromOrganization() {
    const source = organizations.find((org) => org.id !== selectedOrg?.id);
    if (!source) return;
    const sourceTier = normalizeTier(source.tier);
    setSelectedTier(sourceTier);
    setServicesState(buildTierTemplate(sourceTier));
    pushSystemAction(`Cloned configuration template from ${source.name}`);
  }

  function exportConfiguration() {
    if (!selectedOrg) return;
    const payload = {
      organization: selectedOrg,
      tier: selectedTier,
      services: servicesState,
      workflowRules,
      featureFlags,
      communication,
      billing,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedOrg.name.replace(/\s+/g, "-").toLowerCase()}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalStaff = organizations.reduce((sum, org) => sum + (org.staff_count ?? users.filter((row) => row.organization === org.name).length), 0);
  const activeOrganizations = organizations.filter((org) => deriveOrganizationStatus("active") === "Active").length;

  return (
    <div className="space-y-4">
      <CardShell title="Organizations & Facilities" description="Multi-tenant management and staff assignments">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "view" | "config")} className="space-y-4">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-2 md:w-[360px]">
            <TabsTrigger value="view">View</TabsTrigger>
            <TabsTrigger value="config">Configuration Workspace</TabsTrigger>
          </TabsList>

          <TabsContent value="view" className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="rounded-xl border border-border/70 bg-card/50 p-3">
                <p className="text-xs text-muted-foreground">Organizations</p>
                <p className="text-xl font-semibold">{organizations.length}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-card/50 p-3">
                <p className="text-xs text-muted-foreground">Active Facilities</p>
                <p className="text-xl font-semibold">{activeOrganizations}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-card/50 p-3">
                <p className="text-xs text-muted-foreground">Total Staff</p>
                <p className="text-xl font-semibold">{totalStaff}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-card/50 p-3">
                <p className="text-xs text-muted-foreground">Configured Templates</p>
                <p className="text-xl font-semibold">{orgApplications.length}</p>
              </div>
            </div>

            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by organization, slug, or tier" />

            <div className="overflow-x-auto rounded-xl border border-border/70">
              <table className="min-w-[1180px] w-full text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Name</th>
                    <th className="px-3 py-2 text-left font-medium">Slug</th>
                    <th className="px-3 py-2 text-left font-medium">Tier</th>
                    <th className="px-3 py-2 text-left font-medium">Staff</th>
                    <th className="px-3 py-2 text-left font-medium">Enabled Services</th>
                    <th className="px-3 py-2 text-left font-medium">Template Assignment</th>
                    <th className="px-3 py-2 text-left font-medium">Status</th>
                    <th className="px-3 py-2 text-left font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleOrganizations.length === 0 ? (
                    <tr>
                      <td className="px-3 py-4 text-muted-foreground" colSpan={8}>
                        No registered organizations were returned from the backend.
                      </td>
                    </tr>
                  ) : null}
                  {visibleOrganizations.map((org) => {
                    const active = selectedOrg?.id === org.id;
                    const templates = templatesBySlug.get(org.slug) || [];
                    return (
                      <tr
                        key={org.id}
                        className={`border-t border-border/60 align-top hover:bg-muted/30 ${active ? "bg-primary/5" : ""}`}
                        onDoubleClick={() => {
                          setSelectedOrgId(org.id);
                          setActiveTab("config");
                        }}
                      >
                        <td className="px-3 py-3 font-medium">{org.name}</td>
                        <td className="px-3 py-3 text-xs text-muted-foreground">{org.slug}</td>
                        <td className="px-3 py-3 text-xs text-muted-foreground">{org.tier || "-"}</td>
                        <td className="px-3 py-3 text-xs text-muted-foreground">{org.staff_count ?? users.filter((row) => row.organization === org.name).length}</td>
                        <td className="px-3 py-3 text-xs text-muted-foreground">{(org.enabled_services || []).length}</td>
                        <td className="px-3 py-3 text-xs text-muted-foreground">{templates.length > 0 ? templates.join(", ") : "-"}</td>
                        <td className="px-3 py-3"><Badge variant={statusBadgeVariant(deriveOrganizationStatus("active"))}>Registered</Badge></td>
                        <td className="px-3 py-3 text-xs text-muted-foreground">{new Date(org.updated_at).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            {!selectedOrg ? (
              <p className="text-sm text-muted-foreground">Select an organization from the View tab and double-click it to configure.</p>
            ) : (
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3 space-y-3">
                  <CardShell title="Organizations" description="Double-click in View tab also opens this workspace.">
                    <div className="space-y-2">
                      {organizations.map((org) => {
                        const active = org.id === selectedOrg.id;
                        return (
                          <button
                            key={org.id}
                            type="button"
                            onClick={() => setSelectedOrgId(org.id)}
                            className={`w-full rounded-lg border p-2 text-left transition-colors ${active ? "border-primary bg-primary/5" : "hover:bg-muted/40"}`}
                          >
                            <p className="text-sm font-medium">{org.name}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge variant="secondary">{tierLabel[normalizeTier(org.tier)]}</Badge>
                              <Badge variant={statusBadgeVariant(deriveOrganizationStatus("active"))}>Active</Badge>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CardShell>
                </div>

                <div className="col-span-6 space-y-4">
                  <CardShell title="Configuration Workspace" description="Organization -> Tier -> Service toggles -> Rules">
                    <Tabs defaultValue="overview" className="space-y-4">
                      <TabsList className="grid h-auto w-full grid-cols-3 gap-2 md:grid-cols-7">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="services">Services</TabsTrigger>
                        <TabsTrigger value="staff">Staff Access</TabsTrigger>
                        <TabsTrigger value="rules">Workflow Rules</TabsTrigger>
                        <TabsTrigger value="flags">Feature Flags</TabsTrigger>
                        <TabsTrigger value="communication">Communication</TabsTrigger>
                        <TabsTrigger value="billing">Billing & Claims</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-3">
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <p className="text-sm font-medium">Organization Name</p>
                            <Input value={selectedOrg.name} readOnly />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Tier</p>
                            <select
                              aria-label="Organization tier"
                              title="Organization tier"
                              className="h-10 w-full rounded-md border px-3"
                              value={selectedTier}
                              onChange={(event) => applyTierTemplate(event.target.value as Tier)}
                            >
                              {tierOrder.map((tier) => (
                                <option key={tier} value={tier}>{tierLabel[tier]}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Region</p>
                            <Input value="Ethiopia" readOnly />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Location</p>
                            <Input value={selectedOrg.slug} readOnly />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => applyTierTemplate(selectedTier)}>Apply Tier Template</Button>
                          {configLoading ? <p className="self-center text-xs text-muted-foreground">Loading backend configuration...</p> : null}
                        </div>
                      </TabsContent>

                      <TabsContent value="services" className="space-y-4">
                        {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                          <div key={category} className="space-y-2">
                            <h4 className="text-sm font-semibold">{category}</h4>
                            <div className="grid gap-2 md:grid-cols-2">
                              {categoryServices.map((service) => (
                                <div key={service.key} className="flex items-center justify-between rounded-lg border p-3">
                                  <div>
                                    <p className="text-sm font-medium">{service.label}</p>
                                    <p className="text-xs text-muted-foreground">Active / Inactive for selected organization</p>
                                  </div>
                                  <Switch
                                    checked={servicesState[service.key]}
                                    onCheckedChange={(checked) => setServicesState((prev) => ({ ...prev, [service.key]: checked }))}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </TabsContent>

                      <TabsContent value="staff" className="space-y-3">
                        <div className="rounded-lg border p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">Enable Staff Management</p>
                              <p className="text-xs text-muted-foreground">Allow organization staff create, edit, and deactivate workflows.</p>
                            </div>
                            <Switch
                              checked={featureFlags.staff_management_enabled !== false}
                              onCheckedChange={(checked) => setFeatureFlags((prev) => ({ ...prev, staff_management_enabled: checked }))}
                            />
                          </div>
                        </div>

                        <div className="rounded-lg border p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">Enable Bulk Staff Add</p>
                              <p className="text-xs text-muted-foreground">Allow batch creation by template from the org portal.</p>
                            </div>
                            <Switch
                              checked={featureFlags.staff_bulk_add_enabled !== false}
                              onCheckedChange={(checked) => setFeatureFlags((prev) => ({ ...prev, staff_bulk_add_enabled: checked }))}
                            />
                          </div>
                        </div>

                        <div className="rounded-lg border p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">Enable CSV Staff Import</p>
                              <p className="text-xs text-muted-foreground">Allow CSV upload import for staff onboarding.</p>
                            </div>
                            <Switch
                              checked={featureFlags.staff_csv_import_enabled !== false}
                              onCheckedChange={(checked) => setFeatureFlags((prev) => ({ ...prev, staff_csv_import_enabled: checked }))}
                            />
                          </div>
                        </div>

                        <div className="rounded-lg border p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">Require Template Approval</p>
                              <p className="text-xs text-muted-foreground">Require approved staff templates before assignment.</p>
                            </div>
                            <Switch
                              checked={featureFlags.staff_require_template_approval !== false}
                              onCheckedChange={(checked) => setFeatureFlags((prev) => ({ ...prev, staff_require_template_approval: checked }))}
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="rules" className="space-y-3">
                        {[
                          { key: "triage_before_consult", title: "Require triage before doctor access" },
                          { key: "mandatory_icd_coding", title: "Require ICD coding" },
                          { key: "prescription_approval", title: "Enable prescription validation rules" },
                          { key: "emergency_bypass", title: "Emergency bypass rules" },
                        ].map((rule) => (
                          <div key={rule.key} className="rounded-lg border p-3">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{rule.title}</p>
                              <Switch
                                checked={workflowRules[rule.key].enabled}
                                onCheckedChange={(checked) => {
                                  setWorkflowRules((prev) => ({
                                    ...prev,
                                    [rule.key]: {
                                      ...prev[rule.key],
                                      enabled: checked,
                                    },
                                  }));
                                }}
                              />
                            </div>
                            <div className="mt-2">
                              <select
                                aria-label={`${rule.title} severity`}
                                title={`${rule.title} severity`}
                                className="h-9 rounded-md border px-2 text-xs"
                                value={workflowRules[rule.key].severity}
                                onChange={(event) => {
                                  const severity = event.target.value as RuleSeverity;
                                  setWorkflowRules((prev) => ({
                                    ...prev,
                                    [rule.key]: {
                                      ...prev[rule.key],
                                      severity,
                                    },
                                  }));
                                }}
                              >
                                <option value="strict">strict</option>
                                <option value="flexible">flexible</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </TabsContent>

                      <TabsContent value="flags" className="space-y-3">
                        {Object.entries(featureFlags).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between rounded-lg border p-3">
                            <p className="text-sm font-medium">{key}</p>
                            <Switch checked={Boolean(value)} onCheckedChange={(checked) => setFeatureFlags((prev) => ({ ...prev, [key]: checked }))} />
                          </div>
                        ))}
                      </TabsContent>

                      <TabsContent value="communication" className="space-y-3">
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <p className="text-sm font-medium">SMS Provider</p>
                            <Input value={communication.smsProvider} onChange={(event) => setCommunication((prev) => ({ ...prev, smsProvider: event.target.value }))} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Email Sender</p>
                            <Input value={communication.emailSender} onChange={(event) => setCommunication((prev) => ({ ...prev, emailSender: event.target.value }))} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">USSD Gateway</p>
                            <Input value={communication.ussdGateway} onChange={(event) => setCommunication((prev) => ({ ...prev, ussdGateway: event.target.value }))} />
                          </div>
                        </div>

                        <div className="grid gap-2 md:grid-cols-2">
                          <div className="flex items-center justify-between rounded-lg border p-3">
                            <p className="text-sm font-medium">SMS Notifications</p>
                            <Switch checked={communication.notifyBySms} onCheckedChange={(checked) => setCommunication((prev) => ({ ...prev, notifyBySms: checked }))} />
                          </div>
                          <div className="flex items-center justify-between rounded-lg border p-3">
                            <p className="text-sm font-medium">Email Notifications</p>
                            <Switch checked={communication.notifyByEmail} onCheckedChange={(checked) => setCommunication((prev) => ({ ...prev, notifyByEmail: checked }))} />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="billing" className="space-y-3">
                        <div className="grid gap-2 md:grid-cols-2">
                          <div className="flex items-center justify-between rounded-lg border p-3">
                            <p className="text-sm font-medium">Enable Billing</p>
                            <Switch checked={billing.enableBilling} onCheckedChange={(checked) => setBilling((prev) => ({ ...prev, enableBilling: checked }))} />
                          </div>
                          <div className="flex items-center justify-between rounded-lg border p-3">
                            <p className="text-sm font-medium">Enable Insurance</p>
                            <Switch checked={billing.enableInsurance} onCheckedChange={(checked) => setBilling((prev) => ({ ...prev, enableInsurance: checked }))} />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="mt-2">
                      <Button onClick={() => void saveConfiguration()} disabled={savingConfig || configLoading || !selectedOrg}>
                        {savingConfig ? "Saving..." : "Save Configuration"}
                      </Button>
                    </div>
                  </CardShell>
                </div>

                <div className="col-span-3 space-y-3">
                  <CardShell title="Configuration Status" description="Context-aware summary for selected organization">
                    <div className="space-y-2 text-sm">
                      <p><b>Tier:</b> {tierLabel[selectedTier]}</p>
                      <p><b>Services Enabled:</b> {enabledServicesCount}/{effectiveServiceCatalog.length}</p>
                      <p><b>Critical Modules Missing:</b> {warnings.length === 0 ? "None" : "Check warnings"}</p>
                    </div>
                  </CardShell>

                  <CardShell title="Warnings" description="Policy and consistency checks">
                    <div className="space-y-2 text-sm">
                      {warnings.length === 0 ? (
                        <p className="text-muted-foreground">No configuration warnings.</p>
                      ) : (
                        warnings.map((warning) => (
                          <p key={warning} className="rounded-md border border-amber-400/40 bg-amber-500/10 p-2 text-amber-900 dark:text-amber-200">{warning}</p>
                        ))
                      )}
                    </div>
                  </CardShell>

                  <CardShell title="Quick Actions" description="Fast configuration operations">
                    <div className="space-y-2">
                      <Button className="w-full" variant="outline" onClick={() => applyTierTemplate(selectedTier)}>Reset to Tier Defaults</Button>
                      <Button className="w-full" variant="outline" onClick={cloneFromOrganization}>Clone Config</Button>
                      <Button className="w-full" variant="outline" onClick={exportConfiguration}>Export Config</Button>
                    </div>
                  </CardShell>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardShell>
    </div>
  );
}
