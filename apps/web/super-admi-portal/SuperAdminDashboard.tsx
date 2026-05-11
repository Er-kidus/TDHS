import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  Building2,
  CheckCircle2,
  CreditCard,
  Database,
  FileClock,
  FlaskConical,
  Globe,
  LayoutDashboard,
  Lock,
  LogOut,
  Moon,
  Search,
  Server,
  Settings,
  Shield,
  ShieldAlert,
  Stethoscope,
  Sun,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetch, getErrorMessage, readJson } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import RbacPage from "./pages/RbacPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import OrganizationsPage from "./pages/OrganizationsPage";
import ConfigPage from "./pages/ConfigPage";
import SecurityPage from "./pages/SecurityPage";
import AuditPage from "./pages/AuditPage";
import ReportsPage from "./pages/ReportsPage";
import ServiceManagementPage from "./pages/ServiceManagementPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import MonitoringPage from "./pages/MonitoringPage";
import BillingPage from "./pages/BillingPage";
import DeveloperPage from "./pages/DeveloperPage";

type ModuleId =
  | "dashboard"
  | "users"
  | "rbac"
  | "applications"
  | "organizations"
  | "config"
  | "security"
  | "audit"
  | "reports"
  | "services"
  | "integrations"
  | "monitoring"
  | "billing"
  | "developer";

interface NavModule {
  id: ModuleId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut: string;
}

const modulePageComponents: Record<ModuleId, React.ComponentType<Record<string, unknown>>> = {
  dashboard: DashboardPage,
  users: UsersPage,
  rbac: RbacPage,
  applications: ApplicationsPage as unknown as React.ComponentType<Record<string, unknown>>,
  organizations: OrganizationsPage,
  config: ConfigPage,
  security: SecurityPage,
  audit: AuditPage,
  reports: ReportsPage,
  services: ServiceManagementPage,
  integrations: IntegrationsPage,
  monitoring: MonitoringPage,
  billing: BillingPage,
  developer: DeveloperPage,
};

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Org Admin" | "Doctor" | "Nurse" | "Staff" | "Patient";
  organization: string;
  status: "Active" | "Suspended" | "Locked";
  lastActive: string;
  createdAt: string;
}

interface AlertItem {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  details: string;
  time: string;
}

interface OrgApplicationApiRow {
  id: string;
  organization_name: string;
  organization_slug: string;
  organization_domain?: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  license_number: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  requested_services: string[];
  configured_services: string[];
  selected_staff_templates: string[];
  update_requested_services?: string[];
  update_request_notes?: string;
  update_request_status?: string;
  last_update_request_at?: string | null;
  domain_configured_at?: string | null;
  status: string;
  approved_by?: string;
  verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

interface OrgStaffTemplateApiRow {
  template_key: string;
  title: string;
  role_group: string;
  category: string;
  api_role: string;
  description: string;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface OrgUserApiRow {
  id: string;
  full_name: string;
  email: string;
  role: string;
  organization_name?: string;
  active: boolean;
  created_at: string;
}

interface PatientApiRow {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface OrganizationApiRow {
  id: string;
  tenant_id: string | null;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

interface ServiceDefinitionApiRow {
  id: string;
  name: string;
  serviceCategory?: string;
  serviceType?: string;
  active?: boolean;
}

interface TelemedicineArtifactApiRow {
  id: string;
  session_id: string;
  patient_id: string;
  doctor_id?: string | null;
  summary: string;
  final_diagnosis: string;
  symptoms: string[];
  follow_up_needed: boolean;
  created_at: string;
  updated_at: string;
}

interface AIModelApiRow {
  id: string;
  model_key: string;
  display_name: string;
  mode: string;
  status: string;
  version: string;
  dataset_ref: string;
  created_at: string;
  updated_at: string;
}

interface OrgSystemOverviewApi {
  total_users?: number;
  active_sessions?: number;
  role_counts?: Record<string, number>;
}

function toArrayPayload<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }
  if (payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: T[] }).data;
  }
  return [];
}

function mapUserRole(role: string): UserRow["role"] {
  const normalized = role.toLowerCase().trim();
  if (normalized === "superadmin") return "Super Admin";
  if (normalized === "admin") return "Org Admin";
  if (normalized === "doctor") return "Doctor";
  if (normalized === "nurse") return "Nurse";
  return "Staff";
}

function toApiRole(role: UserRow["role"]): "superadmin" | "admin" | "doctor" | "nurse" | "staff" {
  if (role === "Super Admin") return "superadmin";
  if (role === "Org Admin") return "admin";
  if (role === "Doctor") return "doctor";
  if (role === "Nurse") return "nurse";
  return "staff";
}

function formatTimeAgo(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  const diffMinutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

const modules: NavModule[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, shortcut: "G D" },
  { id: "users", label: "Users", icon: Users, shortcut: "G U" },
  { id: "rbac", label: "Roles & Permissions", icon: Shield, shortcut: "G R" },
  { id: "applications", label: "Onboarding Queue", icon: ShieldAlert, shortcut: "G N" },
  { id: "organizations", label: "Organizations / Facilities", icon: Building2, shortcut: "G O" },
  { id: "config", label: "System Configuration", icon: Settings, shortcut: "G C" },
  { id: "security", label: "Security", icon: Lock, shortcut: "G S" },
  { id: "audit", label: "Audit Logs", icon: FileClock, shortcut: "G A" },
  { id: "reports", label: "Reports & Analytics", icon: Activity, shortcut: "G P" },
  { id: "services", label: "Service Management", icon: Stethoscope, shortcut: "G M" },
  { id: "integrations", label: "Integrations", icon: Zap, shortcut: "G I" },
  { id: "monitoring", label: "Alerts & Monitoring", icon: Server, shortcut: "G L" },
  { id: "billing", label: "Billing / Subscriptions", icon: CreditCard, shortcut: "G B" },
  { id: "developer", label: "Developer Tools", icon: Wrench, shortcut: "G T" },
];

const SuperAdminDashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isOnboardingQueueRoute = location.pathname.startsWith("/super-admin/onboarding-queue");
  const onboardingDetailMatch = location.pathname.match(/^\/super-admin\/onboarding-queue\/([^/]+)$/);
  const onboardingApplicationIdFromRoute = onboardingDetailMatch ? decodeURIComponent(onboardingDetailMatch[1]) : "";

  const [activeModule, setActiveModule] = useState<ModuleId>(isOnboardingQueueRoute ? "applications" : "dashboard");
  const [darkMode, setDarkMode] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [orgRole, setOrgRole] = useState<string>("superadmin");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [patients, setPatients] = useState<PatientApiRow[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationApiRow[]>([]);
  const [serviceDefinitions, setServiceDefinitions] = useState<ServiceDefinitionApiRow[]>([]);
  const [teleArtifacts, setTeleArtifacts] = useState<TelemedicineArtifactApiRow[]>([]);
  const [aiModels, setAiModels] = useState<AIModelApiRow[]>([]);
  const [orgApplications, setOrgApplications] = useState<OrgApplicationApiRow[]>([]);
  const [staffRoleTemplates, setStaffRoleTemplates] = useState<OrgStaffTemplateApiRow[]>([]);
  const [systemOverview, setSystemOverview] = useState<OrgSystemOverviewApi | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<"All" | UserRow["role"]>("All");
  const [userPage, setUserPage] = useState(1);
  const [staffRoleSearch, setStaffRoleSearch] = useState("");
  const [staffRoleGroupFilter, setStaffRoleGroupFilter] = useState<string>("All");
  const [staffRoleCategoryFilter, setStaffRoleCategoryFilter] = useState<"All" | string>("All");
  const [selectedStaffRoleTemplate, setSelectedStaffRoleTemplate] = useState<string>("");
  const pageSize = 5;
  const [userActionBusy, setUserActionBusy] = useState(false);
  const [applicationSearch, setApplicationSearch] = useState("");
  const [selectedApplicationId, setSelectedApplicationId] = useState("");
  const [applicationServiceDraft, setApplicationServiceDraft] = useState("");
  const [applicationDomainDraft, setApplicationDomainDraft] = useState("");
  const [applicationUpdateServiceDraft, setApplicationUpdateServiceDraft] = useState("");
  const [applicationStaffTemplateDraft, setApplicationStaffTemplateDraft] = useState<string[]>([]);
  const [applicationActionBusy, setApplicationActionBusy] = useState(false);

  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const [impersonatedUser, setImpersonatedUser] = useState<UserRow | null>(null);
  const [showSensitiveDialog, setShowSensitiveDialog] = useState(false);
  const [sensitiveActionLabel, setSensitiveActionLabel] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [featureFlags, setFeatureFlags] = useState({
    aiTriage: true,
    auditExport: true,
    telemedicine: true,
    emergencyRouting: true,
    devSandbox: false,
    clinicalDecisionSupport: true,
    prescriptionValidation: true,
    referralEnforcement: true,
    admissionApproval: false,
    billingSystem: true,
    insuranceClaims: true,
    discountWaivers: true,
    pricingOverride: false,
    smsNotifications: true,
    ussdAccess: true,
    patientPortalAccess: true,
    crossHospitalExchange: true,
    researchDataModule: false,
    advancedCaseManagement: true,
  });

  const [permissionMatrix, setPermissionMatrix] = useState({
    superAdmin: { users: true, security: true, billing: true, integrations: true, reports: true },
    orgAdmin: { users: true, security: false, billing: true, integrations: false, reports: true },
    support: { users: true, security: false, billing: false, integrations: false, reports: true },
  });

  const [systemChangeLogs, setSystemChangeLogs] = useState<string[]>([]);

  const loadDashboardData = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      if (!options?.silent) {
        setIsLoading(true);
      }

      try {
        const [meResponse, usersResponse, patientsResponse, organizationsResponse, fallbackOrganizationsResponse, servicesResponse, artifactsResponse, modelsResponse, overviewResponse, applicationsResponse, templatesResponse] = await Promise.all([
          apiFetch("/org/me", { token }),
          apiFetch("/org/users?limit=200", { token }),
          apiFetch("/org/patients?limit=500", { token }),
          apiFetch("/org/organizations/manage?search=", { token }),
          apiFetch("/org/organizations", { token }),
          apiFetch("/services", { token }),
          apiFetch("/org/telemedicine/artifacts?limit=50", { token }),
          apiFetch("/org/ai/models", { token }),
          apiFetch("/org/system/overview", { token }),
          apiFetch("/org/applications", { token }),
          apiFetch("/org/staff-role-templates", { token }),
        ]);

        if (meResponse.ok) {
          const me = await readJson<{ role?: string }>(meResponse);
          setOrgRole((me?.role || "superadmin").toLowerCase());
        }

        if (usersResponse.ok) {
          const payload = await readJson<unknown>(usersResponse);
          setUsers(
            toArrayPayload<OrgUserApiRow>(payload).map((row) => ({
                  id: row.id,
                  name: row.full_name,
                  email: row.email,
                  role: mapUserRole(row.role),
                  organization: row.organization_name || "Default Organization",
                  status: row.active ? "Active" : "Locked",
                  lastActive: formatTimeAgo(row.created_at),
                  createdAt: row.created_at,
                })),
          );
        }

        if (patientsResponse.ok) {
          const payload = await readJson<unknown>(patientsResponse);
          setPatients(toArrayPayload<PatientApiRow>(payload));
        } else {
          setPatients([]);
        }

        if (organizationsResponse.ok) {
          const payload = await readJson<unknown>(organizationsResponse);
          setOrganizations(toArrayPayload<OrganizationApiRow>(payload));
        } else if (fallbackOrganizationsResponse.ok) {
          const payload = await readJson<unknown>(fallbackOrganizationsResponse);
          setOrganizations(toArrayPayload<OrganizationApiRow>(payload));
        } else {
          setOrganizations([]);
        }

        if (servicesResponse.ok) {
          const payload = await readJson<unknown>(servicesResponse);
          setServiceDefinitions(toArrayPayload<ServiceDefinitionApiRow>(payload));
        } else {
          setServiceDefinitions([]);
        }

        if (artifactsResponse.ok) {
          const payload = await readJson<unknown>(artifactsResponse);
          setTeleArtifacts(toArrayPayload<TelemedicineArtifactApiRow>(payload));
        }

        if (modelsResponse.ok) {
          const payload = await readJson<unknown>(modelsResponse);
          setAiModels(toArrayPayload<AIModelApiRow>(payload));
        }

        if (overviewResponse.ok) {
          const payload = await readJson<OrgSystemOverviewApi>(overviewResponse);
          setSystemOverview(payload || null);
        }

        if (applicationsResponse.ok) {
          const payload = await readJson<unknown>(applicationsResponse);
          setOrgApplications(toArrayPayload<OrgApplicationApiRow>(payload));
        }

        if (templatesResponse.ok) {
          const payload = await readJson<unknown>(templatesResponse);
          setStaffRoleTemplates(toArrayPayload<OrgStaffTemplateApiRow>(payload));
        }
      } catch (error) {
        toast({
          title: "Live data load failed",
          description: error instanceof Error ? error.message : "Unable to load dashboard data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [token, toast],
  );

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (isOnboardingQueueRoute) {
      setActiveModule("applications");
      return;
    }

    if (activeModule === "applications") {
      setActiveModule("dashboard");
    }
  }, [activeModule, isOnboardingQueueRoute]);

  const openModule = useCallback(
    (moduleId: ModuleId) => {
      if (moduleId === "applications") {
        navigate("/super-admin/onboarding-queue");
      } else {
        if (location.pathname !== "/super-admin") {
          navigate("/super-admin");
        }
        setActiveModule(moduleId);
      }
    },
    [location.pathname, navigate],
  );

  const usersFiltered = useMemo(() => {
    return users.filter((row) => {
      const matchesSearch =
        row.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        row.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        row.organization.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = userRoleFilter === "All" || row.role === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [userRoleFilter, userSearch, users]);

  const availableOrganizationNames = useMemo(() => {
    return organizations.map((organization) => ({ id: organization.id, name: organization.name }));
  }, [organizations]);

  const totalPages = Math.max(1, Math.ceil(usersFiltered.length / pageSize));

  useEffect(() => {
    if (userPage > totalPages) {
      setUserPage(1);
    }
  }, [userPage, totalPages]);

  const usersPaged = useMemo(() => {
    const start = (userPage - 1) * pageSize;
    return usersFiltered.slice(start, start + pageSize);
  }, [userPage, usersFiltered]);

  const userRoleCounts = useMemo(() => {
    return users.reduce(
      (acc, row) => {
        acc[row.role] = (acc[row.role] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [users]);

  const availableStaffTemplates = useMemo<OrgStaffTemplateApiRow[]>(() => {
    return staffRoleTemplates
      .filter((template) => template.active)
      .sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title));
  }, [staffRoleTemplates]);

  const filteredEmrRoles = useMemo(() => {
    return availableStaffTemplates
      .map((template) => ({
        id: template.template_key,
        title: template.title,
        category: template.category,
        group: template.role_group,
        apiRole: template.api_role,
      }))
      .filter((role) => {
      const query = staffRoleSearch.trim().toLowerCase();
      const bySearch =
        query.length === 0 ||
        role.title.toLowerCase().includes(query) ||
        role.category.toLowerCase().includes(query) ||
        role.group.toLowerCase().includes(query);
      const byGroup = staffRoleGroupFilter === "All" || role.group === staffRoleGroupFilter;
      const byCategory = staffRoleCategoryFilter === "All" || role.category === staffRoleCategoryFilter;
      return bySearch && byGroup && byCategory;
    });
  }, [availableStaffTemplates, staffRoleCategoryFilter, staffRoleGroupFilter, staffRoleSearch]);

  const selectedTemplate = useMemo(
    () => {
      const template = availableStaffTemplates.find((item) => item.template_key === selectedStaffRoleTemplate);
      if (!template) return null;
      return { id: template.template_key, title: template.title, apiRole: template.api_role };
    },
    [availableStaffTemplates, selectedStaffRoleTemplate],
  );

  const availableUserRoles = useMemo(() => {
    const roleSet = new Set<string>(["admin", "doctor", "nurse", "staff"]);
    for (const template of availableStaffTemplates) {
      if (template.api_role?.trim()) {
        roleSet.add(template.api_role.trim().toLowerCase());
      }
    }
    return Array.from(roleSet).sort((a, b) => a.localeCompare(b));
  }, [availableStaffTemplates]);

  const selectedApplication = useMemo(() => {
    const effectiveSelection = onboardingApplicationIdFromRoute || selectedApplicationId;
    if (!effectiveSelection) {
      return null;
    }

    return orgApplications.find((application) => application.id === effectiveSelection) || null;
  }, [onboardingApplicationIdFromRoute, orgApplications, selectedApplicationId]);

  useEffect(() => {
    if (selectedApplicationId && !orgApplications.some((application) => application.id === selectedApplicationId)) {
      setSelectedApplicationId("");
    }
  }, [orgApplications, selectedApplicationId]);

  useEffect(() => {
    if (onboardingApplicationIdFromRoute && onboardingApplicationIdFromRoute !== selectedApplicationId) {
      setSelectedApplicationId(onboardingApplicationIdFromRoute);
    }
  }, [onboardingApplicationIdFromRoute, selectedApplicationId]);

  useEffect(() => {
    if (!selectedApplication) {
      setApplicationServiceDraft("");
      setApplicationDomainDraft("");
      setApplicationUpdateServiceDraft("");
      setApplicationStaffTemplateDraft([]);
      return;
    }

    setApplicationServiceDraft(selectedApplication.configured_services.join(", "));
    setApplicationDomainDraft(selectedApplication.organization_domain || "");
    setApplicationUpdateServiceDraft((selectedApplication.update_requested_services || []).join(", "));
    setApplicationStaffTemplateDraft(selectedApplication.selected_staff_templates || []);
  }, [selectedApplication]);

  const userGrowth = useMemo(() => {
    const monthKeys = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      return date.toLocaleString([], { month: "short" });
    });

    const counts = new Map<string, number>();
    for (const row of users) {
      const month = new Date(row.createdAt).toLocaleString([], { month: "short" });
      counts.set(month, (counts.get(month) || 0) + 1);
    }

    return monthKeys.map((month) => ({ month, users: counts.get(month) || 0, orgs: counts.get(month) || 0 }));
  }, [users]);

  const systemActivity = useMemo(
    () => [
      { label: "Users", requests: users.length, failures: users.filter((row) => row.status !== "Active").length },
      { label: "Telemedicine", requests: teleArtifacts.length, failures: teleArtifacts.filter((row) => row.follow_up_needed).length },
      { label: "AI Models", requests: aiModels.length, failures: aiModels.filter((row) => row.status.toLowerCase() !== "active").length },
      { label: "Roles", requests: Object.keys(userRoleCounts).length, failures: 0 },
      { label: "Security", requests: users.filter((row) => row.status === "Active").length, failures: users.filter((row) => row.status === "Locked").length },
    ],
    [aiModels, teleArtifacts, userRoleCounts, users],
  );

  const recentEvents = useMemo(() => {
    const userEvents = users.slice(0, 3).map((row) => ({
      id: row.id,
      title: row.name,
      detail: `${row.role} account ${row.status.toLowerCase()}`,
      time: row.lastActive,
    }));
    const artifactEvents = teleArtifacts.slice(0, 2).map((row) => ({
      id: row.id,
      title: row.final_diagnosis || "Telemedicine artifact",
      detail: row.summary,
      time: formatTimeAgo(row.updated_at),
    }));
    return [...artifactEvents, ...userEvents].slice(0, 5);
  }, [teleArtifacts, users]);

  const liveAlerts = useMemo(() => {
    const nextAlerts: AlertItem[] = [];
    const inactiveModels = aiModels.filter((row) => row.status.toLowerCase() !== "active");
    if (inactiveModels.length) {
      nextAlerts.push({
        id: `model-${inactiveModels[0].id}`,
        severity: "warning",
        title: `${inactiveModels.length} AI model(s) are not active`,
        details: inactiveModels[0].display_name,
        time: formatTimeAgo(inactiveModels[0].updated_at),
      });
    }

    const followUps = teleArtifacts.filter((row) => row.follow_up_needed);
    if (followUps.length) {
      nextAlerts.push({
        id: `artifact-${followUps[0].id}`,
        severity: followUps.length > 2 ? "critical" : "info",
        title: `${followUps.length} telemedicine follow-up(s) need attention`,
        details: followUps[0].summary,
        time: formatTimeAgo(followUps[0].updated_at),
      });
    }

    return nextAlerts;
  }, [aiModels, teleArtifacts]);

  useEffect(() => {
    setAlerts(liveAlerts);
  }, [liveAlerts]);

  const pushSystemAction = useCallback((message: string) => {
    const now = new Date().toLocaleString();
    const entry = `${now} - ${message}`;
    setSystemChangeLogs((prev) => [entry, ...prev].slice(0, 20));
  }, []);

  const showDangerAction = (label: string) => {
    setSensitiveActionLabel(label);
    setPasswordConfirmation("");
    setShowSensitiveDialog(true);
  };

  const confirmSensitiveAction = () => {
    if (passwordConfirmation.trim().length < 4) {
      toast({
        title: "Confirmation failed",
        description: "Enter your admin password to continue this sensitive action.",
        variant: "destructive",
      });
      return;
    }

    pushSystemAction(`Sensitive action executed: ${sensitiveActionLabel}`);
    toast({
      title: "Action logged",
      description: `${sensitiveActionLabel} was completed and written to the audit trail.`,
    });
    setShowSensitiveDialog(false);
  };

  const handleImpersonate = (target: UserRow) => {
    setImpersonatedUser(target);
    pushSystemAction(`Impersonation started for ${target.email}`);
    toast({
      title: "Impersonation enabled",
      description: `You are now viewing as ${target.name}. All actions are logged.`,
    });
  };

  const stopImpersonation = () => {
    if (!impersonatedUser) return;
    pushSystemAction(`Impersonation ended for ${impersonatedUser.email}`);
    setImpersonatedUser(null);
    toast({
      title: "Impersonation stopped",
      description: "Returned to super admin identity.",
    });
  };

  const statusBadge = (status: UserRow["status"]) => {
    if (status === "Active") {
      return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">Active</Badge>;
    }
    if (status === "Suspended") {
      return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300">Suspended</Badge>;
    }
    return <Badge className="bg-red-500/15 text-red-700 dark:text-red-300">Locked</Badge>;
  };

  const severityBadge = (severity: AlertItem["severity"]) => {
    if (severity === "critical") {
      return <Badge variant="destructive">Critical</Badge>;
    }
    if (severity === "warning") {
      return <Badge className="bg-amber-500 text-amber-950">Warning</Badge>;
    }
    return <Badge variant="secondary">Info</Badge>;
  };

  const togglePermission = (role: keyof typeof permissionMatrix, key: keyof (typeof permissionMatrix)["superAdmin"]) => {
    setPermissionMatrix((prev) => {
      const next = {
        ...prev,
        [role]: {
          ...prev[role],
          [key]: !prev[role][key],
        },
      };
      pushSystemAction(`RBAC permission changed: ${role}.${String(key)}=${next[role][key]}`);
      return next;
    });
  };

  const callUserMutation = useCallback(
    async (
      path: string,
      init: RequestInit,
      options: { successTitle: string; successDescription: string; actionLog: string },
    ) => {
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Sign in again to perform this action.",
          variant: "destructive",
        });
        return false;
      }

      setUserActionBusy(true);
      try {
        const response = await apiFetch(path, {
          ...init,
          token,
          headers: {
            "Content-Type": "application/json",
            ...(init.headers || {}),
          },
        });

        if (!response.ok) {
          const message = await getErrorMessage(response);
          throw new Error(message);
        }

        pushSystemAction(options.actionLog);
        toast({
          title: options.successTitle,
          description: options.successDescription,
        });
        await loadDashboardData({ silent: true });
        return true;
      } catch (error) {
        toast({
          title: "Action failed",
          description: error instanceof Error ? error.message : "Unable to complete this user management action.",
          variant: "destructive",
        });
        return false;
      } finally {
        setUserActionBusy(false);
      }
    },
    [loadDashboardData, pushSystemAction, toast, token],
  );

  const handleCreateUser = async (payload?: { fullName: string; email: string; role: string; password: string; organizationId?: string }) => {
    let fullName = payload?.fullName || "";
    let email = payload?.email || "";
    let role = payload?.role?.trim().toLowerCase() || "";
    let password = payload?.password || "";
    let organizationId = payload?.organizationId || "";

    if (!payload) {
      const promptedName = window.prompt(
        selectedTemplate ? `Enter full name for ${selectedTemplate.title}` : "Enter full name",
      );
      if (!promptedName) return;
      fullName = promptedName;

      const promptedEmail = window.prompt("Enter email address");
      if (!promptedEmail) return;
      email = promptedEmail;

      const defaultRole = selectedTemplate?.apiRole || "staff";
      const roleInput = window.prompt("Role: admin, doctor, nurse, or staff", defaultRole);
      if (!roleInput) return;
      role = roleInput.trim().toLowerCase();

      const promptedPassword = window.prompt("Set temporary password", "Temp123!");
      if (!promptedPassword) return;
      password = promptedPassword;
    }

    if (!fullName.trim() || !email.trim() || !password) {
      toast({
        title: "Invalid input",
        description: "Full name, email and password are required.",
        variant: "destructive",
      });
      return;
    }

    if (!role) {
      role = "staff";
    }

    const normalizedRole = role.toLowerCase();
    const canUseOrgStaffEndpoint = ["admin", "doctor", "nurse", "staff", "reception", "pharmacist", "lab"].includes(normalizedRole);

    if (!canUseOrgStaffEndpoint && !["admin", "doctor", "nurse", "staff"].includes(normalizedRole)) {
      toast({
        title: "Invalid role",
        description: "Select a valid role for this user.",
        variant: "destructive",
      });
      return;
    }

    if (!organizationId && organizations.length > 0) {
      organizationId = organizations[0].id;
    }

    const targetPath = organizationId && canUseOrgStaffEndpoint
      ? `/org/organizations/${encodeURIComponent(organizationId)}/staff`
      : "/org/users";

    const targetBody = organizationId && canUseOrgStaffEndpoint
      ? {
          full_name: fullName.trim(),
          email: email.trim(),
          password,
          role: normalizedRole,
        }
      : {
          full_name: fullName.trim(),
          email: email.trim(),
          password,
          role: normalizedRole,
        };

    await callUserMutation(
      targetPath,
      {
        method: "POST",
        body: JSON.stringify(targetBody),
      },
      {
        successTitle: "User created",
        successDescription: `${fullName.trim()} has been added successfully${selectedTemplate ? ` as ${selectedTemplate.title}` : ""}.`,
        actionLog: `Created user ${email.trim()} as ${normalizedRole}${organizationId ? ` in organization ${organizationId}` : ""}${selectedTemplate ? ` using template ${selectedTemplate.title}` : ""}`,
      },
    );
  };

  const handleEditUser = async (row: UserRow, payload?: { fullName: string; email: string }) => {
    let nextName = payload?.fullName?.trim() || "";
    let nextEmail = payload?.email?.trim() || "";

    if (!payload) {
      const fullName = window.prompt("Edit full name", row.name);
      if (fullName === null) return;
      const email = window.prompt("Edit email", row.email);
      if (email === null) return;
      nextName = fullName.trim();
      nextEmail = email.trim();
    }

    if (nextName.length === 0 || nextEmail.length === 0) {
      toast({
        title: "Invalid input",
        description: "Full name and email cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (nextName === row.name && nextEmail === row.email) {
      toast({
        title: "No changes detected",
        description: "User details are unchanged.",
      });
      return;
    }

    await callUserMutation(
      `/org/users/${encodeURIComponent(row.id)}`,
      {
        method: "PUT",
        body: JSON.stringify({
          full_name: nextName,
          email: nextEmail,
        }),
      },
      {
        successTitle: "User updated",
        successDescription: `${nextName} was updated successfully.`,
        actionLog: `Updated user ${row.email}`,
      },
    );
  };

  const handleAssignRole = async (row: UserRow, roleInput?: string) => {
    let role = roleInput?.trim().toLowerCase() || "";
    if (!roleInput) {
      const promptedRole = window.prompt(
        "Set role: admin, doctor, nurse, or staff",
        toApiRole(row.role),
      );
      if (!promptedRole) return;
      role = promptedRole.trim().toLowerCase();
    }

    if (!["admin", "doctor", "nurse", "staff"].includes(role)) {
      toast({
        title: "Invalid role",
        description: "Role must be one of admin, doctor, nurse, staff.",
        variant: "destructive",
      });
      return;
    }

    await callUserMutation(
      `/org/users/${encodeURIComponent(row.id)}/role`,
      {
        method: "PUT",
        body: JSON.stringify({ role }),
      },
      {
        successTitle: "Role updated",
        successDescription: `${row.name} is now ${role}.`,
        actionLog: `Changed role for ${row.email} to ${role}`,
      },
    );
  };

  const handleForceReset = async (row: UserRow, passwordInput?: string) => {
    let password = passwordInput || "";
    if (!passwordInput) {
      const promptedPassword = window.prompt("Set temporary password", "Reset123!");
      if (!promptedPassword) return;
      password = promptedPassword;
    }

    if (!password.trim()) {
      toast({
        title: "Invalid password",
        description: "Password is required.",
        variant: "destructive",
      });
      return;
    }

    await callUserMutation(
      `/org/users/${encodeURIComponent(row.id)}/reset-password`,
      {
        method: "POST",
        body: JSON.stringify({ password }),
      },
      {
        successTitle: "Password reset",
        successDescription: `${row.name} must use the new temporary password.`,
        actionLog: `Forced password reset for ${row.email}`,
      },
    );
  };

  const handleLockUnlock = async (row: UserRow, actionInput?: "lock" | "unlock") => {
    const action = actionInput || (row.status === "Active" ? "lock" : "unlock");
    const verb = action === "lock" ? "lock" : "unlock";

    await callUserMutation(
      `/org/users/${encodeURIComponent(row.id)}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ action }),
      },
      {
        successTitle: action === "lock" ? "Account locked" : "Account unlocked",
        successDescription: `${row.name} account status updated.`,
        actionLog: `${verb} account ${row.email}`,
      },
    );
  };

  const handleDeactivate = async (row: UserRow) => {

    await callUserMutation(
      `/org/users/${encodeURIComponent(row.id)}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ action: "deactivate" }),
      },
      {
        successTitle: "Account deactivated",
        successDescription: `${row.name} has been deactivated.`,
        actionLog: `Deactivated account ${row.email}`,
      },
    );
  };

  const parseDelimitedList = (value: string) => {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  const callOrgApplicationMutation = useCallback(
    async (
      path: string,
      body: Record<string, unknown>,
      options: { successTitle: string; successDescription: string; actionLog: string },
    ) => {
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Sign in again to perform this action.",
          variant: "destructive",
        });
        return false;
      }

      setApplicationActionBusy(true);
      try {
        const response = await apiFetch(path, {
          method: "PATCH",
          body: JSON.stringify(body),
          token,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(await getErrorMessage(response));
        }

        pushSystemAction(options.actionLog);
        toast({
          title: options.successTitle,
          description: options.successDescription,
        });
        await loadDashboardData({ silent: true });
        return true;
      } catch (error) {
        toast({
          title: "Application action failed",
          description: error instanceof Error ? error.message : "Unable to update the organization application.",
          variant: "destructive",
        });
        return false;
      } finally {
        setApplicationActionBusy(false);
      }
    },
    [loadDashboardData, pushSystemAction, toast, token],
  );

  const handleApproveApplication = async () => {
    if (!selectedApplication) return;

    await callOrgApplicationMutation(
      `/org/applications/${encodeURIComponent(selectedApplication.id)}/approve`,
      {},
      {
        successTitle: "Application approved",
        successDescription: `${selectedApplication.organization_name} moved to approved status.`,
        actionLog: `Approved organization application ${selectedApplication.organization_slug}`,
      },
    );
  };

  const handleRejectApplication = async () => {
    if (!selectedApplication) return;

    await callOrgApplicationMutation(
      `/org/applications/${encodeURIComponent(selectedApplication.id)}/reject`,
      {},
      {
        successTitle: "Application rejected",
        successDescription: `${selectedApplication.organization_name} can update details and resend for approval.`,
        actionLog: `Rejected organization application ${selectedApplication.organization_slug}`,
      },
    );
  };

  const handleSaveApplicationServices = async () => {
    if (!selectedApplication) return;

    await callOrgApplicationMutation(
      `/org/applications/${encodeURIComponent(selectedApplication.id)}/services`,
      { services: parseDelimitedList(applicationServiceDraft) },
      {
        successTitle: "Services configured",
        successDescription: `${selectedApplication.organization_name} service access updated.`,
        actionLog: `Configured services for ${selectedApplication.organization_slug}`,
      },
    );
  };

  const handleSaveApplicationStaffTemplates = async () => {
    if (!selectedApplication) return;

    await callOrgApplicationMutation(
      `/org/applications/${encodeURIComponent(selectedApplication.id)}/staff-configurations`,
      { staff_templates: applicationStaffTemplateDraft },
      {
        successTitle: "Staff configuration saved",
        successDescription: `${selectedApplication.organization_name} staff templates updated.`,
        actionLog: `Updated staff templates for ${selectedApplication.organization_slug}`,
      },
    );
  };

  const handleSaveApplicationDomain = async () => {
    if (!selectedApplication) return;

    await callOrgApplicationMutation(
      `/org/applications/${encodeURIComponent(selectedApplication.id)}/domain`,
      { domain: applicationDomainDraft.trim() },
      {
        successTitle: "Domain configured",
        successDescription: `${selectedApplication.organization_name} domain access has been configured.`,
        actionLog: `Configured domain for ${selectedApplication.organization_slug}`,
      },
    );
  };

  const handleApproveUpdateRequest = async () => {
    if (!selectedApplication) return;

    await callOrgApplicationMutation(
      `/org/applications/${encodeURIComponent(selectedApplication.id)}/resolve-update`,
      { approve: true, services: parseDelimitedList(applicationUpdateServiceDraft) },
      {
        successTitle: "Update request approved",
        successDescription: `${selectedApplication.organization_name} requested services have been applied.`,
        actionLog: `Approved update request for ${selectedApplication.organization_slug}`,
      },
    );
  };

  const handleRejectUpdateRequest = async () => {
    if (!selectedApplication) return;

    await callOrgApplicationMutation(
      `/org/applications/${encodeURIComponent(selectedApplication.id)}/resolve-update`,
      { approve: false },
      {
        successTitle: "Update request rejected",
        successDescription: `${selectedApplication.organization_name} update request was rejected.`,
        actionLog: `Rejected update request for ${selectedApplication.organization_slug}`,
      },
    );
  };

  const handleCreateCatalogService = async (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast({ title: "Service name required", description: "Enter a valid service name.", variant: "destructive" });
      return false;
    }

    if (!token) {
      toast({ title: "Authentication required", description: "Sign in again to add services.", variant: "destructive" });
      return false;
    }

    setApplicationActionBusy(true);
    try {
      const response = await apiFetch("/services", {
        method: "POST",
        token,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          description: `Catalog service added from onboarding queue: ${trimmedName}`,
          serviceCategory: "clinical",
          serviceType: "general",
          active: true,
          duration_minutes: 20,
          buffer_before_minutes: 0,
          buffer_after_minutes: 0,
          requires_appointment: false,
          allows_walkin: true,
          requires_checkin: false,
          supports_recurrence: false,
          allowed_patterns: "[]",
          max_occurrences: 1,
        }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      toast({ title: "Service added", description: `${trimmedName} is now available for installation.` });
      await loadDashboardData({ silent: true });
      return true;
    } catch (error) {
      toast({
        title: "Unable to add service",
        description: error instanceof Error ? error.message : "Service creation failed.",
        variant: "destructive",
      });
      return false;
    } finally {
      setApplicationActionBusy(false);
    }
  };

  const toggleApplicationStaffTemplate = (templateKey: string) => {
    setApplicationStaffTemplateDraft((current) =>
      current.includes(templateKey) ? current.filter((item) => item !== templateKey) : [...current, templateKey],
    );
  };

  const openOnboardingApplication = useCallback(
    (applicationId: string) => {
      const id = encodeURIComponent(applicationId);
      setSelectedApplicationId(applicationId);
      navigate(`/super-admin/onboarding-queue/${id}`);
    },
    [navigate],
  );

  const LoadingState = () => (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-72 w-full rounded-xl" />
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 text-foreground dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {impersonatedUser && (
        <div className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-amber-300/40 bg-amber-400/20 px-4 py-2 text-sm backdrop-blur">
          <p className="font-medium text-amber-900 dark:text-amber-200">
            Impersonation mode active: You are viewing as {impersonatedUser.name}. All actions are audited.
          </p>
          <Button size="sm" variant="destructive" onClick={stopImpersonation}>
            Stop Impersonation
          </Button>
        </div>
      )}

      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <SuperAdminSidebar activeModule={activeModule} onModuleSelect={openModule} />

          <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl">
            <div className="flex h-16 items-center gap-3 px-3 md:px-5">
              <SidebarTrigger className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted" />

              <div className="hidden h-10 flex-1 items-center gap-2 rounded-lg border border-border bg-card/70 px-3 text-sm text-muted-foreground md:flex md:max-w-xl">
                <Search className="h-4 w-4" />
                <span>Global search: users, logs, configs...</span>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setDarkMode((prev) => !prev)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted" aria-label="Notifications">
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                </button>
                <div className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 sm:flex">
                  <div className="h-8 w-8 rounded-full bg-primary/15" />
                  <div className="leading-tight">
                    <p className="text-sm font-medium">{user?.name || "Super Admin"}</p>
                    <p className="text-xs text-muted-foreground">{user?.email || "superadmin@tenadam.health"}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-3 pb-5 pt-4 md:px-5 md:pt-5">
            <div className="animate-fade-up rounded-2xl border border-border/70 bg-card/70 p-4 shadow-md backdrop-blur md:p-6">
              {isLoading ? (
                <LoadingState />
              ) : (
                React.createElement(modulePageComponents[activeModule], {
                  users,
                  userRoleCounts,
                  orgRole,
                  teleArtifacts,
                  aiModels,
                  systemOverview,
                  userGrowth,
                  systemActivity,
                  recentEvents,
                  alerts,
                  orgApplications,
                  featureFlags,
                  setFeatureFlags,
                  pushSystemAction,
                  toast,
                  patients,
                  organizations,
                  serviceDefinitions,
                  availableUserRoles,
                  availableOrganizationNames,
                  availableStaffTemplates,
                  selectedApplication,
                  applicationRouteId: onboardingApplicationIdFromRoute,
                  applicationSearch,
                  setApplicationSearch,
                  applicationActionBusy,
                  setSelectedApplicationId,
                  openOnboardingApplication,
                  handleApproveApplication,
                  handleRejectApplication,
                  applicationServiceDraft,
                  setApplicationServiceDraft,
                  applicationDomainDraft,
                  setApplicationDomainDraft,
                  applicationUpdateServiceDraft,
                  setApplicationUpdateServiceDraft,
                  handleSaveApplicationServices,
                  handleCreateCatalogService,
                  handleSaveApplicationDomain,
                  handleApproveUpdateRequest,
                  handleRejectUpdateRequest,
                  handleSaveApplicationStaffTemplates,
                  applicationStaffTemplateDraft,
                  toggleApplicationStaffTemplate,
                  userSearch,
                  setUserSearch,
                  userRoleFilter,
                  setUserRoleFilter,
                  userActionBusy,
                  handleCreateUser,
                  usersPaged,
                  statusBadge,
                  handleEditUser,
                  handleAssignRole,
                  handleForceReset,
                  handleLockUnlock,
                  handleDeactivate,
                  handleImpersonate,
                  userPage,
                  pageSize,
                  usersFiltered,
                  totalPages,
                  setUserPage,
                  staffRoleSearch,
                  setStaffRoleSearch,
                  staffRoleGroupFilter,
                  setStaffRoleGroupFilter,
                  staffRoleCategoryFilter,
                  setStaffRoleCategoryFilter,
                  selectedStaffRoleTemplate,
                  setSelectedStaffRoleTemplate,
                  filteredEmrRoles,
                  selectedTemplate,
                  permissionMatrix,
                  togglePermission,
                  showDangerAction,
                  severityBadge,
                  systemChangeLogs,
                })
              )}
            </div>
          </main>
        </div>
        </div>
      </SidebarProvider>

      <AlertDialog open={showSensitiveDialog} onOpenChange={setShowSensitiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <ShieldAlert className="h-5 w-5" /> Sensitive Action Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription>
              {sensitiveActionLabel}. Confirm your password before continuing. This action will be permanently logged in audit logs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="sensitive-password">Admin password</label>
            <Input
              id="sensitive-password"
              type="password"
              placeholder="Enter password"
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={confirmSensitiveAction}>
              Confirm Action
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

interface SuperAdminSidebarProps {
  activeModule: ModuleId;
  onModuleSelect: (moduleId: ModuleId) => void;
}

const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({ activeModule, onModuleSelect }) => {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-primary/15 p-2 text-primary">
            <ShieldAlert className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">Tenadam Control</p>
              <p className="truncate text-xs text-muted-foreground">Super Admin Center</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {modules.map((module) => {
                const Icon = module.icon;
                const active = activeModule === module.id;
                return (
                  <SidebarMenuItem key={module.id}>
                    <SidebarMenuButton asChild isActive={active}>
                      <button
                        type="button"
                        onClick={() => {
                          onModuleSelect(module.id);
                          if (isMobile) setOpenMobile(false);
                        }}
                        className={cn(
                          "group w-full",
                          active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="ml-2.5 flex-1 truncate text-left">{module.label}</span>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80">{module.shortcut}</span>
                          </>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

     
    </Sidebar>
  );
};

export default SuperAdminDashboard;
