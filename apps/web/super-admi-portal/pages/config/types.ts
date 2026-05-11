export type Tier =
  | "health-post"
  | "health-center"
  | "primary-hospital"
  | "general-specialized-hospital"
  | "national-health-system";

export type OrganizationStatus = "Active" | "Pending" | "Suspended";

export type Organization = {
  id: string;
  name: string;
  tier: Tier;
  status: OrganizationStatus;
  region: string;
  location: string;
};

export type OrganizationApiRow = {
  id: string;
  name: string;
  slug?: string;
  tier?: string;
  address?: string;
  status?: string;
};

export type OrgConfigurationResponse = {
  organization_id: string;
  tier?: string;
  enabled_services?: string[];
  enabled_features?: string[];
  feature_flags?: Record<string, boolean>;
  workflow_rules?: Record<string, { enabled?: boolean; severity?: RuleSeverity }>;
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
    pricingModel?: "fixed" | "dynamic";
    claimAutomation?: boolean;
  };
  min_staff?: Record<string, number>;
  queue_enabled?: boolean;
};

export type FeatureFlagKey =
  | "aiTriage"
  | "telemedicine"
  | "emergencyRouting"
  | "auditExport"
  | "devSandbox"
  | "clinicalDecisionSupport"
  | "prescriptionValidation"
  | "referralEnforcement"
  | "admissionApproval"
  | "billingSystem"
  | "insuranceClaims"
  | "discountWaivers"
  | "pricingOverride"
  | "smsNotifications"
  | "ussdAccess"
  | "patientPortalAccess"
  | "crossHospitalExchange"
  | "researchDataModule"
  | "advancedCaseManagement";

export type FeatureFlags = Record<FeatureFlagKey, boolean>;

export type ConfigPageProps = {
  organizations?: OrganizationApiRow[];
  featureFlags: Record<string, boolean>;
  setFeatureFlags: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  pushSystemAction: (message: string) => void;
  toast: (options: { title: string; description?: string; variant?: "default" | "destructive" }) => void;
  staffRoleSearch?: string;
  setStaffRoleSearch?: React.Dispatch<React.SetStateAction<string>>;
  staffRoleGroupFilter?: string;
  setStaffRoleGroupFilter?: React.Dispatch<React.SetStateAction<string>>;
  staffRoleCategoryFilter?: string;
  setStaffRoleCategoryFilter?: React.Dispatch<React.SetStateAction<string>>;
  selectedStaffRoleTemplate?: string;
  setSelectedStaffRoleTemplate?: React.Dispatch<React.SetStateAction<string>>;
  filteredEmrRoles?: Array<{
    id: string;
    title: string;
    group: string;
    category: string;
    apiRole: string;
  }>;
  selectedTemplate?: { title: string; apiRole: string } | null;
  handleCreateUser?: () => void;
  userActionBusy?: boolean;
};

export type ServiceKey = string;

export type RuleSeverity = "strict" | "flexible";
