const SUPPORTED_BACKEND_ROLES = new Set([
  "admin",
  "doctor",
  "nurse",
  "staff",
  "reception",
  "pharmacist",
  "lab",
]);

const ROLE_ALIASES: Record<string, string> = {
  receptionist: "reception",
  reception: "reception",
  reception_ward: "reception",
  pharmacy: "pharmacist",
  pharmacist: "pharmacist",
  laboratory: "lab",
  lab: "lab",
};

export function mapTemplateRoleToBackendRole(role?: string): string {
  const normalized = role?.trim().toLowerCase();
  if (!normalized) return "staff";

  if (SUPPORTED_BACKEND_ROLES.has(normalized)) {
    return normalized;
  }

  if (ROLE_ALIASES[normalized]) {
    return ROLE_ALIASES[normalized];
  }

  if (normalized.startsWith("doctor_")) return "doctor";
  if (normalized.startsWith("nurse_")) return "nurse";
  if (normalized.startsWith("admin_")) return "admin";
  if (normalized.startsWith("pharm_")) return "pharmacist";
  if (normalized.startsWith("lab_") || normalized.startsWith("diag_")) return "lab";
  if (normalized.startsWith("reception_")) return "reception";

  return "staff";
}
