-- Seed data: Comprehensive Healthcare Roles and Staff Templates
-- Resets non-admin role registrations and re-registers canonical roles/templates.

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

-- 1. Re-register all system roles
INSERT INTO roles (name, description, active) VALUES
-- Executive/Governance
('admin_exec', 'Executive Administrator', TRUE),
-- Doctor Roles
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
-- Nurse Roles
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
-- Admin Roles
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
-- Superadmin
('superadmin', 'Superadmin', TRUE)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    active = EXCLUDED.active,
    updated_at = NOW();

-- 2. Upsert core staff templates (focused on most common roles)
INSERT INTO staff_role_templates (template_key, title, description, role_group, category, api_role, active) VALUES
-- Medical Staff
('med-gp', 'General Practitioner', 'General practice physician', 'Clinical Staff', 'Medical Staff', 'doctor_gp', TRUE),
('med-registrar', 'Medical Registrar', 'Mid-level medical doctor', 'Clinical Staff', 'Medical Staff', 'doctor_registrar', TRUE),
('med-resident', 'Medical Resident', 'Resident physician', 'Clinical Staff', 'Medical Staff', 'doctor_resident', TRUE),
('med-intern', 'Medical Intern', 'Medical intern', 'Clinical Staff', 'Medical Staff', 'doctor_intern', TRUE),
('med-director', 'Medical Director', 'Director of medical services', 'Clinical Staff', 'Medical Staff', 'doctor_exec', TRUE),
('med-hod', 'Department Head (HOD)', 'Department head', 'Clinical Staff', 'Medical Staff', 'doctor_lead', TRUE),
('spec-cardiologist', 'Cardiologist', 'Heart specialist', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', TRUE),
('spec-neurologist', 'Neurologist', 'Nervous system specialist', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', TRUE),
('spec-pediatrician', 'Pediatrician', 'Children''s health specialist', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', TRUE),
('spec-psychiatrist', 'Psychiatrist', 'Mental health specialist', 'Clinical Staff', 'Medical Specialties', 'doctor_psych', TRUE),
('surg-general', 'General Surgeon', 'General surgery specialist', 'Clinical Staff', 'Surgical Staff', 'doctor_surgeon', TRUE),
('surg-ortho', 'Orthopedic Surgeon', 'Bone and joint specialist', 'Clinical Staff', 'Surgical Staff', 'doctor_surgeon', TRUE),
('surg-obgyn', 'Obstetrician/Gynecologist', 'Women''s health specialist', 'Clinical Staff', 'Surgical Staff', 'doctor_surgeon', TRUE),
('proc-anesthesiologist', 'Anesthesiologist', 'Anesthesia specialist', 'Clinical Staff', 'Procedures', 'doctor_anes', TRUE),
('proc-intensivist', 'Intensivist (ICU)', 'ICU specialist', 'Clinical Staff', 'Procedures', 'doctor_icu', TRUE),
('proc-radiologist', 'Radiologist', 'Imaging specialist', 'Diagnostic Staff', 'Procedures', 'doctor_radio', TRUE),
-- Nursing Staff
('nurse-director', 'Director of Nursing', 'Nursing department director', 'Nursing Staff', 'Nursing Staff', 'nurse_exec', TRUE),
('nurse-manager', 'Nurse Unit Manager', 'Ward/unit manager', 'Nursing Staff', 'Nursing Staff', 'nurse_lead', TRUE),
('nurse-rn', 'Registered Nurse (RN)', 'Registered nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_rn', TRUE),
('nurse-enrolled', 'Enrolled Nurse', 'Enrolled nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_enrolled', TRUE),
('nurse-lpn', 'Licensed Practical Nurse', 'Practical nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_lpn', TRUE),
('nurse-icu', 'ICU Nurse', 'Intensive care nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_icu', TRUE),
('nurse-triage', 'Emergency/Triage Nurse', 'Emergency department nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_triage', TRUE),
('nurse-surgical', 'Surgical Nurse', 'Operating room nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_surg', TRUE),
('nurse-peds', 'Pediatric Nurse', 'Children''s ward nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_peds', TRUE),
('nurse-midwife', 'Midwife', 'Maternity specialist', 'Nursing Staff', 'Nursing Staff', 'nurse_midwife', TRUE),
('nurse-np', 'Nurse Practitioner', 'Advanced practice nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_np', TRUE),
('nurse-aide', 'Nursing Aide', 'Nursing support staff', 'Nursing Staff', 'Nursing Staff', 'nurse_aide', TRUE),
-- Laboratory & Diagnostic
('diag-lab-scientist', 'Medical Laboratory Scientist', 'Lab scientist', 'Diagnostic Staff', 'Laboratory', 'lab_scientist', TRUE),
('diag-lab-tech', 'Lab Technician', 'Laboratory technician', 'Diagnostic Staff', 'Laboratory', 'lab_technician', TRUE),
('diag-phleb', 'Phlebotomist', 'Blood collection specialist', 'Diagnostic Staff', 'Laboratory', 'lab_phleb', TRUE),
('diag-radiographer', 'Radiographer', 'Imaging technician', 'Diagnostic Staff', 'Imaging', 'diag_radiographer', TRUE),
('diag-imaging-tech', 'CT/MRI Technician', 'Advanced imaging technician', 'Diagnostic Staff', 'Imaging', 'diag_radio_tech', TRUE),
-- Pharmacy
('pharm-chief', 'Chief Pharmacist', 'Chief pharmacist', 'Allied Health', 'Pharmacy', 'pharm_lead', TRUE),
('pharm-dispensing', 'Dispensing Pharmacist', 'Dispensing pharmacist', 'Allied Health', 'Pharmacy', 'pharm_pharmacist', TRUE),
('pharm-tech', 'Pharmacy Technician', 'Pharmacy technician', 'Allied Health', 'Pharmacy', 'pharm_tech', TRUE),
-- Allied Health
('allied-physio', 'Physiotherapist', 'Physical therapy specialist', 'Allied Health', 'Allied Health', 'allied_physio', TRUE),
('allied-dietitian', 'Dietitian', 'Nutrition specialist', 'Allied Health', 'Allied Health', 'allied_diet', TRUE),
('allied-psychologist', 'Psychologist', 'Mental health professional', 'Allied Health', 'Allied Health', 'allied_psych', TRUE),
-- Ward Support
('ward-clerk', 'Ward Clerk / Receptionist', 'Ward administrative staff', 'Support Staff', 'Ward', 'reception_ward', TRUE),
('ward-patient-asst', 'Patient Care Assistant', 'Patient care support', 'Support Staff', 'Ward', 'staff_care', TRUE),
('ward-healthcare-asst', 'Healthcare Assistant', 'Healthcare support staff', 'Support Staff', 'Ward', 'staff_care', TRUE),
('ward-bed-manager', 'Bed Manager', 'Ward bed management', 'Administrative Staff', 'Ward', 'admin_ward', TRUE),
-- Administration
('admin-hospital', 'Hospital Administrator', 'Hospital administration', 'Administrative Staff', 'Admin', 'admin_manager', TRUE),
('admin-ops-manager', 'Operations Manager', 'Operations management', 'Administrative Staff', 'Admin', 'admin_manager', TRUE),
('admin-hr-manager', 'HR Manager', 'Human resources management', 'Administrative Staff', 'HR', 'admin_hr', TRUE),
('admin-records', 'Medical Records Officer', 'Medical records management', 'Administrative Staff', 'Records', 'admin_records', TRUE),
-- IT & Digital Health
('it-sys-admin', 'System Administrator', 'IT system administration', 'IT & System', 'IT', 'it_admin', TRUE),
('it-emr-admin', 'EMR/EHR Administrator', 'Electronic health record administration', 'IT & System', 'IT', 'it_admin', TRUE),
('it-cyber-spec', 'Cybersecurity Specialist', 'Cybersecurity management', 'IT & System', 'IT', 'it_security', TRUE),
-- Support & Facility
('support-housekeeping', 'Housekeeping Staff', 'Facility housekeeping', 'Support Staff', 'Facility', 'staff_support', TRUE),
('support-security', 'Security Guard', 'Facility security', 'Support Staff', 'Security', 'staff_security', TRUE),
('support-store-mgr', 'Store Manager', 'Supply chain management', 'Support Staff', 'Logistics', 'staff_logistics', TRUE),
-- Governance & Executive
('gov-ceo', 'Chief Executive Officer', 'Executive leadership', 'Administrative Staff', 'Governance', 'admin_exec', TRUE),
('gov-cmo', 'Chief Medical Officer', 'Medical leadership', 'Clinical Staff', 'Governance', 'doctor_exec', TRUE),
('gov-cno', 'Chief Nursing Officer', 'Nursing leadership', 'Nursing Staff', 'Governance', 'nurse_exec', TRUE),
('governance-board-directors', 'Board of Directors', 'Board governance', 'Administrative Staff', 'Governance', 'admin', TRUE)
ON CONFLICT (template_key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    role_group = EXCLUDED.role_group,
    category = EXCLUDED.category,
    api_role = EXCLUDED.api_role,
    active = EXCLUDED.active,
    updated_at = NOW();

COMMIT;
