export interface OrgApplication {
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
  requested_services?: string[];
  configured_services?: string[];
  selected_staff_templates?: string[];
  update_requested_services?: string[];
  update_request_notes?: string;
  update_request_status?: string;
  status: string;
}

export interface OrgStaffTemplate {
  template_key: string;
  title: string;
  role_group: string;
  category: string;
  api_role: string;
}

export interface ServiceDefinitionOption {
  id: string;
  name: string;
}

export interface ApplicationsPageProps {
  orgApplications: OrgApplication[];
  serviceDefinitions: ServiceDefinitionOption[];
  availableStaffTemplates: OrgStaffTemplate[];
  selectedApplication: OrgApplication | null;
  applicationRouteId?: string;
  applicationSearch: string;
  setApplicationSearch: (value: string) => void;
  applicationActionBusy: boolean;
  setSelectedApplicationId: (id: string) => void;
  openOnboardingApplication: (id: string) => void;
  handleApproveApplication: () => Promise<void> | void;
  handleRejectApplication: () => Promise<void> | void;
  applicationServiceDraft: string;
  setApplicationServiceDraft: (value: string) => void;
  applicationDomainDraft: string;
  setApplicationDomainDraft: (value: string) => void;
  applicationUpdateServiceDraft: string;
  setApplicationUpdateServiceDraft: (value: string) => void;
  handleSaveApplicationServices: () => Promise<void> | void;
  handleCreateCatalogService: (name: string) => Promise<boolean>;
  handleSaveApplicationDomain: () => Promise<void> | void;
  handleApproveUpdateRequest: () => Promise<void> | void;
  handleRejectUpdateRequest: () => Promise<void> | void;
  handleSaveApplicationStaffTemplates: () => Promise<void> | void;
  applicationStaffTemplateDraft: string[];
  toggleApplicationStaffTemplate: (templateKey: string) => void;
}
