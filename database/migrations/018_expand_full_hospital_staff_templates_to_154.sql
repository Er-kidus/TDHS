-- 018_expand_full_hospital_staff_templates_to_154.sql
-- Canonical seed for Tenadam EMR roles with granular API identifiers.

INSERT INTO staff_role_templates (template_key, title, role_group, category, api_role, description, sort_order, active)
VALUES
  -- 1. GOVERNANCE & EXECUTIVE LEADERSHIP
  ('gov-board-directors', 'Board of Directors', 'Administrative Staff', 'Governance', 'admin_exec', 'Standardized EMR role', 1, TRUE),
  ('gov-trustees', 'Trustees', 'Administrative Staff', 'Governance', 'admin_exec', 'Standardized EMR role', 2, TRUE),
  ('gov-owners', 'Hospital Owners', 'Administrative Staff', 'Governance', 'admin_exec', 'Standardized EMR role', 3, TRUE),
  ('gov-ceo', 'Chief Executive Officer (CEO)', 'Administrative Staff', 'Governance', 'admin_exec', 'Standardized EMR role', 4, TRUE),
  ('gov-coo', 'Chief Operating Officer (COO)', 'Administrative Staff', 'Governance', 'admin_exec', 'Standardized EMR role', 5, TRUE),
  ('gov-cmo', 'Chief Medical Officer (CMO)', 'Clinical Staff', 'Governance', 'doctor_exec', 'Standardized EMR role', 6, TRUE),
  ('gov-cno', 'Chief Nursing Officer (CNO)', 'Nursing Staff', 'Governance', 'nurse_exec', 'Standardized EMR role', 7, TRUE),
  ('gov-cfo', 'Chief Financial Officer (CFO)', 'Administrative Staff', 'Governance', 'admin_exec', 'Standardized EMR role', 8, TRUE),
  ('gov-cio', 'Chief Information Officer (CIO)', 'IT & System', 'Governance', 'it_exec', 'Standardized EMR role', 9, TRUE),
  ('gov-cto', 'Chief Technology Officer (CTO)', 'IT & System', 'Governance', 'it_exec', 'Standardized EMR role', 10, TRUE),
  ('gov-chro', 'Chief Human Resources Officer (CHRO)', 'Administrative Staff', 'Governance', 'admin_exec', 'Standardized EMR role', 11, TRUE),
  ('gov-compliance-chief', 'Chief Compliance Officer', 'Administrative Staff', 'Governance', 'admin_exec', 'Standardized EMR role', 12, TRUE),

  -- 2. MEDICAL STAFF (GENERAL & LEADERSHIP)
  ('med-director', 'Medical Director', 'Clinical Staff', 'Medical Staff', 'doctor_exec', 'Standardized EMR role', 13, TRUE),
  ('med-hod', 'Department Head (HOD)', 'Clinical Staff', 'Medical Staff', 'doctor_lead', 'Standardized EMR role', 14, TRUE),
  ('med-gp', 'General Practitioner (GP)', 'Clinical Staff', 'Medical Staff', 'doctor_gp', 'Standardized EMR role', 15, TRUE),
  ('med-attending', 'Attending Physician', 'Clinical Staff', 'Medical Staff', 'doctor_senior', 'Standardized EMR role', 16, TRUE),
  ('med-consultant', 'Consultant (Specialist)', 'Clinical Staff', 'Medical Staff', 'doctor_specialist', 'Standardized EMR role', 17, TRUE),
  ('med-registrar', 'Registrar', 'Clinical Staff', 'Medical Staff', 'doctor_registrar', 'Standardized EMR role', 18, TRUE),
  ('med-resident', 'Resident', 'Clinical Staff', 'Medical Staff', 'doctor_resident', 'Standardized EMR role', 19, TRUE),
  ('med-intern', 'Intern', 'Clinical Staff', 'Medical Staff', 'doctor_intern', 'Standardized EMR role', 20, TRUE),
  ('med-student', 'Medical Student', 'Clinical Staff', 'Medical Staff', 'doctor_student', 'Standardized EMR role', 21, TRUE),

  -- 3. MEDICAL SPECIALTIES
  ('spec-cardiologist', 'Cardiologist', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', 'Standardized EMR role', 22, TRUE),
  ('spec-neurologist', 'Neurologist', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', 'Standardized EMR role', 23, TRUE),
  ('spec-dermatologist', 'Dermatologist', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', 'Standardized EMR role', 24, TRUE),
  ('spec-pediatrician', 'Pediatrician', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', 'Standardized EMR role', 25, TRUE),
  ('spec-psychiatrist', 'Psychiatrist', 'Clinical Staff', 'Medical Specialties', 'doctor_psych', 'Standardized EMR role', 26, TRUE),
  ('spec-oncologist', 'Oncologist', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', 'Standardized EMR role', 27, TRUE),
  ('spec-endocrinologist', 'Endocrinologist', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', 'Standardized EMR role', 28, TRUE),
  ('spec-gastro', 'Gastroenterologist', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', 'Standardized EMR role', 29, TRUE),
  ('spec-pulmonologist', 'Pulmonologist', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', 'Standardized EMR role', 30, TRUE),
  ('spec-nephrologist', 'Nephrologist', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', 'Standardized EMR role', 31, TRUE),
  ('spec-infectious', 'Infectious Disease Specialist', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', 'Standardized EMR role', 32, TRUE),
  ('spec-er-physician', 'Emergency Medicine Physician', 'Clinical Staff', 'Medical Specialties', 'doctor_er', 'Standardized EMR role', 33, TRUE),

  -- 4. SURGICAL STAFF
  ('surg-general', 'General Surgeon', 'Clinical Staff', 'Surgical Staff', 'doctor_surgeon', 'Standardized EMR role', 34, TRUE),
  ('surg-ortho', 'Orthopedic Surgeon', 'Clinical Staff', 'Surgical Staff', 'doctor_surgeon', 'Standardized EMR role', 35, TRUE),
  ('surg-neuro', 'Neurosurgeon', 'Clinical Staff', 'Surgical Staff', 'doctor_surgeon', 'Standardized EMR role', 36, TRUE),
  ('surg-cardio', 'Cardiothoracic Surgeon', 'Clinical Staff', 'Surgical Staff', 'doctor_surgeon', 'Standardized EMR role', 37, TRUE),
  ('surg-plastic', 'Plastic Surgeon', 'Clinical Staff', 'Surgical Staff', 'doctor_surgeon', 'Standardized EMR role', 38, TRUE),
  ('surg-urologist', 'Urologist', 'Clinical Staff', 'Surgical Staff', 'doctor_surgeon', 'Standardized EMR role', 39, TRUE),
  ('surg-obgyn', 'Obstetrician/Gynecologist (OB/GYN)', 'Clinical Staff', 'Surgical Staff', 'doctor_surgeon', 'Standardized EMR role', 40, TRUE),

  -- 5. PROCEDURE SPECIALISTS
  ('proc-anesthesiologist', 'Anesthesiologist', 'Clinical Staff', 'Procedures', 'doctor_anes', 'Standardized EMR role', 41, TRUE),
  ('proc-intensivist', 'Intensivist (ICU)', 'Clinical Staff', 'Procedures', 'doctor_icu', 'Standardized EMR role', 42, TRUE),
  ('proc-radiologist', 'Radiologist', 'Diagnostic Staff', 'Procedures', 'doctor_radio', 'Standardized EMR role', 43, TRUE),
  ('proc-pathologist', 'Pathologist', 'Diagnostic Staff', 'Procedures', 'doctor_path', 'Standardized EMR role', 44, TRUE),

  -- 6. NURSING STAFF (LEADERSHIP & CORE)
  ('nurse-director', 'Director of Nursing', 'Nursing Staff', 'Nursing Staff', 'nurse_exec', 'Standardized EMR role', 45, TRUE),
  ('nurse-manager', 'Nurse Unit Manager (Ward Manager)', 'Nursing Staff', 'Nursing Staff', 'nurse_lead', 'Standardized EMR role', 46, TRUE),
  ('nurse-asst-manager', 'Assistant Nurse Manager', 'Nursing Staff', 'Nursing Staff', 'nurse_lead', 'Standardized EMR role', 47, TRUE),
  ('nurse-rn', 'Registered Nurse (RN)', 'Nursing Staff', 'Nursing Staff', 'nurse_rn', 'Standardized EMR role', 48, TRUE),
  ('nurse-enrolled', 'Enrolled Nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_enrolled', 'Standardized EMR role', 49, TRUE),
  ('nurse-lpn', 'Licensed Practical Nurse (LPN)', 'Nursing Staff', 'Nursing Staff', 'nurse_lpn', 'Standardized EMR role', 50, TRUE),

  -- 7. SPECIALIZED NURSING
  ('nurse-icu', 'ICU Nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_icu', 'Standardized EMR role', 51, TRUE),
  ('nurse-triage', 'Emergency/Triage Nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_triage', 'Standardized EMR role', 52, TRUE),
  ('nurse-surgical', 'Surgical Nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_surg', 'Standardized EMR role', 53, TRUE),
  ('nurse-peds', 'Pediatric Nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_peds', 'Standardized EMR role', 54, TRUE),
  ('nurse-oncology', 'Oncology Nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_onco', 'Standardized EMR role', 55, TRUE),
  ('nurse-dialysis', 'Dialysis Nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_dialysis', 'Standardized EMR role', 56, TRUE),
  ('nurse-infection', 'Infection Control Nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_staff', 'Standardized EMR role', 57, TRUE),
  ('nurse-psych', 'Psychiatric Nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_psych', 'Standardized EMR role', 58, TRUE),
  ('nurse-comm', 'Community Health Nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_comm', 'Standardized EMR role', 59, TRUE),
  ('nurse-midwife', 'Midwife', 'Nursing Staff', 'Nursing Staff', 'nurse_midwife', 'Standardized EMR role', 60, TRUE),

  -- 8. ADVANCED & WARD NURSING
  ('nurse-np', 'Nurse Practitioner (NP)', 'Nursing Staff', 'Nursing Staff', 'nurse_np', 'Standardized EMR role', 61, TRUE),
  ('nurse-clinical-spec', 'Clinical Nurse Specialist', 'Nursing Staff', 'Nursing Staff', 'nurse_spec', 'Standardized EMR role', 62, TRUE),
  ('nurse-educator', 'Nurse Educator', 'Nursing Staff', 'Nursing Staff', 'nurse_edu', 'Standardized EMR role', 63, TRUE),
  ('nurse-researcher', 'Nurse Researcher', 'Nursing Staff', 'Nursing Staff', 'nurse_research', 'Standardized EMR role', 64, TRUE),
  ('nurse-ward', 'Ward Nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_ward', 'Standardized EMR role', 65, TRUE),
  ('nurse-charge', 'Charge Nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_lead', 'Standardized EMR role', 66, TRUE),
  ('nurse-bedside', 'Bedside Nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_ward', 'Standardized EMR role', 67, TRUE),
  ('nurse-aide', 'Nurse Assistant / Nursing Aide', 'Nursing Staff', 'Nursing Staff', 'nurse_aide', 'Standardized EMR role', 68, TRUE),

  -- 9. ALLIED HEALTH
  ('allied-physio', 'Physiotherapist', 'Allied Health', 'Allied Health', 'allied_physio', 'Standardized EMR role', 69, TRUE),
  ('allied-occupational', 'Occupational Therapist', 'Allied Health', 'Allied Health', 'allied_staff', 'Standardized EMR role', 70, TRUE),
  ('allied-speech', 'Speech & Language Therapist', 'Allied Health', 'Allied Health', 'allied_staff', 'Standardized EMR role', 71, TRUE),
  ('allied-respiratory', 'Respiratory Therapist', 'Allied Health', 'Allied Health', 'allied_staff', 'Standardized EMR role', 72, TRUE),
  ('allied-dietitian', 'Dietitian', 'Allied Health', 'Allied Health', 'allied_diet', 'Standardized EMR role', 73, TRUE),
  ('allied-nutritionist', 'Nutritionist', 'Allied Health', 'Allied Health', 'allied_diet', 'Standardized EMR role', 74, TRUE),
  ('allied-pharmacist', 'Pharmacist', 'Allied Health', 'Allied Health', 'pharm_pharmacist', 'Standardized EMR role', 75, TRUE),
  ('allied-clin-pharm', 'Clinical Pharmacist', 'Allied Health', 'Allied Health', 'pharm_pharmacist', 'Standardized EMR role', 76, TRUE),
  ('allied-pharm-tech', 'Pharmacy Technician', 'Allied Health', 'Allied Health', 'pharm_tech', 'Standardized EMR role', 77, TRUE),
  ('allied-pharm-asst', 'Pharmacy Assistant', 'Allied Health', 'Allied Health', 'pharm_asst', 'Standardized EMR role', 78, TRUE),
  ('allied-psychologist', 'Psychologist', 'Allied Health', 'Allied Health', 'allied_psych', 'Standardized EMR role', 79, TRUE),
  ('allied-social-worker', 'Social Worker', 'Allied Health', 'Allied Health', 'allied_staff', 'Standardized EMR role', 80, TRUE),
  ('allied-counselor', 'Counselor', 'Allied Health', 'Allied Health', 'allied_staff', 'Standardized EMR role', 81, TRUE),
  ('allied-podiatrist', 'Podiatrist', 'Allied Health', 'Allied Health', 'allied_staff', 'Standardized EMR role', 82, TRUE),
  ('allied-audiologist', 'Audiologist', 'Allied Health', 'Allied Health', 'allied_staff', 'Standardized EMR role', 83, TRUE),
  ('allied-optometrist', 'Optometrist', 'Allied Health', 'Allied Health', 'allied_staff', 'Standardized EMR role', 84, TRUE),

  -- 10. DIAGNOSTIC & LABORATORY
  ('diag-lab-director', 'Laboratory Director', 'Diagnostic Staff', 'Laboratory', 'lab_exec', 'Standardized EMR role', 85, TRUE),
  ('diag-lab-scientist', 'Medical Laboratory Scientist', 'Diagnostic Staff', 'Laboratory', 'lab_scientist', 'Standardized EMR role', 86, TRUE),
  ('diag-lab-tech', 'Lab Technician', 'Diagnostic Staff', 'Laboratory', 'lab_technician', 'Standardized EMR role', 87, TRUE),
  ('diag-phleb', 'Phlebotomist', 'Diagnostic Staff', 'Laboratory', 'lab_phleb', 'Standardized EMR role', 88, TRUE),
  ('diag-radiographer', 'Radiographer', 'Diagnostic Staff', 'Imaging', 'diag_radiographer', 'Standardized EMR role', 89, TRUE),
  ('diag-sonographer', 'Sonographer (Ultrasound)', 'Diagnostic Staff', 'Imaging', 'diag_radio_tech', 'Standardized EMR role', 90, TRUE),
  ('diag-imaging-tech', 'CT/MRI Technician', 'Diagnostic Staff', 'Imaging', 'diag_radio_tech', 'Standardized EMR role', 91, TRUE),
  ('diag-biomed-eng', 'Biomedical Engineer', 'Diagnostic Staff', 'Engineering', 'it_biomed', 'Standardized EMR role', 92, TRUE),
  ('diag-equip-tech', 'Medical Equipment Technician', 'Diagnostic Staff', 'Engineering', 'it_biomed', 'Standardized EMR role', 93, TRUE),

  -- 11. EMERGENCY & CRITICAL CARE
  ('er-physician', 'Emergency Physician', 'Clinical Staff', 'Emergency', 'doctor_er', 'Standardized EMR role', 94, TRUE),
  ('er-trauma-team', 'Trauma Team Member', 'Clinical Staff', 'Emergency', 'staff_er', 'Standardized EMR role', 95, TRUE),
  ('er-paramedic', 'Paramedic', 'Clinical Staff', 'Emergency', 'staff_paramedic', 'Standardized EMR role', 96, TRUE),
  ('er-nurse', 'Emergency Nurse', 'Nursing Staff', 'Emergency', 'nurse_triage', 'Standardized EMR role', 97, TRUE),
  ('er-icu-staff', 'ICU Staff', 'Nursing Staff', 'Emergency', 'nurse_icu', 'Standardized EMR role', 98, TRUE),
  ('er-ambulance', 'Ambulance Driver', 'Support Staff', 'Emergency', 'staff_logistics', 'Standardized EMR role', 99, TRUE),
  ('er-first-responder', 'First Responder', 'Support Staff', 'Emergency', 'staff_er', 'Standardized EMR role', 100, TRUE),

  -- 12. INPATIENT / WARD SUPPORT
  ('ward-clerk', 'Ward Clerk', 'Support Staff', 'Ward', 'reception_ward', 'Standardized EMR role', 101, TRUE),
  ('ward-patient-asst', 'Patient Care Assistant', 'Support Staff', 'Ward', 'staff_care', 'Standardized EMR role', 102, TRUE),
  ('ward-healthcare-asst', 'Healthcare Assistant', 'Support Staff', 'Ward', 'staff_care', 'Standardized EMR role', 103, TRUE),
  ('ward-porter', 'Porter (Patient Transport)', 'Support Staff', 'Ward', 'staff_logistics', 'Standardized EMR role', 104, TRUE),
  ('ward-bed-manager', 'Bed Manager', 'Administrative Staff', 'Ward', 'admin_ward', 'Standardized EMR role', 105, TRUE),
  ('ward-admission-coord', 'Admission/Discharge Coordinator', 'Administrative Staff', 'Ward', 'admin_ward', 'Standardized EMR role', 106, TRUE),

  -- 13. ADMINISTRATION & MANAGEMENT
  ('admin-hospital', 'Hospital Administrator', 'Administrative Staff', 'Admin', 'admin_manager', 'Standardized EMR role', 107, TRUE),
  ('admin-ops-manager', 'Operations Manager', 'Administrative Staff', 'Admin', 'admin_manager', 'Standardized EMR role', 108, TRUE),
  ('admin-dept-coord', 'Department Coordinator', 'Administrative Staff', 'Admin', 'admin_staff', 'Standardized EMR role', 109, TRUE),
  ('admin-health-info', 'Health Information Manager', 'Administrative Staff', 'Records', 'admin_records_lead', 'Standardized EMR role', 110, TRUE),
  ('admin-records-off', 'Medical Records Officer', 'Administrative Staff', 'Records', 'admin_records', 'Standardized EMR role', 111, TRUE),
  ('admin-coder', 'Medical Coder', 'Administrative Staff', 'Finance', 'admin_billing', 'Standardized EMR role', 112, TRUE),
  ('admin-biller', 'Medical Biller', 'Administrative Staff', 'Finance', 'admin_billing', 'Standardized EMR role', 113, TRUE),
  ('admin-accountant', 'Accountant', 'Administrative Staff', 'Finance', 'admin_finance', 'Standardized EMR role', 114, TRUE),
  ('admin-billing-off', 'Billing Officer', 'Administrative Staff', 'Finance', 'admin_billing', 'Standardized EMR role', 115, TRUE),
  ('admin-insurance', 'Insurance Coordinator', 'Administrative Staff', 'Finance', 'admin_billing', 'Standardized EMR role', 116, TRUE),
  ('admin-hr-manager', 'HR Manager', 'Administrative Staff', 'HR', 'admin_hr', 'Standardized EMR role', 117, TRUE),
  ('admin-recruiter', 'Recruiter', 'Administrative Staff', 'HR', 'admin_hr', 'Standardized EMR role', 118, TRUE),
  ('admin-training', 'Training Coordinator', 'Administrative Staff', 'HR', 'admin_hr', 'Standardized EMR role', 119, TRUE),

  -- 14. IT & DIGITAL HEALTH
  ('it-health-spec', 'Health IT Specialist', 'IT & System', 'IT', 'it_staff', 'Standardized EMR role', 120, TRUE),
  ('it-emr-admin', 'EMR/EHR Administrator', 'IT & System', 'IT', 'it_admin', 'Standardized EMR role', 121, TRUE),
  ('it-sys-admin', 'System Administrator', 'IT & System', 'IT', 'it_admin', 'Standardized EMR role', 122, TRUE),
  ('it-db-admin', 'Database Administrator', 'IT & System', 'IT', 'it_admin', 'Standardized EMR role', 123, TRUE),
  ('it-cyber-spec', 'Cybersecurity Specialist', 'IT & System', 'IT', 'it_security', 'Standardized EMR role', 124, TRUE),
  ('it-data-analyst', 'Data Analyst (Healthcare)', 'IT & System', 'IT', 'it_data', 'Standardized EMR role', 125, TRUE),
  ('it-ai-engineer', 'AI/Clinical Decision Support Engineer', 'IT & System', 'IT', 'it_ai_eng', 'Standardized EMR role', 126, TRUE),

  -- 15. SUPPORT & FACILITY
  ('support-housekeeping', 'Cleaner / Housekeeping Staff', 'Support Staff', 'Facility', 'staff_support', 'Standardized EMR role', 127, TRUE),
  ('support-infection', 'Infection Control Staff', 'Support Staff', 'Facility', 'staff_support', 'Standardized EMR role', 128, TRUE),
  ('support-waste', 'Waste Management Staff', 'Support Staff', 'Facility', 'staff_support', 'Standardized EMR role', 129, TRUE),
  ('support-kitchen', 'Kitchen Staff', 'Support Staff', 'Hospitality', 'staff_support', 'Standardized EMR role', 130, TRUE),
  ('support-diet-asst', 'Diet Kitchen Assistant', 'Support Staff', 'Hospitality', 'staff_support', 'Standardized EMR role', 131, TRUE),
  ('support-food-worker', 'Food Service Worker', 'Support Staff', 'Hospitality', 'staff_support', 'Standardized EMR role', 132, TRUE),
  ('support-security', 'Security Guard', 'Support Staff', 'Security', 'staff_security', 'Standardized EMR role', 133, TRUE),
  ('support-safety', 'Safety Officer', 'Support Staff', 'Security', 'staff_security', 'Standardized EMR role', 134, TRUE),
  ('support-store-mgr', 'Store Manager', 'Support Staff', 'Logistics', 'staff_logistics', 'Standardized EMR role', 135, TRUE),
  ('support-inventory', 'Inventory Manager', 'Support Staff', 'Logistics', 'staff_logistics', 'Standardized EMR role', 136, TRUE),
  ('support-supply', 'Supply Chain Officer', 'Support Staff', 'Logistics', 'staff_logistics', 'Standardized EMR role', 137, TRUE),

  -- 16. PHARMACY MANAGEMENT
  ('pharm-chief', 'Chief Pharmacist', 'Allied Health', 'Pharmacy', 'pharm_lead', 'Standardized EMR role', 138, TRUE),
  ('pharm-dispensing', 'Dispensing Pharmacist', 'Allied Health', 'Pharmacy', 'pharm_pharmacist', 'Standardized EMR role', 139, TRUE),
  ('pharm-inventory', 'Inventory Pharmacist', 'Allied Health', 'Pharmacy', 'pharm_pharmacist', 'Standardized EMR role', 140, TRUE),

  -- 17. COMMUNITY & OUTREACH
  ('comm-health-worker', 'Community Health Worker', 'External / Community', 'Outreach', 'comm_worker', 'Standardized EMR role', 141, TRUE),
  ('comm-extension', 'Health Extension Worker', 'External / Community', 'Outreach', 'comm_extension', 'Standardized EMR role', 142, TRUE),
  ('comm-outreach-coord', 'Outreach Coordinator', 'External / Community', 'Outreach', 'comm_worker', 'Standardized EMR role', 143, TRUE),
  ('comm-public-health', 'Public Health Officer', 'External / Community', 'Outreach', 'comm_lead', 'Standardized EMR role', 144, TRUE),
  ('comm-epidemiologist', 'Epidemiologist', 'External / Community', 'Outreach', 'comm_lead', 'Standardized EMR role', 145, TRUE),

  -- 18. EDUCATION, RESEARCH & LEGAL
  ('edu-medical', 'Medical Educator', 'Clinical Staff', 'Academic', 'doctor_edu', 'Standardized EMR role', 146, TRUE),
  ('edu-clin-trainer', 'Clinical Trainer', 'Clinical Staff', 'Academic', 'staff_edu', 'Standardized EMR role', 147, TRUE),
  ('res-scientist', 'Research Scientist', 'Clinical Staff', 'Research', 'staff_research', 'Standardized EMR role', 148, TRUE),
  ('res-trial-coord', 'Clinical Trial Coordinator', 'Clinical Staff', 'Research', 'staff_research', 'Standardized EMR role', 149, TRUE),
  ('res-academic', 'Academic Staff', 'Clinical Staff', 'Academic', 'staff_edu', 'Standardized EMR role', 150, TRUE),
  ('legal-advisor', 'Legal Advisor', 'Administrative Staff', 'Legal', 'admin_legal', 'Standardized EMR role', 151, TRUE),
  ('legal-compliance', 'Compliance Officer', 'Administrative Staff', 'Legal', 'admin_legal', 'Standardized EMR role', 152, TRUE),
  ('legal-risk-mgr', 'Risk Manager', 'Administrative Staff', 'Legal', 'admin_legal', 'Standardized EMR role', 153, TRUE),
  ('legal-ethics-comm', 'Ethics Committee Member', 'Administrative Staff', 'Legal', 'admin_legal', 'Standardized EMR role', 154, TRUE)

ON CONFLICT (template_key) DO UPDATE
SET
  title = EXCLUDED.title,
  role_group = EXCLUDED.role_group,
  category = EXCLUDED.category,
  api_role = EXCLUDED.api_role,
  active = TRUE,
  updated_at = NOW();