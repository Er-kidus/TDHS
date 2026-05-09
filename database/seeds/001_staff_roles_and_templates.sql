-- Seed data: Comprehensive Healthcare Roles and Staff Templates
-- EXECUTION ORDER: This runs SECOND after 00_reset_and_demo_seed.sql
-- Populates all system roles and staff role templates

BEGIN;

-- Ensure compatibility when the DB was created from older migrations.
ALTER TABLE roles ADD COLUMN IF NOT EXISTS description VARCHAR(500);
ALTER TABLE roles ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
ALTER TABLE staff_role_templates ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE staff_role_templates ADD COLUMN IF NOT EXISTS role_group TEXT;
ALTER TABLE staff_role_templates ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE staff_role_templates ADD COLUMN IF NOT EXISTS api_role TEXT;
ALTER TABLE staff_role_templates ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
ALTER TABLE staff_role_templates ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Clean non-admin/non-superadmin role registrations and keep privileged roles.
DELETE FROM user_roles ur
USING roles r
WHERE ur.role_id = r.id
  AND r.name NOT IN ('admin', 'superadmin');

DELETE FROM roles
WHERE name NOT IN ('admin', 'superadmin');

-- 1. Re-register all system roles (comprehensive healthcare role taxonomy)
INSERT INTO roles (name, description, active) VALUES
-- Executive/Governance
('admin_exec', 'Executive Administrator', TRUE),

-- Doctor Roles (General & Hierarchy)
('doctor', 'Doctor/Physician', TRUE),
('doctor_exec', 'Doctor Executive (CMO, Medical Director)', TRUE),
('doctor_gp', 'General Practitioner', TRUE),
('doctor_specialist', 'Specialist/Consultant', TRUE),
('doctor_surgeon', 'Surgeon', TRUE),
('doctor_anes', 'Anesthesiologist', TRUE),
('doctor_icu', 'Intensivist (ICU)', TRUE),
('doctor_radio', 'Radiologist', TRUE),
('doctor_path', 'Pathologist', TRUE),
('doctor_er', 'Emergency Medicine Physician', TRUE),
('doctor_psych', 'Psychiatrist', TRUE),
('doctor_intern', 'Medical Intern', TRUE),
('doctor_resident', 'Medical Resident', TRUE),
('doctor_registrar', 'Medical Registrar', TRUE),
('doctor_senior', 'Attending Physician', TRUE),
('doctor_lead', 'Department Head (HOD)', TRUE),
('doctor_edu', 'Medical Educator', TRUE),
('doctor_student', 'Medical Student', TRUE),

-- Nurse Roles (General & Hierarchy)
('nurse', 'Nurse', TRUE),
('nurse_exec', 'Nurse Executive (CNO, Director)', TRUE),
('nurse_lead', 'Nurse Leader (Manager, Charge Nurse)', TRUE),
('nurse_rn', 'Registered Nurse (RN)', TRUE),
('nurse_enrolled', 'Enrolled Nurse', TRUE),
('nurse_lpn', 'Licensed Practical Nurse (LPN)', TRUE),
('nurse_icu', 'ICU Nurse', TRUE),
('nurse_triage', 'Emergency/Triage Nurse', TRUE),
('nurse_surg', 'Surgical Nurse', TRUE),
('nurse_peds', 'Pediatric Nurse', TRUE),
('nurse_onco', 'Oncology Nurse', TRUE),
('nurse_dialysis', 'Dialysis Nurse', TRUE),
('nurse_staff', 'Infection Control Nurse', TRUE),
('nurse_psych', 'Psychiatric Nurse', TRUE),
('nurse_comm', 'Community Health Nurse', TRUE),
('nurse_midwife', 'Midwife', TRUE),
('nurse_np', 'Nurse Practitioner (NP)', TRUE),
('nurse_spec', 'Clinical Nurse Specialist', TRUE),
('nurse_edu', 'Nurse Educator', TRUE),
('nurse_research', 'Nurse Researcher', TRUE),
('nurse_ward', 'Ward Nurse', TRUE),
('nurse_aide', 'Nurse Assistant / Nursing Aide', TRUE),

-- Lab/Diagnostic Roles
('lab', 'Laboratory Technician', TRUE),
('lab_exec', 'Laboratory Director', TRUE),
('lab_scientist', 'Medical Laboratory Scientist', TRUE),
('lab_technician', 'Lab Technician', TRUE),
('lab_phleb', 'Phlebotomist', TRUE),

-- Pharmacy Roles
('pharm_pharmacist', 'Pharmacist', TRUE),
('pharm_lead', 'Chief Pharmacist', TRUE),
('pharm_tech', 'Pharmacy Technician', TRUE),
('pharm_asst', 'Pharmacy Assistant', TRUE),

-- Allied Health Roles
('allied_physio', 'Physiotherapist', TRUE),
('allied_staff', 'Allied Health Professional', TRUE),
('allied_diet', 'Dietitian/Nutritionist', TRUE),
('allied_psych', 'Psychologist', TRUE),

-- Admin Roles (expanded)
('admin', 'Administrator', TRUE),
('admin_manager', 'Admin Manager', TRUE),
('admin_staff', 'Administrative Staff', TRUE),
('admin_ward', 'Ward Administrator', TRUE),
('admin_records_lead', 'Records Manager', TRUE),
('admin_records', 'Medical Records Officer', TRUE),
('admin_billing', 'Billing Officer', TRUE),
('admin_finance', 'Financial Officer', TRUE),
('admin_hr', 'HR Manager', TRUE),
('admin_legal', 'Legal/Compliance Officer', TRUE),

-- IT Roles
('it_exec', 'IT Executive (CIO/CTO)', TRUE),
('it_admin', 'IT Administrator', TRUE),
('it_staff', 'IT Staff', TRUE),
('it_security', 'Cybersecurity Specialist', TRUE),
('it_data', 'Data Analyst', TRUE),
('it_ai_eng', 'AI/Clinical Decision Support Engineer', TRUE),
('it_biomed', 'Biomedical Engineer', TRUE),

-- Imaging/Diagnostic Roles
('diag_radiographer', 'Radiographer', TRUE),
('diag_radio_tech', 'CT/MRI Technician (Sonographer)', TRUE),

-- Support Staff Roles
('staff', 'Support Staff', TRUE),
('staff_er', 'Emergency Support Staff', TRUE),
('staff_paramedic', 'Paramedic', TRUE),
('staff_care', 'Patient Care Assistant', TRUE),
('staff_logistics', 'Logistics/Transport Staff', TRUE),
('staff_support', 'Support Staff', TRUE),
('staff_security', 'Security Staff', TRUE),
('staff_edu', 'Clinical Trainer', TRUE),
('staff_research', 'Research Staff', TRUE),

-- Community Roles
('comm_worker', 'Community Health Worker', TRUE),
('comm_extension', 'Health Extension Worker', TRUE),
('comm_lead', 'Public Health/Community Lead', TRUE),

-- Reception/Front Desk
('reception', 'Receptionist', TRUE),
('reception_ward', 'Ward Receptionist/Clerk', TRUE),

-- Superadmin (keep at end)
('superadmin', 'Superadmin', TRUE)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  updated_at = NOW();

-- 2. Upsert comprehensive staff templates covering all organizational tiers
INSERT INTO staff_role_templates (template_key, title, description, role_group, category, api_role, active, sort_order) VALUES
-- ===== MEDICAL STAFF (Clinical Tier roles for all health facilities) =====
('med-gp', 'General Practitioner', 'General practice physician', 'Clinical Staff', 'Medical Staff', 'doctor_gp', TRUE, 10),
('med-registrar', 'Medical Registrar', 'Mid-level medical doctor', 'Clinical Staff', 'Medical Staff', 'doctor_registrar', TRUE, 20),
('med-resident', 'Medical Resident', 'Resident physician', 'Clinical Staff', 'Medical Staff', 'doctor_resident', TRUE, 30),
('med-intern', 'Medical Intern', 'Medical intern', 'Clinical Staff', 'Medical Staff', 'doctor_intern', TRUE, 40),
('med-director', 'Medical Director', 'Director of medical services', 'Clinical Staff', 'Medical Staff', 'doctor_exec', TRUE, 5),
('med-hod', 'Department Head (HOD)', 'Department head', 'Clinical Staff', 'Medical Staff', 'doctor_lead', TRUE, 8),

-- ===== MEDICAL SPECIALTIES (for Primary Hospital tier and above) =====
('spec-cardiologist', 'Cardiologist', 'Heart specialist', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', TRUE, 50),
('spec-neurologist', 'Neurologist', 'Nervous system specialist', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', TRUE, 51),
('spec-pediatrician', 'Pediatrician', 'Children''s health specialist', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', TRUE, 52),
('spec-psychiatrist', 'Psychiatrist', 'Mental health specialist', 'Clinical Staff', 'Medical Specialties', 'doctor_psych', TRUE, 53),
('spec-obgyn', 'Obstetrician/Gynecologist', 'Women''s health specialist', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', TRUE, 54),
('spec-dermatologist', 'Dermatologist', 'Skin disease specialist', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', TRUE, 55),
('spec-oncologist', 'Oncologist', 'Cancer specialist', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', TRUE, 56),
('spec-pathologist', 'Pathologist', 'Pathology specialist', 'Clinical Staff', 'Medical Specialties', 'doctor_path', TRUE, 57),

-- ===== SURGICAL STAFF =====
('surg-general', 'General Surgeon', 'General surgery specialist', 'Clinical Staff', 'Surgical Staff', 'doctor_surgeon', TRUE, 60),
('surg-ortho', 'Orthopedic Surgeon', 'Bone and joint specialist', 'Clinical Staff', 'Surgical Staff', 'doctor_surgeon', TRUE, 61),
('surg-cardio', 'Cardiac Surgeon', 'Heart surgery specialist', 'Clinical Staff', 'Surgical Staff', 'doctor_surgeon', TRUE, 62),
('surg-neuro', 'Neurosurgeon', 'Nervous system surgery', 'Clinical Staff', 'Surgical Staff', 'doctor_surgeon', TRUE, 63),

-- ===== PROCEDURAL STAFF =====
('proc-anesthesiologist', 'Anesthesiologist', 'Anesthesia specialist', 'Clinical Staff', 'Procedures', 'doctor_anes', TRUE, 70),
('proc-intensivist', 'Intensivist (ICU)', 'ICU specialist', 'Clinical Staff', 'Procedures', 'doctor_icu', TRUE, 71),
('proc-radiologist', 'Radiologist', 'Imaging specialist', 'Diagnostic Staff', 'Procedures', 'doctor_radio', TRUE, 72),

-- ===== NURSING STAFF - LEADERSHIP =====
('nurse-director', 'Director of Nursing', 'Nursing department director', 'Nursing Staff', 'Nursing Leadership', 'nurse_exec', TRUE, 100),
('nurse-manager', 'Nurse Unit Manager', 'Ward/unit manager', 'Nursing Staff', 'Nursing Leadership', 'nurse_lead', TRUE, 110),
('nurse-charge', 'Charge Nurse', 'Senior ward nurse', 'Nursing Staff', 'Nursing Leadership', 'nurse_lead', TRUE, 120),

-- ===== NURSING STAFF - CLINICAL =====
('nurse-rn', 'Registered Nurse (RN)', 'Registered nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_rn', TRUE, 130),
('nurse-enrolled', 'Enrolled Nurse', 'Enrolled nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_enrolled', TRUE, 140),
('nurse-lpn', 'Licensed Practical Nurse', 'Practical nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_lpn', TRUE, 150),

-- ===== NURSING STAFF - SPECIALTIES =====
('nurse-icu', 'ICU Nurse', 'Intensive care nurse', 'Nursing Staff', 'Nursing Specialties', 'nurse_icu', TRUE, 160),
('nurse-triage', 'Emergency/Triage Nurse', 'Emergency department nurse', 'Nursing Staff', 'Nursing Specialties', 'nurse_triage', TRUE, 161),
('nurse-surgical', 'Surgical Nurse', 'Operating room nurse', 'Nursing Staff', 'Nursing Specialties', 'nurse_surg', TRUE, 162),
('nurse-peds', 'Pediatric Nurse', 'Children''s ward nurse', 'Nursing Staff', 'Nursing Specialties', 'nurse_peds', TRUE, 163),
('nurse-midwife', 'Midwife', 'Maternity specialist', 'Nursing Staff', 'Nursing Specialties', 'nurse_midwife', TRUE, 164),
('nurse-community', 'Community Health Nurse', 'Community nursing', 'Nursing Staff', 'Nursing Specialties', 'nurse_comm', TRUE, 165),

-- ===== NURSING STAFF - ADVANCED PRACTICE =====
('nurse-np', 'Nurse Practitioner', 'Advanced practice nurse', 'Nursing Staff', 'Nursing Advanced', 'nurse_np', TRUE, 170),
('nurse-specialist', 'Clinical Nurse Specialist', 'Specialty nurse', 'Nursing Staff', 'Nursing Advanced', 'nurse_spec', TRUE, 171),

-- ===== NURSING SUPPORT =====
('nurse-aide', 'Nursing Aide', 'Nursing support staff', 'Nursing Staff', 'Nursing Support', 'nurse_aide', TRUE, 180),

-- ===== LABORATORY & DIAGNOSTIC =====
('diag-lab-scientist', 'Medical Laboratory Scientist', 'Lab scientist', 'Diagnostic Staff', 'Laboratory', 'lab_scientist', TRUE, 200),
('diag-lab-tech', 'Lab Technician', 'Laboratory technician', 'Diagnostic Staff', 'Laboratory', 'lab_technician', TRUE, 210),
('diag-phleb', 'Phlebotomist', 'Blood collection specialist', 'Diagnostic Staff', 'Laboratory', 'lab_phleb', TRUE, 220),
('diag-radiographer', 'Radiographer', 'Imaging technician', 'Diagnostic Staff', 'Imaging', 'diag_radiographer', TRUE, 230),
('diag-imaging-tech', 'CT/MRI Technician', 'Advanced imaging technician', 'Diagnostic Staff', 'Imaging', 'diag_radio_tech', TRUE, 240),

-- ===== PHARMACY =====
('pharm-chief', 'Chief Pharmacist', 'Chief pharmacist', 'Allied Health', 'Pharmacy', 'pharm_lead', TRUE, 250),
('pharm-dispensing', 'Dispensing Pharmacist', 'Dispensing pharmacist', 'Allied Health', 'Pharmacy', 'pharm_pharmacist', TRUE, 260),
('pharm-tech', 'Pharmacy Technician', 'Pharmacy technician', 'Allied Health', 'Pharmacy', 'pharm_tech', TRUE, 270),

-- ===== ALLIED HEALTH =====
('allied-physio', 'Physiotherapist', 'Physical therapy specialist', 'Allied Health', 'Allied Health', 'allied_physio', TRUE, 300),
('allied-dietitian', 'Dietitian', 'Nutrition specialist', 'Allied Health', 'Allied Health', 'allied_diet', TRUE, 310),
('allied-psychologist', 'Psychologist', 'Mental health professional', 'Allied Health', 'Allied Health', 'allied_psych', TRUE, 320),
('allied-radiotherapist', 'Radiotherapist', 'Radiation therapy specialist', 'Allied Health', 'Allied Health', 'allied_staff', TRUE, 330),

-- ===== WARD ADMINISTRATION =====
('ward-clerk', 'Ward Clerk / Receptionist', 'Ward administrative staff', 'Administrative Staff', 'Ward', 'reception_ward', TRUE, 400),
('ward-patient-asst', 'Patient Care Assistant', 'Patient care support', 'Administrative Staff', 'Ward', 'staff_care', TRUE, 410),
('ward-bed-manager', 'Bed Manager', 'Ward bed management', 'Administrative Staff', 'Ward', 'admin_ward', TRUE, 420),

-- ===== ADMINISTRATION - SENIOR =====
('admin-ceo', 'Chief Executive Officer', 'Executive leadership', 'Administrative Staff', 'Governance', 'admin_exec', TRUE, 50),
('admin-hospital', 'Hospital Administrator', 'Hospital administration', 'Administrative Staff', 'Administration', 'admin_manager', TRUE, 500),
('admin-ops-manager', 'Operations Manager', 'Operations management', 'Administrative Staff', 'Administration', 'admin_manager', TRUE, 510),

-- ===== ADMINISTRATION - MIDDLE =====
('admin-hr-manager', 'HR Manager', 'Human resources management', 'Administrative Staff', 'HR', 'admin_hr', TRUE, 520),
('admin-finance-manager', 'Finance Manager', 'Financial management', 'Administrative Staff', 'Finance', 'admin_finance', TRUE, 530),
('admin-records-manager', 'Medical Records Manager', 'Records department management', 'Administrative Staff', 'Records', 'admin_records_lead', TRUE, 540),

-- ===== ADMINISTRATION - STAFF =====
('admin-records', 'Medical Records Officer', 'Medical records management', 'Administrative Staff', 'Records', 'admin_records', TRUE, 550),
('admin-billing', 'Billing Officer', 'Patient billing', 'Administrative Staff', 'Finance', 'admin_billing', TRUE, 560),
('admin-staff', 'Administrative Staff', 'General administrative work', 'Administrative Staff', 'Administration', 'admin_staff', TRUE, 570),

-- ===== IT & DIGITAL HEALTH =====
('it-exec', 'IT Director', 'IT department leadership', 'IT & System', 'IT Leadership', 'it_exec', TRUE, 600),
('it-sys-admin', 'System Administrator', 'IT system administration', 'IT & System', 'IT', 'it_admin', TRUE, 610),
('it-emr-admin', 'EMR/EHR Administrator', 'Electronic health record administration', 'IT & System', 'IT', 'it_admin', TRUE, 620),
('it-cyber-spec', 'Cybersecurity Specialist', 'Cybersecurity management', 'IT & System', 'IT', 'it_security', TRUE, 630),
('it-data-analyst', 'Data Analyst', 'Data analysis and reporting', 'IT & System', 'IT', 'it_data', TRUE, 640),

-- ===== SUPPORT & FACILITY =====
('support-housekeeping', 'Housekeeping Staff', 'Facility housekeeping', 'Support Staff', 'Facility', 'staff_support', TRUE, 700),
('support-security', 'Security Guard', 'Facility security', 'Support Staff', 'Security', 'staff_security', TRUE, 710),
('support-logistics', 'Logistics/Transport Staff', 'Supply chain and transport', 'Support Staff', 'Logistics', 'staff_logistics', TRUE, 720),
('support-paramedic', 'Paramedic', 'Emergency medical services', 'Support Staff', 'Support', 'staff_paramedic', TRUE, 730),

-- ===== COMMUNITY HEALTH =====
('comm-health-worker', 'Community Health Worker', 'Community-based health work', 'Community Staff', 'Community', 'comm_worker', TRUE, 800),
('comm-extension-worker', 'Health Extension Worker', 'Primary health extension', 'Community Staff', 'Community', 'comm_extension', TRUE, 810),

-- ===== RECEPTION/FRONT DESK =====
('reception-receptionist', 'Receptionist', 'Front desk reception', 'Administrative Staff', 'Reception', 'reception', TRUE, 900)

ON CONFLICT (template_key) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  role_group = EXCLUDED.role_group,
  category = EXCLUDED.category,
  api_role = EXCLUDED.api_role,
  active = EXCLUDED.active,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

COMMIT;
