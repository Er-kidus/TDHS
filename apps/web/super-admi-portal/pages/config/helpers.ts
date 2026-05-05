import { serviceCatalog, tierDefaultServices } from "./catalog";
import type { OrganizationStatus, ServiceKey, Tier } from "./types";

export function normalizeTier(rawTier?: string): Tier {
  const tier = (rawTier || "").trim().toLowerCase();
  if (tier === "health-post") return "health-post";
  if (tier === "health-center") return "health-center";
  if (tier === "primary-hospital") return "primary-hospital";
  if (tier === "general-specialized-hospital") return "general-specialized-hospital";
  if (tier === "national-health-system") return "national-health-system";
  return "health-center";
}

export function deriveOrganizationStatus(raw?: string): OrganizationStatus {
  const status = (raw || "").toLowerCase();
  if (status.includes("pending")) return "Pending";
  if (status.includes("suspend") || status.includes("inactive") || status.includes("locked")) return "Suspended";
  return "Active";
}

export function statusBadgeVariant(status: OrganizationStatus): "default" | "secondary" | "destructive" {
  if (status === "Active") return "default";
  if (status === "Pending") return "secondary";
  return "destructive";
}

export function buildTierTemplate(tier: Tier): Record<ServiceKey, boolean> {
  const active = new Set(tierDefaultServices[tier]);
  return serviceCatalog.reduce((acc, service) => {
    acc[service.key] = active.has(service.key);
    return acc;
  }, {} as Record<ServiceKey, boolean>);
}

export function buildServiceStateFromEnabled(enabledServices: string[], tier: Tier): Record<ServiceKey, boolean> {
  if (!enabledServices || enabledServices.length === 0) {
    return buildTierTemplate(tier);
  }
  const active = new Set(enabledServices);
  return serviceCatalog.reduce((acc, service) => {
    acc[service.key] = active.has(service.key);
    return acc;
  }, {} as Record<ServiceKey, boolean>);
}

export function groupServicesByCategory() {
  return {
    "Core Clinical Services": serviceCatalog.filter((s) => s.category === "Core Clinical Services"),
    Diagnostics: serviceCatalog.filter((s) => s.category === "Diagnostics"),
    Pharmacy: serviceCatalog.filter((s) => s.category === "Pharmacy"),
    Administration: serviceCatalog.filter((s) => s.category === "Administration"),
    "Digital Services": serviceCatalog.filter((s) => s.category === "Digital Services"),
    "System Configuration Impact": serviceCatalog.filter((s) => s.category === "System Configuration Impact"),
  };
}
