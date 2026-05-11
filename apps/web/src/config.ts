// Application configuration with comprehensive staff templates

export const API_BASE_URL =
  process.env.VITE_API_BASE_URL || "http://localhost:3000";

export const APP_NAME = "Tenadam EMR";

// Comprehensive staff template to system role mappings
export const STAFF_TEMPLATES = [
  // Clinical - Doctor Roles
  { key: "med-gp", label: "General Practitioner", category: "Medical Staff", systemRole: "doctor_gp" },
  { key: "medical-consultant", label: "Consultant (Specialist)", category: "Medical Staff", systemRole: "doctor_specialist" },
  { key: "med-registrar", label: "Registrar", category: "Medical Staff", systemRole: "doctor_registrar" },
  { key: "med-resident", label: "Resident", category: "Medical Staff", systemRole: "doctor_resident" },
  { key: "med-intern", label: "Intern", category: "Medical Staff", systemRole: "doctor_intern" },
  { key: "med-director", label: "Medical Director", category: "Medical Staff", systemRole: "doctor_exec" },
  { key: "med-hod", label: "Department Head (HOD)", category: "Medical Staff", systemRole: "doctor_lead" },
  
  // Specialists
  { key: "spec-cardiologist", label: "Cardiologist", category: "Medical Specialties", systemRole: "doctor_specialist" },
  { key: "spec-neurologist", label: "Neurologist", category: "Medical Specialties", systemRole: "doctor_specialist" },
  { key: "spec-dermatologist", label: "Dermatologist", category: "Medical Specialties", systemRole: "doctor_specialist" },
  { key: "spec-pediatrician", label: "Pediatrician", category: "Medical Specialties", systemRole: "doctor_specialist" },
  { key: "spec-psychiatrist", label: "Psychiatrist", category: "Medical Specialties", systemRole: "doctor_psych" },
  { key: "spec-oncologist", label: "Oncologist", category: "Medical Specialties", systemRole: "doctor_specialist" },
  
  // Surgeons
  { key: "surg-general", label: "General Surgeon", category: "Surgical Staff", systemRole: "doctor_surgeon" },
  { key: "surg-ortho", label: "Orthopedic Surgeon", category: "Surgical Staff", systemRole: "doctor_surgeon" },
  { key: "surg-neuro", label: "Neurosurgeon", category: "Surgical Staff", systemRole: "doctor_surgeon" },
  { key: "surg-obgyn", label: "Obstetrician/Gynecologist", category: "Surgical Staff", systemRole: "doctor_surgeon" },
  
  // Procedure-Based
  { key: "proc-anesthesiologist", label: "Anesthesiologist", category: "Procedures", systemRole: "doctor_anes" },
  { key: "proc-intensivist", label: "Intensivist (ICU)", category: "Procedures", systemRole: "doctor_icu" },
  
  // Nursing Roles
  { key: "nurse-director", label: "Director of Nursing", category: "Nursing Staff", systemRole: "nurse_exec" },
  { key: "nurse-manager", label: "Nurse Unit Manager (Ward Manager)", category: "Nursing Staff", systemRole: "nurse_lead" },
  { key: "nurse-asst-manager", label: "Assistant Nurse Manager", category: "Nursing Staff", systemRole: "nurse_lead" },
  { key: "nurse-rn", label: "Registered Nurse (RN)", category: "Nursing Staff", systemRole: "nurse_rn" },
  { key: "nurse-enrolled", label: "Enrolled Nurse", category: "Nursing Staff", systemRole: "nurse_enrolled" },
  { key: "nurse-lpn", label: "Licensed Practical Nurse (LPN)", category: "Nursing Staff", systemRole: "nurse_lpn" },
  { key: "nurse-icu", label: "ICU Nurse", category: "Nursing Staff", systemRole: "nurse_icu" },
  { key: "nurse-triage", label: "Emergency/Triage Nurse", category: "Nursing Staff", systemRole: "nurse_triage" },
  { key: "nurse-surgical", label: "Surgical Nurse", category: "Nursing Staff", systemRole: "nurse_surg" },
  { key: "nurse-peds", label: "Pediatric Nurse", category: "Nursing Staff", systemRole: "nurse_peds" },
  { key: "nurse-midwife", label: "Midwife", category: "Nursing Staff", systemRole: "nurse_midwife" },
  { key: "nurse-np", label: "Nurse Practitioner (NP)", category: "Nursing Staff", systemRole: "nurse_np" },
  { key: "nurse-aide", label: "Nurse Assistant / Nursing Aide", category: "Nursing Staff", systemRole: "nurse_aide" },
  
  // Laboratory & Diagnostic
  { key: "diag-lab-scientist", label: "Medical Laboratory Scientist", category: "Laboratory", systemRole: "lab_scientist" },
  { key: "diag-lab-tech", label: "Lab Technician", category: "Laboratory", systemRole: "lab_technician" },
  { key: "diag-phleb", label: "Phlebotomist", category: "Laboratory", systemRole: "lab_phleb" },
  { key: "diag-radiographer", label: "Radiographer", category: "Imaging", systemRole: "diag_radiographer" },
  
  // Pharmacy
  { key: "pharm-chief", label: "Chief Pharmacist", category: "Pharmacy", systemRole: "pharm_lead" },
  { key: "pharm-dispensing", label: "Dispensing Pharmacist", category: "Pharmacy", systemRole: "pharm_pharmacist" },
  { key: "allied-pharm-tech", label: "Pharmacy Technician", category: "Allied Health", systemRole: "pharm_tech" },
  
  // Allied Health
  { key: "allied-physio", label: "Physiotherapist", category: "Allied Health", systemRole: "allied_physio" },
  { key: "allied-dietitian", label: "Dietitian", category: "Allied Health", systemRole: "allied_diet" },
  { key: "allied-psychologist", label: "Psychologist", category: "Allied Health", systemRole: "allied_psych" },
  
  // Reception & Ward
  { key: "ward-clerk", label: "Ward Clerk / Receptionist", category: "Ward", systemRole: "reception_ward" },
  { key: "ward-patient-asst", label: "Patient Care Assistant", category: "Ward", systemRole: "staff_care" },
  { key: "ward-healthcare-asst", label: "Healthcare Assistant", category: "Ward", systemRole: "staff_care" },
  { key: "ward-bed-manager", label: "Bed Manager", category: "Ward", systemRole: "admin_ward" },
  
  // Administration
  { key: "admin-hospital", label: "Hospital Administrator", category: "Admin", systemRole: "admin_manager" },
  { key: "admin-ops-manager", label: "Operations Manager", category: "Admin", systemRole: "admin_manager" },
  { key: "admin-hr-manager", label: "HR Manager", category: "HR", systemRole: "admin_hr" },
  
  // IT & Digital Health
  { key: "it-sys-admin", label: "System Administrator", category: "IT", systemRole: "it_admin" },
  { key: "it-emr-admin", label: "EMR/EHR Administrator", category: "IT", systemRole: "it_admin" },
  { key: "it-cyber-spec", label: "Cybersecurity Specialist", category: "IT", systemRole: "it_security" },
  
  // Support & Facility
  { key: "support-housekeeping", label: "Cleaner / Housekeeping Staff", category: "Facility", systemRole: "staff_support" },
  { key: "support-security", label: "Security Guard", category: "Security", systemRole: "staff_security" },
  { key: "support-store-mgr", label: "Store Manager", category: "Logistics", systemRole: "staff_logistics" },
  
  // Governance & Executive
  { key: "gov-ceo", label: "Chief Executive Officer (CEO)", category: "Governance", systemRole: "admin_exec" },
  { key: "gov-cmo", label: "Chief Medical Officer (CMO)", category: "Governance", systemRole: "doctor_exec" },
  { key: "gov-cno", label: "Chief Nursing Officer (CNO)", category: "Governance", systemRole: "nurse_exec" },
  { key: "governance-board-directors", label: "Board of Directors", category: "Governance", systemRole: "admin" },
] as const;

export type StaffTemplateKey = (typeof STAFF_TEMPLATES)[number]["key"];

export function getSystemRole(templateKey: string): string | undefined {
  const template = STAFF_TEMPLATES.find((t) => t.key === templateKey);
  return template?.systemRole;
}

export function getTemplateLabel(templateKey: string): string | undefined {
  const template = STAFF_TEMPLATES.find((t) => t.key === templateKey);
  return template?.label;
}

export function getTemplatesByCategory(category?: string) {
  if (!category) return STAFF_TEMPLATES;
  return STAFF_TEMPLATES.filter((t) => t.category === category);
}

export function getAllCategories() {
  return Array.from(new Set(STAFF_TEMPLATES.map((t) => t.category)));
}
