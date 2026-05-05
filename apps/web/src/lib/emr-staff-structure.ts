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
  makeRole("Board of Directors", "Governance & Executive Leadership", "Administrative Staff", "admin"),
  makeRole("Trustees", "Governance & Executive Leadership", "Administrative Staff", "admin"),
  makeRole("Hospital Owners", "Governance & Executive Leadership", "Administrative Staff", "admin"),
  makeRole("Chief Executive Officer (CEO)", "Governance & Executive Leadership", "Administrative Staff", "admin"),
  makeRole("Chief Operating Officer (COO)", "Governance & Executive Leadership", "Administrative Staff", "admin"),
  makeRole("Chief Medical Officer (CMO)", "Governance & Executive Leadership", "Clinical Staff", "doctor"),
  makeRole("Chief Nursing Officer (CNO)", "Governance & Executive Leadership", "Nursing Staff", "nurse"),
  makeRole("Chief Financial Officer (CFO)", "Governance & Executive Leadership", "Administrative Staff", "admin"),
  makeRole("Chief Information Officer (CIO)", "Governance & Executive Leadership", "IT & System", "admin"),
  makeRole("Chief Technology Officer (CTO)", "Governance & Executive Leadership", "IT & System", "admin"),
  makeRole("Chief Human Resources Officer (CHRO)", "Governance & Executive Leadership", "Administrative Staff", "admin"),
  makeRole("Chief Compliance Officer", "Governance & Executive Leadership", "Administrative Staff", "admin"),

  makeRole("Medical Director", "Medical Staff", "Clinical Staff", "doctor"),
  makeRole("Department Head (HOD)", "Medical Staff", "Clinical Staff", "doctor"),
  makeRole("General Practitioner (GP)", "Medical Staff", "Clinical Staff", "doctor"),
  makeRole("Attending Physician", "Medical Staff", "Clinical Staff", "doctor"),
  makeRole("Consultant (Specialist)", "Medical Staff", "Clinical Staff", "doctor"),
  makeRole("Registrar", "Medical Staff", "Clinical Staff", "doctor"),
  makeRole("Resident", "Medical Staff", "Clinical Staff", "doctor"),
  makeRole("Intern", "Medical Staff", "Clinical Staff", "doctor"),
  makeRole("Medical Student", "Medical Staff", "Clinical Staff", "staff"),

  makeRole("Cardiologist", "Medical Specialties", "Clinical Staff", "doctor"),
  makeRole("Neurologist", "Medical Specialties", "Clinical Staff", "doctor"),
  makeRole("Dermatologist", "Medical Specialties", "Clinical Staff", "doctor"),
  makeRole("Pediatrician", "Medical Specialties", "Clinical Staff", "doctor"),
  makeRole("Psychiatrist", "Medical Specialties", "Clinical Staff", "doctor"),
  makeRole("Oncologist", "Medical Specialties", "Clinical Staff", "doctor"),
  makeRole("Endocrinologist", "Medical Specialties", "Clinical Staff", "doctor"),
  makeRole("Gastroenterologist", "Medical Specialties", "Clinical Staff", "doctor"),
  makeRole("Pulmonologist", "Medical Specialties", "Clinical Staff", "doctor"),
  makeRole("Nephrologist", "Medical Specialties", "Clinical Staff", "doctor"),
  makeRole("Infectious Disease Specialist", "Medical Specialties", "Clinical Staff", "doctor"),
  makeRole("Emergency Medicine Physician", "Medical Specialties", "Clinical Staff", "doctor"),

  makeRole("General Surgeon", "Surgical Staff", "Clinical Staff", "doctor"),
  makeRole("Orthopedic Surgeon", "Surgical Staff", "Clinical Staff", "doctor"),
  makeRole("Neurosurgeon", "Surgical Staff", "Clinical Staff", "doctor"),
  makeRole("Cardiothoracic Surgeon", "Surgical Staff", "Clinical Staff", "doctor"),
  makeRole("Plastic Surgeon", "Surgical Staff", "Clinical Staff", "doctor"),
  makeRole("Urologist", "Surgical Staff", "Clinical Staff", "doctor"),
  makeRole("Obstetrician/Gynecologist (OB/GYN)", "Surgical Staff", "Clinical Staff", "doctor"),
  makeRole("Anesthesiologist", "Procedure-Based Specialists", "Clinical Staff", "doctor"),
  makeRole("Intensivist (ICU)", "Procedure-Based Specialists", "Clinical Staff", "doctor"),
  makeRole("Radiologist", "Procedure-Based Specialists", "Diagnostic Staff", "doctor"),
  makeRole("Pathologist", "Procedure-Based Specialists", "Diagnostic Staff", "doctor"),

  makeRole("Director of Nursing", "Nursing Staff", "Nursing Staff", "nurse"),
  makeRole("Nurse Unit Manager (Ward Manager)", "Nursing Staff", "Nursing Staff", "nurse"),
  makeRole("Assistant Nurse Manager", "Nursing Staff", "Nursing Staff", "nurse"),
  makeRole("Registered Nurse (RN)", "Nursing Staff", "Nursing Staff", "nurse"),
  makeRole("Enrolled Nurse", "Nursing Staff", "Nursing Staff", "nurse"),
  makeRole("Licensed Practical Nurse (LPN)", "Nursing Staff", "Nursing Staff", "nurse"),
  makeRole("ICU Nurse", "Nursing Staff", "Nursing Staff", "nurse"),
  makeRole("Emergency/Triage Nurse", "Nursing Staff", "Nursing Staff", "nurse"),
  makeRole("Surgical Nurse", "Nursing Staff", "Nursing Staff", "nurse"),
  makeRole("Pediatric Nurse", "Nursing Staff", "Nursing Staff", "nurse"),
  makeRole("Oncology Nurse", "Nursing Staff", "Nursing Staff", "nurse"),
  makeRole("Dialysis Nurse", "Nursing Staff", "Nursing Staff", "nurse"),
  makeRole("Infection Control Nurse", "Nursing Staff", "Nursing Staff", "nurse"),
  makeRole("Psychiatric Nurse", "Nursing Staff", "Nursing Staff", "nurse"),
  makeRole("Community Health Nurse", "Nursing Staff", "Nursing Staff", "nurse"),
  makeRole("Midwife", "Nursing Staff", "Nursing Staff", "nurse"),
  makeRole("Nurse Practitioner (NP)", "Nursing Staff", "Nursing Staff", "nurse"),
  makeRole("Clinical Nurse Specialist", "Nursing Staff", "Nursing Staff", "nurse"),
  makeRole("Nurse Educator", "Nursing Staff", "Nursing Staff", "nurse"),
  makeRole("Nurse Researcher", "Nursing Staff", "Nursing Staff", "nurse"),
  makeRole("Ward Nurse", "Nursing Staff", "Nursing Staff", "nurse"),
  makeRole("Charge Nurse", "Nursing Staff", "Nursing Staff", "nurse"),
  makeRole("Bedside Nurse", "Nursing Staff", "Nursing Staff", "nurse"),
  makeRole("Nurse Assistant / Nursing Aide", "Nursing Staff", "Nursing Staff", "staff"),

  makeRole("Physiotherapist", "Allied Health Professionals", "Allied Health", "staff"),
  makeRole("Occupational Therapist", "Allied Health Professionals", "Allied Health", "staff"),
  makeRole("Speech & Language Therapist", "Allied Health Professionals", "Allied Health", "staff"),
  makeRole("Respiratory Therapist", "Allied Health Professionals", "Allied Health", "staff"),
  makeRole("Dietitian", "Allied Health Professionals", "Allied Health", "staff"),
  makeRole("Nutritionist", "Allied Health Professionals", "Allied Health", "staff"),
  makeRole("Pharmacist", "Allied Health Professionals", "Allied Health", "staff"),
  makeRole("Clinical Pharmacist", "Allied Health Professionals", "Allied Health", "staff"),
  makeRole("Pharmacy Technician", "Allied Health Professionals", "Allied Health", "staff"),
  makeRole("Pharmacy Assistant", "Allied Health Professionals", "Allied Health", "staff"),
  makeRole("Psychologist", "Allied Health Professionals", "Allied Health", "staff"),
  makeRole("Social Worker", "Allied Health Professionals", "Allied Health", "staff"),
  makeRole("Counselor", "Allied Health Professionals", "Allied Health", "staff"),
  makeRole("Podiatrist", "Allied Health Professionals", "Allied Health", "staff"),
  makeRole("Audiologist", "Allied Health Professionals", "Allied Health", "staff"),
  makeRole("Optometrist", "Allied Health Professionals", "Allied Health", "staff"),

  makeRole("Laboratory Director", "Diagnostic & Laboratory Staff", "Diagnostic Staff", "staff"),
  makeRole("Medical Laboratory Scientist", "Diagnostic & Laboratory Staff", "Diagnostic Staff", "staff"),
  makeRole("Lab Technician", "Diagnostic & Laboratory Staff", "Diagnostic Staff", "staff"),
  makeRole("Phlebotomist", "Diagnostic & Laboratory Staff", "Diagnostic Staff", "staff"),
  makeRole("Radiographer", "Diagnostic & Laboratory Staff", "Diagnostic Staff", "staff"),
  makeRole("Sonographer (Ultrasound)", "Diagnostic & Laboratory Staff", "Diagnostic Staff", "staff"),
  makeRole("CT/MRI Technician", "Diagnostic & Laboratory Staff", "Diagnostic Staff", "staff"),
  makeRole("Biomedical Engineer", "Diagnostic & Laboratory Staff", "Diagnostic Staff", "staff"),
  makeRole("Medical Equipment Technician", "Diagnostic & Laboratory Staff", "Diagnostic Staff", "staff"),

  makeRole("Emergency Physician", "Emergency & Critical Care", "Clinical Staff", "doctor"),
  makeRole("Trauma Team Member", "Emergency & Critical Care", "Clinical Staff", "staff"),
  makeRole("Paramedic", "Emergency & Critical Care", "Clinical Staff", "staff"),
  makeRole("Emergency Nurse", "Emergency & Critical Care", "Nursing Staff", "nurse"),
  makeRole("ICU Staff", "Emergency & Critical Care", "Nursing Staff", "nurse"),
  makeRole("Ambulance Driver", "Emergency & Critical Care", "Support Staff", "staff"),
  makeRole("First Responder", "Emergency & Critical Care", "Support Staff", "staff"),

  makeRole("Ward Clerk", "Inpatient / Ward Support", "Support Staff", "staff"),
  makeRole("Patient Care Assistant", "Inpatient / Ward Support", "Support Staff", "staff"),
  makeRole("Healthcare Assistant", "Inpatient / Ward Support", "Support Staff", "staff"),
  makeRole("Porter (Patient Transport)", "Inpatient / Ward Support", "Support Staff", "staff"),
  makeRole("Bed Manager", "Inpatient / Ward Support", "Administrative Staff", "admin"),
  makeRole("Admission/Discharge Coordinator", "Inpatient / Ward Support", "Administrative Staff", "admin"),

  makeRole("Hospital Administrator", "Administration & Management", "Administrative Staff", "admin"),
  makeRole("Operations Manager", "Administration & Management", "Administrative Staff", "admin"),
  makeRole("Department Coordinator", "Administration & Management", "Administrative Staff", "admin"),
  makeRole("Health Information Manager", "Administration & Management", "Administrative Staff", "admin"),
  makeRole("Medical Records Officer", "Administration & Management", "Administrative Staff", "staff"),
  makeRole("Medical Coder", "Administration & Management", "Administrative Staff", "staff"),
  makeRole("Medical Biller", "Administration & Management", "Administrative Staff", "staff"),
  makeRole("Accountant", "Administration & Management", "Administrative Staff", "staff"),
  makeRole("Billing Officer", "Administration & Management", "Administrative Staff", "staff"),
  makeRole("Insurance Coordinator", "Administration & Management", "Administrative Staff", "staff"),
  makeRole("HR Manager", "Administration & Management", "Administrative Staff", "admin"),
  makeRole("Recruiter", "Administration & Management", "Administrative Staff", "staff"),
  makeRole("Training Coordinator", "Administration & Management", "Administrative Staff", "staff"),

  makeRole("Health IT Specialist", "IT & Digital Health", "IT & System", "staff"),
  makeRole("EMR/EHR Administrator", "IT & Digital Health", "IT & System", "admin"),
  makeRole("System Administrator", "IT & Digital Health", "IT & System", "admin"),
  makeRole("Database Administrator", "IT & Digital Health", "IT & System", "admin"),
  makeRole("Cybersecurity Specialist", "IT & Digital Health", "IT & System", "staff"),
  makeRole("Data Analyst (Healthcare)", "IT & Digital Health", "IT & System", "staff"),
  makeRole("AI/Clinical Decision Support Engineer", "IT & Digital Health", "IT & System", "staff"),

  makeRole("Cleaner / Housekeeping Staff", "Support & Facility", "Support Staff", "staff"),
  makeRole("Infection Control Staff", "Support & Facility", "Support Staff", "staff"),
  makeRole("Waste Management Staff", "Support & Facility", "Support Staff", "staff"),
  makeRole("Kitchen Staff", "Support & Facility", "Support Staff", "staff"),
  makeRole("Diet Kitchen Assistant", "Support & Facility", "Support Staff", "staff"),
  makeRole("Food Service Worker", "Support & Facility", "Support Staff", "staff"),
  makeRole("Security Guard", "Support & Facility", "Support Staff", "staff"),
  makeRole("Safety Officer", "Support & Facility", "Support Staff", "staff"),
  makeRole("Store Manager", "Support & Facility", "Support Staff", "staff"),
  makeRole("Inventory Manager", "Support & Facility", "Support Staff", "staff"),
  makeRole("Supply Chain Officer", "Support & Facility", "Support Staff", "staff"),

  makeRole("Chief Pharmacist", "Pharmacy & Medication Management", "Allied Health", "staff"),
  makeRole("Dispensing Pharmacist", "Pharmacy & Medication Management", "Allied Health", "staff"),
  makeRole("Inventory Pharmacist", "Pharmacy & Medication Management", "Allied Health", "staff"),

  makeRole("Community Health Worker", "Community & Outreach", "External / Community", "staff"),
  makeRole("Health Extension Worker", "Community & Outreach", "External / Community", "staff"),
  makeRole("Outreach Coordinator", "Community & Outreach", "External / Community", "staff"),
  makeRole("Public Health Officer", "Community & Outreach", "External / Community", "staff"),
  makeRole("Epidemiologist", "Community & Outreach", "External / Community", "staff"),

  makeRole("Medical Educator", "Education & Research", "Clinical Staff", "doctor"),
  makeRole("Clinical Trainer", "Education & Research", "Clinical Staff", "staff"),
  makeRole("Research Scientist", "Education & Research", "Clinical Staff", "staff"),
  makeRole("Clinical Trial Coordinator", "Education & Research", "Clinical Staff", "staff"),
  makeRole("Academic Staff", "Education & Research", "Clinical Staff", "staff"),

  makeRole("Legal Advisor", "Legal & Compliance", "Administrative Staff", "admin"),
  makeRole("Compliance Officer", "Legal & Compliance", "Administrative Staff", "admin"),
  makeRole("Risk Manager", "Legal & Compliance", "Administrative Staff", "admin"),
  makeRole("Ethics Committee Member", "Legal & Compliance", "Administrative Staff", "admin"),
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
