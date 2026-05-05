export type OrgRole = "superadmin" | "admin" | "doctor" | "nurse" | "staff";

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
  if (["nurse", "midwife", "triage-nurse", "triage_nurse", "staff-nurse", "staff_nurse", "icu-nurse", "icu_nurse"].includes(role)) {
    return "nurse";
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
    default:
      return "/dashboard/reception";
  }
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
      "/analytics",
    ];
    return adminPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  }

  if (role === "doctor") {
    return (
      pathname === "/dashboard/doctor" ||
      pathname.startsWith("/dashboard/doctor/") ||
      pathname === "/dashboard/pharmacy" ||
      pathname.startsWith("/dashboard/pharmacy/") ||
      pathname === "/dashboard/telemedicine" ||
      pathname.startsWith("/dashboard/telemedicine/") ||
      pathname === "/appointments" ||
      pathname.startsWith("/appointments/")
    );
  }

  if (role === "nurse") {
    return (
      pathname === "/dashboard/nurse" ||
      pathname.startsWith("/dashboard/nurse/") ||
      pathname === "/dashboard/pharmacy" ||
      pathname.startsWith("/dashboard/pharmacy/") ||
      pathname === "/dashboard/telemedicine" ||
      pathname.startsWith("/dashboard/telemedicine/") ||
      pathname === "/appointments" ||
      pathname.startsWith("/appointments/")
    );
  }

  return pathname === "/dashboard/reception" || pathname.startsWith("/dashboard/reception/") || pathname === "/appointments" || pathname.startsWith("/appointments/");
}

export function navigationForRole(role: OrgRole): Array<{ href: string; label: string }> {
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
      { href: "/dashboard/inventory", label: "Inventory" },
      { href: "/dashboard/scheduling", label: "Scheduling" },
      { href: "/patients", label: "Patients" },
      { href: "/analytics", label: "Analytics" },
      { href: "/settings", label: "Settings" },
    ];
  }

  if (role === "doctor") {
    return [
      { href: "/dashboard/doctor", label: "Organization Dashboard" },
      { href: "/dashboard/doctor/queue", label: "Queue" },
      { href: "/dashboard/doctor/workflow", label: "Patient Workflow" },
      { href: "/dashboard/telemedicine", label: "Telemedicine Home" },
      { href: "/dashboard/telemedicine/queue", label: "Telemedicine Queue" },
      { href: "/dashboard/telemedicine/profile", label: "My Telemedicine Profile" },
      { href: "/dashboard/pharmacy", label: "Pharmacy Dashboard" },
      { href: "/patients", label: "Patients" },
      { href: "/appointments", label: "Appointments" },
      { href: "/settings", label: "Settings" },
    ];
  }

  if (role === "nurse") {
    return [
      { href: "/dashboard/nurse", label: "Nurse Dashboard" },
      { href: "/dashboard/nurse/triage", label: "Triage Board" },
      { href: "/dashboard/nurse/triage/history", label: "Triage History" },
      { href: "/dashboard/nurse/triage/protocols", label: "Triage Protocols" },
      { href: "/dashboard/telemedicine", label: "Telemedicine Home" },
      { href: "/dashboard/telemedicine/queue", label: "Telemedicine Queue" },
      { href: "/dashboard/telemedicine/profile", label: "My Telemedicine Profile" },
      { href: "/dashboard/pharmacy", label: "Pharmacy Dashboard" },
      { href: "/patients", label: "Patients" },
      { href: "/appointments", label: "Appointments" },
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
