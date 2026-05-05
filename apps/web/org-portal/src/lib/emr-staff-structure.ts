export type EmrRoleGroup =
  | "Clinical Staff"
  | "Nursing Staff"
  | "Allied Health"
  | "Diagnostic Staff"
  | "Administrative Staff"
  | "Support Staff"
  | "IT & System"
  | "External / Community";

export type ApiOrgRole = "admin" | "doctor" | "nurse" | "staff";

export type EmrRoleDefinition = {
  id: string;
  title: string;
  category: string;
  group: EmrRoleGroup;
  apiRole: ApiOrgRole;
};

function toId(value: string): string {
  return value
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function makeRole(
  title: string,
  category: string,
  group: EmrRoleGroup,
  apiRole: ApiOrgRole,
): EmrRoleDefinition {
  return {
    id: `${toId(category)}-${toId(title)}`,
    title,
    category,
    group,
    apiRole,
  };
}

const roles: EmrRoleDefinition[] = [
  makeRole("Chief Executive Officer (CEO)", "Governance & Executive Leadership", "Administrative Staff", "admin"),
  makeRole("Chief Medical Officer (CMO)", "Governance & Executive Leadership", "Clinical Staff", "doctor"),
  makeRole("Chief Nursing Officer (CNO)", "Governance & Executive Leadership", "Nursing Staff", "nurse"),
  makeRole("Chief Financial Officer (CFO)", "Governance & Executive Leadership", "Administrative Staff", "admin"),
  makeRole("Chief Information Officer (CIO)", "Governance & Executive Leadership", "IT & System", "admin"),

  makeRole("Medical Director", "Medical Staff", "Clinical Staff", "doctor"),
  makeRole("General Practitioner (GP)", "Medical Staff", "Clinical Staff", "doctor"),
  makeRole("Consultant (Specialist)", "Medical Staff", "Clinical Staff", "doctor"),
  makeRole("Resident", "Medical Staff", "Clinical Staff", "doctor"),
  makeRole("Medical Student", "Medical Staff", "Clinical Staff", "staff"),

  makeRole("Cardiologist", "Medical Specialties", "Clinical Staff", "doctor"),
  makeRole("Neurologist", "Medical Specialties", "Clinical Staff", "doctor"),
  makeRole("Pediatrician", "Medical Specialties", "Clinical Staff", "doctor"),
  makeRole("Psychiatrist", "Medical Specialties", "Clinical Staff", "doctor"),
  makeRole("Oncologist", "Medical Specialties", "Clinical Staff", "doctor"),
  makeRole("Emergency Medicine Physician", "Medical Specialties", "Clinical Staff", "doctor"),

  makeRole("General Surgeon", "Surgical Staff", "Clinical Staff", "doctor"),
  makeRole("Orthopedic Surgeon", "Surgical Staff", "Clinical Staff", "doctor"),
  makeRole("Neurosurgeon", "Surgical Staff", "Clinical Staff", "doctor"),
  makeRole("Obstetrician/Gynecologist (OB/GYN)", "Surgical Staff", "Clinical Staff", "doctor"),
  makeRole("Anesthesiologist", "Procedure-Based Specialists", "Clinical Staff", "doctor"),
  makeRole("Radiologist", "Procedure-Based Specialists", "Diagnostic Staff", "doctor"),
  makeRole("Pathologist", "Procedure-Based Specialists", "Diagnostic Staff", "doctor"),

  makeRole("Director of Nursing", "Nursing Staff", "Nursing Staff", "nurse"),
  makeRole("Registered Nurse (RN)", "Nursing Staff", "Nursing Staff", "nurse"),
  makeRole("Emergency/Triage Nurse", "Nursing Staff", "Nursing Staff", "nurse"),
  makeRole("ICU Nurse", "Nursing Staff", "Nursing Staff", "nurse"),
  makeRole("Midwife", "Nursing Staff", "Nursing Staff", "nurse"),
  makeRole("Nurse Assistant / Nursing Aide", "Nursing Staff", "Nursing Staff", "staff"),

  makeRole("Physiotherapist", "Allied Health Professionals", "Allied Health", "staff"),
  makeRole("Occupational Therapist", "Allied Health Professionals", "Allied Health", "staff"),
  makeRole("Pharmacist", "Allied Health Professionals", "Allied Health", "staff"),
  makeRole("Clinical Pharmacist", "Allied Health Professionals", "Allied Health", "staff"),
  makeRole("Psychologist", "Allied Health Professionals", "Allied Health", "staff"),
  makeRole("Social Worker", "Allied Health Professionals", "Allied Health", "staff"),

  makeRole("Medical Laboratory Scientist", "Diagnostic & Laboratory Staff", "Diagnostic Staff", "staff"),
  makeRole("Lab Technician", "Diagnostic & Laboratory Staff", "Diagnostic Staff", "staff"),
  makeRole("Radiographer", "Diagnostic & Laboratory Staff", "Diagnostic Staff", "staff"),
  makeRole("Sonographer (Ultrasound)", "Diagnostic & Laboratory Staff", "Diagnostic Staff", "staff"),

  makeRole("Hospital Administrator", "Administration & Management", "Administrative Staff", "admin"),
  makeRole("Operations Manager", "Administration & Management", "Administrative Staff", "admin"),
  makeRole("Health Information Manager", "Administration & Management", "Administrative Staff", "admin"),
  makeRole("Finance/Billing Officer", "Administration & Management", "Administrative Staff", "staff"),
  makeRole("Medical Records Officer", "Administration & Management", "Administrative Staff", "staff"),
  makeRole("Insurance Coordinator", "Administration & Management", "Administrative Staff", "staff"),

  makeRole("EMR/EHR Administrator", "IT & Digital Health", "IT & System", "admin"),
  makeRole("System Administrator", "IT & Digital Health", "IT & System", "admin"),
  makeRole("Cybersecurity Specialist", "IT & Digital Health", "IT & System", "staff"),
  makeRole("Data Analyst (Healthcare)", "IT & Digital Health", "IT & System", "staff"),

  makeRole("Community Health Worker", "Community & Outreach", "External / Community", "staff"),
  makeRole("Health Extension Worker", "Community & Outreach", "External / Community", "staff"),
  makeRole("Public Health Officer", "Community & Outreach", "External / Community", "staff"),
  makeRole("Epidemiologist", "Community & Outreach", "External / Community", "staff"),

  makeRole("Compliance Officer", "Legal & Compliance", "Administrative Staff", "admin"),
  makeRole("Risk Manager", "Legal & Compliance", "Administrative Staff", "admin"),
];

export const EMR_STAFF_STRUCTURE: EmrRoleDefinition[] = roles;

export const EMR_ROLE_GROUPS: EmrRoleGroup[] = [
  "Clinical Staff",
  "Nursing Staff",
  "Allied Health",
  "Diagnostic Staff",
  "Administrative Staff",
  "Support Staff",
  "IT & System",
  "External / Community",
];

export const EMR_ROLE_CATEGORIES = Array.from(new Set(roles.map((role) => role.category))).sort((a, b) =>
  a.localeCompare(b),
);
