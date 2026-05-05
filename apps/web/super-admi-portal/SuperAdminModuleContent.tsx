/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentType } from "react";
import DashboardPage from "./pages/DashboardPage.tsx";
import UsersPage from "./pages/UsersPage.tsx";
import RbacPage from "./pages/RbacPage.tsx";
import ApplicationsPage from "./pages/ApplicationsPage.tsx";
import OrganizationsPage from "./pages/OrganizationsPage.tsx";
import ConfigPage from "./pages/ConfigPage.tsx";
import SecurityPage from "./pages/SecurityPage.tsx";
import AuditPage from "./pages/AuditPage.tsx";
import ReportsPage from "./pages/ReportsPage.tsx";
import MedicalPage from "./pages/MedicalPage.tsx";
import IntegrationsPage from "./pages/IntegrationsPage.tsx";
import MonitoringPage from "./pages/MonitoringPage.tsx";
import BillingPage from "./pages/BillingPage.tsx";
import DeveloperPage from "./pages/DeveloperPage.tsx";

const pageMap: Record<string, ComponentType<any>> = {
  dashboard: DashboardPage,
  users: UsersPage,
  rbac: RbacPage,
  applications: ApplicationsPage,
  organizations: OrganizationsPage,
  config: ConfigPage,
  security: SecurityPage,
  audit: AuditPage,
  reports: ReportsPage,
  medical: MedicalPage,
  integrations: IntegrationsPage,
  monitoring: MonitoringPage,
  billing: BillingPage,
  developer: DeveloperPage,
};

export function SuperAdminModuleContent(props: any) {
  const ActivePage = pageMap[props?.activeModule] || DashboardPage;
  return <ActivePage {...props} />;
}
