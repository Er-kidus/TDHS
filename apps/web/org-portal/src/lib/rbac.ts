export type OrgRole = "superadmin" | "admin" | "doctor" | "nurse" | "pharmacist" | "lab" | "imaging" | "staff";
export type OrgNavMode = "organization" | "telemedicine" | "pharmacy";

type OrgNavItem = {
  href: string;
  label: string;
  modes?: OrgNavMode[];
};

export function normalizeOrgRole(value: string | null | undefined): OrgRole {
  const role = (value || "").trim().toLowerCase();

  if (role === "superadmin" || role === "super-admin" || role === "super_admin") {
    return "superadmin";
  }
  if (role === "admin") {
    return "admin";
  }
  if (["doctor", "physician", "consultant", "specialist", "resident", "surgeon", "obgyn", "medical-director", "medical_director"].includes(role)) {
    return "doctor";
  }
  if (["lab", "laboratory", "lab-tech", "lab_tech", "lab-technician", "lab_technician", "laboratory-technician", "laboratory_technician", "medical-laboratory-scientist", "medical_laboratory_scientist"].includes(role)) {
    return "lab";
  }
  if (["imaging", "radiology", "radiology-tech", "radiology_tech", "radiology-technician", "radiology_technician", "radiographer", "sonographer", "sonographer-ultrasound", "sonographer_ultrasound", "ct-mri-technician", "ct_mri_technician"].includes(role)) {
    return "imaging";
  }
  if (["nurse", "midwife", "triage-nurse", "triage_nurse", "staff-nurse", "staff_nurse", "icu-nurse", "icu_nurse"].includes(role)) {
    return "nurse";
  }
  if (["pharmacy", "pharmacist", "pharm", "pharm-tech", "pharm_tech", "pharmacy-tech", "pharmacy_tech"].includes(role)) {
    return "pharmacist";
  }
  return "staff";
}

export function roleHomePath(role: OrgRole): string {
  switch (role) {
    case "superadmin":
      return "/dashboard/super-admin";
    case "admin":
      return "/dashboard/admin";
    case "doctor":
      return "/dashboard/doctor";
    case "nurse":
      return "/dashboard/nurse";
    case "pharmacist":
      return "/dashboard/pharmacy";
    case "lab":
      return "/dashboard/lab";
    case "imaging":
      return "/dashboard/imaging";
    default:
      return "/dashboard/reception";
  }
}

export function orgNavModeFromPath(pathname: string, role: OrgRole): OrgNavMode {
  if (pathname === "/dashboard/telemedicine" || pathname.startsWith("/dashboard/telemedicine/")) {
    return "telemedicine";
  }
  if (pathname === "/dashboard/pharmacy" || pathname.startsWith("/dashboard/pharmacy/")) {
    return "pharmacy";
  }
  if (role === "pharmacist") {
    return "pharmacy";
  }
  return "organization";
}

export function isPathAllowedForRole(pathname: string, role: OrgRole): boolean {
  const commonPrefixes = ["/patients", "/settings"];
  if (commonPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return true;
  }

  if (pathname === "/dashboard") {
    return true;
  }

  if (role === "superadmin") {
    const superAdminPrefixes = [
      "/dashboard/super-admin",
      "/dashboard/service-control",
      "/dashboard/staff-management",
      "/dashboard/inventory",
      "/dashboard/scheduling",
      "/analytics",
    ];
    return superAdminPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  }

  if (role === "admin") {
    const adminPrefixes = [
      "/dashboard/admin",
      "/dashboard/service-control",
      "/dashboard/staff-management",
      "/dashboard/inventory",
      "/dashboard/scheduling",
      "/dashboard/community",
      "/patients",
      "/analytics",
    ];
    return adminPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  }

  if (role === "doctor") {
    return (
      pathname === "/dashboard/doctor" ||
      pathname.startsWith("/dashboard/doctor/") ||
      pathname === "/dashboard/telemedicine" ||
      pathname.startsWith("/dashboard/telemedicine/") ||
      pathname === "/appointments" ||
      pathname.startsWith("/appointments/") ||
      pathname === "/dashboard/care/pregnancy" ||
      pathname === "/dashboard/care/chronic"
    );
  }

  if (role === "nurse") {
    return (
      pathname === "/dashboard/nurse" ||
      pathname.startsWith("/dashboard/nurse/") ||
      pathname === "/dashboard/telemedicine" ||
      pathname.startsWith("/dashboard/telemedicine/") ||
      pathname === "/appointments" ||
      pathname.startsWith("/appointments/") ||
      pathname === "/dashboard/care/pregnancy" ||
      pathname === "/dashboard/care/chronic" ||
      pathname === "/dashboard/community" ||
      pathname.startsWith("/dashboard/community/")
    );
  }

  if (role === "pharmacist") {
    return pathname === "/dashboard/pharmacy" || pathname.startsWith("/dashboard/pharmacy/") || pathname === "/patients" || pathname.startsWith("/patients/") || pathname === "/settings" || pathname.startsWith("/settings/");
  }

  if (role === "lab") {
    return pathname === "/dashboard/lab" || pathname.startsWith("/dashboard/lab/") || pathname === "/patients" || pathname.startsWith("/patients/") || pathname === "/settings" || pathname.startsWith("/settings/");
  }

  if (role === "imaging") {
    return pathname === "/dashboard/imaging" || pathname.startsWith("/dashboard/imaging/") || pathname === "/patients" || pathname.startsWith("/patients/") || pathname === "/settings" || pathname.startsWith("/settings/");
  }

  return pathname === "/dashboard/reception" || pathname.startsWith("/dashboard/reception/") || pathname === "/appointments" || pathname.startsWith("/appointments/");
}

function filterNavigationByMode(items: OrgNavItem[], mode?: OrgNavMode): Array<{ href: string; label: string }> {
  return items
    .filter((item) => !mode || !item.modes || item.modes.includes(mode))
    .map(({ href, label }) => ({ href, label }));
}

export function navigationForRole(role: OrgRole, mode?: OrgNavMode): Array<{ href: string; label: string }> {
  if (role === "superadmin") {
    return [
      { href: "/dashboard/super-admin", label: "Onboarding Queue" },
      { href: "/dashboard/service-control", label: "Service Control" },
      { href: "/dashboard/staff-management", label: "Staff Management" },
      { href: "/dashboard/inventory", label: "Inventory" },
      { href: "/dashboard/scheduling", label: "Scheduling" },
      { href: "/analytics", label: "Analytics" },
      { href: "/settings", label: "Settings" },
    ];
  }

  if (role === "admin") {
    return [
      { href: "/dashboard/admin", label: "Organization Control" },
      { href: "/dashboard/service-control", label: "Operations" },
      { href: "/dashboard/staff-management", label: "Staff Management" },
      { href: "/dashboard/community", label: "Community Health" },
      { href: "/dashboard/inventory", label: "Inventory" },
      { href: "/dashboard/scheduling", label: "Scheduling" },
      { href: "/dashboard/telemedicine/analytics", label: "Telemedicine Analytics" },
      { href: "/dashboard/telemedicine/ai-overview", label: "AI Triage Overview" },
      { href: "/patients", label: "Patients" },
      { href: "/analytics", label: "Analytics" },
      { href: "/settings", label: "Settings" },
    ];
  }

  if (role === "doctor") {
    return filterNavigationByMode([
      { href: "/dashboard/doctor", label: "Organization Dashboard", modes: ["organization"] },
      { href: "/dashboard/doctor/queue", label: "Queue", modes: ["organization"] },
      { href: "/dashboard/doctor/prescriptions", label: "Prescription", modes: ["organization"] },
      { href: "/dashboard/doctor/labs", label: "Lab", modes: ["organization"] },
      { href: "/dashboard/care/pregnancy", label: "Pregnancy Registry", modes: ["organization"] },
      { href: "/dashboard/care/chronic", label: "Chronic Care", modes: ["organization"] },
      { href: "/dashboard/telemedicine", label: "Telemedicine Home", modes: ["telemedicine"] },
      { href: "/dashboard/telemedicine/queue", label: "Telemedicine Queue", modes: ["telemedicine"] },
      { href: "/dashboard/telemedicine/profile", label: "My Telemedicine Profile", modes: ["telemedicine"] },
      { href: "/dashboard/telemedicine/analytics", label: "Telemedicine Analytics", modes: ["telemedicine"] },
      { href: "/patients", label: "Patients" },
      { href: "/appointments", label: "Appointments" },
    ], mode);
  }

  if (role === "nurse") {
    return filterNavigationByMode([
      { href: "/dashboard/nurse", label: "Nurse Dashboard", modes: ["organization"] },
      { href: "/dashboard/nurse/triage", label: "Triage Board", modes: ["organization"] },
      { href: "/dashboard/nurse/triage/history", label: "Triage History", modes: ["organization"] },
      { href: "/dashboard/nurse/triage/protocols", label: "Triage Protocols", modes: ["organization"] },
      { href: "/dashboard/care/pregnancy", label: "Pregnancy Registry", modes: ["organization"] },
      { href: "/dashboard/care/chronic", label: "Chronic Care", modes: ["organization"] },
      { href: "/dashboard/community", label: "Community Field Work", modes: ["organization"] },
      { href: "/dashboard/telemedicine", label: "Telemedicine Home", modes: ["telemedicine"] },
      { href: "/dashboard/telemedicine/queue", label: "Telemedicine Queue", modes: ["telemedicine"] },
      { href: "/dashboard/telemedicine/profile", label: "My Telemedicine Profile", modes: ["telemedicine"] },
      { href: "/dashboard/telemedicine/analytics", label: "Telemedicine Analytics", modes: ["telemedicine"] },
      { href: "/patients", label: "Patients" },
      { href: "/appointments", label: "Appointments" },
      { href: "/settings", label: "Settings" },
    ], mode);
  }

  if (role === "pharmacist") {
    return filterNavigationByMode([
      { href: "/dashboard/pharmacy", label: "Pharmacy Dashboard", modes: ["pharmacy"] },
      { href: "/dashboard/pharmacy/inventory", label: "Inventory Management", modes: ["pharmacy"] },
      { href: "/patients", label: "Patients" },
      { href: "/settings", label: "Settings" },
    ], mode);
  }

  if (role === "lab") {
    return [
      { href: "/dashboard/lab", label: "Lab Dashboard" },
      { href: "/patients", label: "Patients" },
      { href: "/settings", label: "Settings" },
    ];
  }

  if (role === "imaging") {
    return [
      { href: "/dashboard/imaging", label: "Imaging Dashboard" },
      { href: "/patients", label: "Patients" },
      { href: "/settings", label: "Settings" },
    ];
  }

  return [
    { href: "/dashboard/reception", label: "Reception Dashboard" },
    { href: "/patients", label: "Patients" },
    { href: "/appointments", label: "Appointments" },
    { href: "/settings", label: "Settings" },
  ];
}
