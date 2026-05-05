-- 021_staff_templates_tier_based.sql
-- Canonical staff role templates with tier-based access control.
-- Merges both 018 files and adds real-world tier restrictions.

-- Step 1: Drop old copy file if exists
DROP TABLE IF EXISTS _migration_log;

-- Step 2: Insert canonical 154 staff role templates with tier restrictions
INSERT INTO staff_role_templates (template_key, title, role_group, category, api_role, description, sort_order, active)
VALUES
  -- 1. GOVERNANCE & EXECUTIVE (All tiers)
  ('gov-board-directors', 'Board of Directors', 'Administrative Staff', 'Governance', 'admin_exec', 'Hospital board oversight. Tiers: All', 1, TRUE),
  ('gov-trustees', 'Trustees', 'Administrative Staff', 'Governance', 'admin_exec', 'Trustee oversight. Tiers: Primary Hospital+', 2, TRUE),
  ('gov-owners', 'Hospital Owners', 'Administrative Staff', 'Governance', 'admin_exec', 'Hospital ownership. Tiers: General Specialized Hospital+', 3, TRUE),
  ('gov-ceo', 'Chief Executive Officer (CEO)', 'Administrative Staff', 'Governance', 'admin_exec', 'CEO leadership. Tiers: All', 4, TRUE),
  ('gov-coo', 'Chief Operating Officer (COO)', 'Administrative Staff', 'Governance', 'admin_exec', 'Operations oversight. Tiers: Health Center+', 5, TRUE),
  ('gov-cmo', 'Chief Medical Officer (CMO)', 'Clinical Staff', 'Governance', 'doctor_exec', 'Medical director role. Tiers: Health Center+', 6, TRUE),
  ('gov-cno', 'Chief Nursing Officer (CNO)', 'Nursing Staff', 'Governance', 'nurse_exec', 'Nursing leadership. Tiers: Health Center+', 7, TRUE),
  ('gov-cfo', 'Chief Financial Officer (CFO)', 'Administrative Staff', 'Governance', 'admin_exec', 'Financial oversight. Tiers: Primary Hospital+', 8, TRUE),
  ('gov-cio', 'Chief Information Officer (CIO)', 'IT & System', 'Governance', 'it_exec', 'IT leadership. Tiers: Primary Hospital+', 9, TRUE),
  ('gov-cto', 'Chief Technology Officer (CTO)', 'IT & System', 'Governance', 'it_exec', 'Technology leadership. Tiers: General Specialized Hospital+', 10, TRUE),
  ('gov-chro', 'Chief Human Resources Officer (CHRO)', 'Administrative Staff', 'Governance', 'admin_exec', 'HR leadership. Tiers: Health Center+', 11, TRUE),
  ('gov-compliance-chief', 'Chief Compliance Officer', 'Administrative Staff', 'Governance', 'admin_exec', 'Compliance oversight. Tiers: Primary Hospital+', 12, TRUE),

  -- 2. MEDICAL STAFF (GP core for Health Post, expanded for higher tiers)
  ('med-director', 'Medical Director', 'Clinical Staff', 'Medical Staff', 'doctor_exec', 'Medical dept head. Tiers: Health Center+', 13, TRUE),
  ('med-hod', 'Department Head (HOD)', 'Clinical Staff', 'Medical Staff', 'doctor_lead', 'Department leadership. Tiers: Primary Hospital+', 14, TRUE),
  ('med-gp', 'General Practitioner (GP)', 'Clinical Staff', 'Medical Staff', 'doctor_gp', 'Primary care physician. Tiers: All', 15, TRUE),
  ('med-attending', 'Attending Physician', 'Clinical Staff', 'Medical Staff', 'doctor_senior', 'Senior physician. Tiers: Primary Hospital+', 16, TRUE),
  ('med-consultant', 'Consultant (Specialist)', 'Clinical Staff', 'Medical Staff', 'doctor_specialist', 'Specialist consulting. Tiers: General Specialized Hospital+', 17, TRUE),
  ('med-registrar', 'Registrar', 'Clinical Staff', 'Medical Staff', 'doctor_registrar', 'Advanced trainee. Tiers: Primary Hospital+', 18, TRUE),
  ('med-resident', 'Resident', 'Clinical Staff', 'Medical Staff', 'doctor_resident', 'Medical resident. Tiers: Primary Hospital+', 19, TRUE),
  ('med-intern', 'Intern', 'Clinical Staff', 'Medical Staff', 'doctor_intern', 'Junior medical trainee. Tiers: Health Center+', 20, TRUE),
  ('med-student', 'Medical Student', 'Clinical Staff', 'Medical Staff', 'doctor_student', 'Undergraduate medical student. Tiers: Primary Hospital+', 21, TRUE),

  -- 3. MEDICAL SPECIALTIES (Primary Hospital+)
  ('spec-cardiologist', 'Cardiologist', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', 'Heart specialist. Tiers: General Specialized Hospital+', 22, TRUE),
  ('spec-neurologist', 'Neurologist', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', 'Neurology specialist. Tiers: General Specialized Hospital+', 23, TRUE),
  ('spec-dermatologist', 'Dermatologist', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', 'Skin specialist. Tiers: Primary Hospital+', 24, TRUE),
  ('spec-pediatrician', 'Pediatrician', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', 'Child specialist. Tiers: Primary Hospital+', 25, TRUE),
  ('spec-psychiatrist', 'Psychiatrist', 'Clinical Staff', 'Medical Specialties', 'doctor_psych', 'Mental health specialist. Tiers: General Specialized Hospital+', 26, TRUE),
  ('spec-oncologist', 'Oncologist', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', 'Cancer specialist. Tiers: General Specialized Hospital+', 27, TRUE),
  ('spec-endocrinologist', 'Endocrinologist', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', 'Hormone specialist. Tiers: General Specialized Hospital+', 28, TRUE),
  ('spec-gastro', 'Gastroenterologist', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', 'GI specialist. Tiers: Primary Hospital+', 29, TRUE),
  ('spec-pulmonologist', 'Pulmonologist', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', 'Respiratory specialist. Tiers: Primary Hospital+', 30, TRUE),
  ('spec-nephrologist', 'Nephrologist', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', 'Kidney specialist. Tiers: General Specialized Hospital+', 31, TRUE),
  ('spec-infectious', 'Infectious Disease Specialist', 'Clinical Staff', 'Medical Specialties', 'doctor_specialist', 'Infection specialist. Tiers: Primary Hospital+', 32, TRUE),
  ('spec-er-physician', 'Emergency Medicine Physician', 'Clinical Staff', 'Medical Specialties', 'doctor_er', 'Emergency medicine. Tiers: Primary Hospital+', 33, TRUE),

  -- 4. SURGICAL STAFF (Primary Hospital+ / General Specialized Hospital+)
  ('surg-general', 'General Surgeon', 'Clinical Staff', 'Surgical Staff', 'doctor_surgeon', 'General surgery. Tiers: Primary Hospital+', 34, TRUE),
  ('surg-ortho', 'Orthopedic Surgeon', 'Clinical Staff', 'Surgical Staff', 'doctor_surgeon', 'Bone surgery. Tiers: General Specialized Hospital+', 35, TRUE),
  ('surg-neuro', 'Neurosurgeon', 'Clinical Staff', 'Surgical Staff', 'doctor_surgeon', 'Brain surgery. Tiers: General Specialized Hospital+', 36, TRUE),
  ('surg-cardio', 'Cardiothoracic Surgeon', 'Clinical Staff', 'Surgical Staff', 'doctor_surgeon', 'Heart/chest surgery. Tiers: National Health System+', 37, TRUE),
  ('surg-plastic', 'Plastic Surgeon', 'Clinical Staff', 'Surgical Staff', 'doctor_surgeon', 'Cosmetic/reconstructive surgery. Tiers: General Specialized Hospital+', 38, TRUE),
  ('surg-urologist', 'Urologist', 'Clinical Staff', 'Surgical Staff', 'doctor_surgeon', 'Urinary system surgery. Tiers: Primary Hospital+', 39, TRUE),
  ('surg-obgyn', 'Obstetrician/Gynecologist (OB/GYN)', 'Clinical Staff', 'Surgical Staff', 'doctor_surgeon', 'Maternity/women health. Tiers: Primary Hospital+', 40, TRUE),

  -- 5. PROCEDURE SPECIALISTS (General Specialized Hospital+)
  ('proc-anesthesiologist', 'Anesthesiologist', 'Clinical Staff', 'Procedures', 'doctor_anes', 'Anesthesia provider. Tiers: Primary Hospital+', 41, TRUE),
  ('proc-intensivist', 'Intensivist (ICU)', 'Clinical Staff', 'Procedures', 'doctor_icu', 'ICU specialist. Tiers: Primary Hospital+', 42, TRUE),
  ('proc-radiologist', 'Radiologist', 'Diagnostic Staff', 'Procedures', 'doctor_radio', 'Imaging specialist. Tiers: Primary Hospital+', 43, TRUE),
  ('proc-pathologist', 'Pathologist', 'Diagnostic Staff', 'Procedures', 'doctor_path', 'Pathology specialist. Tiers: General Specialized Hospital+', 44, TRUE),

  -- 6. NURSING STAFF (Available at all tiers, adjusted for capacity)
  ('nurse-director', 'Director of Nursing', 'Nursing Staff', 'Nursing Staff', 'nurse_exec', 'Nursing leadership. Tiers: Health Center+', 45, TRUE),
  ('nurse-manager', 'Nurse Unit Manager (Ward Manager)', 'Nursing Staff', 'Nursing Staff', 'nurse_lead', 'Ward management. Tiers: Health Center+', 46, TRUE),
  ('nurse-asst-manager', 'Assistant Nurse Manager', 'Nursing Staff', 'Nursing Staff', 'nurse_lead', 'Assistant ward manager. Tiers: Primary Hospital+', 47, TRUE),
  ('nurse-rn', 'Registered Nurse (RN)', 'Nursing Staff', 'Nursing Staff', 'nurse_rn', 'Registered nurse. Tiers: All', 48, TRUE),
  ('nurse-enrolled', 'Enrolled Nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_enrolled', 'Enrolled nurse. Tiers: Health Center+', 49, TRUE),
  ('nurse-lpn', 'Licensed Practical Nurse (LPN)', 'Nursing Staff', 'Nursing Staff', 'nurse_lpn', 'Practical nurse. Tiers: All', 50, TRUE),
  ('nurse-icu', 'ICU Nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_icu', 'ICU specialist. Tiers: Primary Hospital+', 51, TRUE),
  ('nurse-triage', 'Emergency/Triage Nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_triage', 'Triage assessment. Tiers: Health Center+', 52, TRUE),
  ('nurse-surgical', 'Surgical Nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_surg', 'Operating theater nurse. Tiers: Primary Hospital+', 53, TRUE),
  ('nurse-peds', 'Pediatric Nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_peds', 'Child nursing. Tiers: Primary Hospital+', 54, TRUE),
  ('nurse-oncology', 'Oncology Nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_onco', 'Cancer care nursing. Tiers: General Specialized Hospital+', 55, TRUE),
  ('nurse-dialysis', 'Dialysis Nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_dialysis', 'Kidney care nursing. Tiers: General Specialized Hospital+', 56, TRUE),
  ('nurse-infection', 'Infection Control Nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_staff', 'Infection prevention. Tiers: Health Center+', 57, TRUE),
  ('nurse-psych', 'Psychiatric Nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_psych', 'Mental health nursing. Tiers: General Specialized Hospital+', 58, TRUE),
  ('nurse-comm', 'Community Health Nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_comm', 'Community outreach. Tiers: All', 59, TRUE),
  ('nurse-midwife', 'Midwife', 'Nursing Staff', 'Nursing Staff', 'nurse_midwife', 'Maternal care specialist. Tiers: Primary Hospital+', 60, TRUE),
  ('nurse-np', 'Nurse Practitioner (NP)', 'Nursing Staff', 'Nursing Staff', 'nurse_np', 'Advanced practice. Tiers: General Specialized Hospital+', 61, TRUE),
  ('nurse-clinical-spec', 'Clinical Nurse Specialist', 'Nursing Staff', 'Nursing Staff', 'nurse_spec', 'Clinical specialty. Tiers: Primary Hospital+', 62, TRUE),
  ('nurse-educator', 'Nurse Educator', 'Nursing Staff', 'Nursing Staff', 'nurse_edu', 'Nursing training. Tiers: Health Center+', 63, TRUE),
  ('nurse-researcher', 'Nurse Researcher', 'Nursing Staff', 'Nursing Staff', 'nurse_research', 'Nursing research. Tiers: General Specialized Hospital+', 64, TRUE),
  ('nurse-ward', 'Ward Nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_ward', 'General ward care. Tiers: All', 65, TRUE),
  ('nurse-charge', 'Charge Nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_lead', 'Shift leadership. Tiers: Health Center+', 66, TRUE),
  ('nurse-bedside', 'Bedside Nurse', 'Nursing Staff', 'Nursing Staff', 'nurse_ward', 'Patient care at bedside. Tiers: All', 67, TRUE),
  ('nurse-aide', 'Nurse Assistant / Nursing Aide', 'Nursing Staff', 'Nursing Staff', 'nurse_aide', 'Care support. Tiers: All', 68, TRUE),

  -- 7. ALLIED HEALTH (Tier appropriate)
  ('allied-physio', 'Physiotherapist', 'Allied Health', 'Allied Health', 'allied_physio', 'Rehabilitation care. Tiers: Health Center+', 69, TRUE),
  ('allied-occupational', 'Occupational Therapist', 'Allied Health', 'Allied Health', 'allied_staff', 'Functional rehabilitation. Tiers: Health Center+', 70, TRUE),
  ('allied-speech', 'Speech & Language Therapist', 'Allied Health', 'Allied Health', 'allied_staff', 'Speech therapy. Tiers: Primary Hospital+', 71, TRUE),
  ('allied-respiratory', 'Respiratory Therapist', 'Allied Health', 'Allied Health', 'allied_staff', 'Respiratory care. Tiers: Primary Hospital+', 72, TRUE),
  ('allied-dietitian', 'Dietitian', 'Allied Health', 'Allied Health', 'allied_diet', 'Nutritional care. Tiers: Health Center+', 73, TRUE),
  ('allied-nutritionist', 'Nutritionist', 'Allied Health', 'Allied Health', 'allied_diet', 'Nutrition support. Tiers: Health Center+', 74, TRUE),
  ('allied-pharmacist', 'Pharmacist', 'Allied Health', 'Allied Health', 'pharm_pharmacist', 'Medication management. Tiers: All', 75, TRUE),
  ('allied-clin-pharm', 'Clinical Pharmacist', 'Allied Health', 'Allied Health', 'pharm_pharmacist', 'Clinical pharmacy. Tiers: Primary Hospital+', 76, TRUE),
  ('allied-pharm-tech', 'Pharmacy Technician', 'Allied Health', 'Allied Health', 'pharm_tech', 'Pharmacy support. Tiers: All', 77, TRUE),
  ('allied-pharm-asst', 'Pharmacy Assistant', 'Allied Health', 'Allied Health', 'pharm_asst', 'Pharmacy helper. Tiers: All', 78, TRUE),
  ('allied-psychologist', 'Psychologist', 'Allied Health', 'Allied Health', 'allied_psych', 'Mental health support. Tiers: Primary Hospital+', 79, TRUE),
  ('allied-social-worker', 'Social Worker', 'Allied Health', 'Allied Health', 'allied_staff', 'Social support. Tiers: Health Center+', 80, TRUE),
  ('allied-counselor', 'Counselor', 'Allied Health', 'Allied Health', 'allied_staff', 'Counseling services. Tiers: Health Center+', 81, TRUE),
  ('allied-podiatrist', 'Podiatrist', 'Allied Health', 'Allied Health', 'allied_staff', 'Foot care. Tiers: Primary Hospital+', 82, TRUE),
  ('allied-audiologist', 'Audiologist', 'Allied Health', 'Allied Health', 'allied_staff', 'Hearing care. Tiers: Primary Hospital+', 83, TRUE),
  ('allied-optometrist', 'Optometrist', 'Allied Health', 'Allied Health', 'allied_staff', 'Eye care. Tiers: Primary Hospital+', 84, TRUE),

  -- 8. DIAGNOSTIC & LABORATORY
  ('diag-lab-director', 'Laboratory Director', 'Diagnostic Staff', 'Laboratory', 'lab_exec', 'Lab leadership. Tiers: Health Center+', 85, TRUE),
  ('diag-lab-scientist', 'Medical Laboratory Scientist', 'Diagnostic Staff', 'Laboratory', 'lab_scientist', 'Lab specialist. Tiers: Primary Hospital+', 86, TRUE),
  ('diag-lab-tech', 'Lab Technician', 'Diagnostic Staff', 'Laboratory', 'lab_technician', 'Lab technician. Tiers: All', 87, TRUE),
  ('diag-phleb', 'Phlebotomist', 'Diagnostic Staff', 'Laboratory', 'lab_phleb', 'Blood collection. Tiers: All', 88, TRUE),
  ('diag-radiographer', 'Radiographer', 'Diagnostic Staff', 'Imaging', 'diag_radiographer', 'Imaging technician. Tiers: Primary Hospital+', 89, TRUE),
  ('diag-sonographer', 'Sonographer (Ultrasound)', 'Diagnostic Staff', 'Imaging', 'diag_radio_tech', 'Ultrasound specialist. Tiers: Health Center+', 90, TRUE),
  ('diag-imaging-tech', 'CT/MRI Technician', 'Diagnostic Staff', 'Imaging', 'diag_radio_tech', 'Advanced imaging. Tiers: General Specialized Hospital+', 91, TRUE),
  ('diag-biomed-eng', 'Biomedical Engineer', 'Diagnostic Staff', 'Engineering', 'it_biomed', 'Equipment engineering. Tiers: Primary Hospital+', 92, TRUE),
  ('diag-equip-tech', 'Medical Equipment Technician', 'Diagnostic Staff', 'Engineering', 'it_biomed', 'Equipment maintenance. Tiers: Health Center+', 93, TRUE),

  -- 9. EMERGENCY & CRITICAL CARE
  ('er-physician', 'Emergency Physician', 'Clinical Staff', 'Emergency', 'doctor_er', 'ER specialist. Tiers: Primary Hospital+', 94, TRUE),
  ('er-trauma-team', 'Trauma Team Member', 'Clinical Staff', 'Emergency', 'staff_er', 'Trauma care. Tiers: Primary Hospital+', 95, TRUE),
  ('er-paramedic', 'Paramedic', 'Clinical Staff', 'Emergency', 'staff_paramedic', 'Pre-hospital care. Tiers: Health Center+', 96, TRUE),
  ('er-nurse', 'Emergency Nurse', 'Nursing Staff', 'Emergency', 'nurse_triage', 'ER nursing. Tiers: Primary Hospital+', 97, TRUE),
  ('er-icu-staff', 'ICU Staff', 'Nursing Staff', 'Emergency', 'nurse_icu', 'ICU team. Tiers: Primary Hospital+', 98, TRUE),
  ('er-ambulance', 'Ambulance Driver', 'Support Staff', 'Emergency', 'staff_logistics', 'Patient transport. Tiers: Health Center+', 99, TRUE),
  ('er-first-responder', 'First Responder', 'Support Staff', 'Emergency', 'staff_er', 'Emergency response. Tiers: Health Center+', 100, TRUE),

  -- 10. INPATIENT / WARD SUPPORT
  ('ward-clerk', 'Ward Clerk', 'Support Staff', 'Ward', 'reception_ward', 'Ward administration. Tiers: All', 101, TRUE),
  ('ward-patient-asst', 'Patient Care Assistant', 'Support Staff', 'Ward', 'staff_care', 'Patient care support. Tiers: All', 102, TRUE),
  ('ward-healthcare-asst', 'Healthcare Assistant', 'Support Staff', 'Ward', 'staff_care', 'Healthcare support. Tiers: All', 103, TRUE),
  ('ward-porter', 'Porter (Patient Transport)', 'Support Staff', 'Ward', 'staff_logistics', 'Patient transport. Tiers: All', 104, TRUE),
  ('ward-bed-manager', 'Bed Manager', 'Administrative Staff', 'Ward', 'admin_ward', 'Bed allocation. Tiers: Primary Hospital+', 105, TRUE),
  ('ward-admission-coord', 'Admission/Discharge Coordinator', 'Administrative Staff', 'Ward', 'admin_ward', 'Patient flow. Tiers: Health Center+', 106, TRUE),

  -- 11. ADMINISTRATION & MANAGEMENT
  ('admin-hospital', 'Hospital Administrator', 'Administrative Staff', 'Admin', 'admin_manager', 'Hospital admin. Tiers: All', 107, TRUE),
  ('admin-ops-manager', 'Operations Manager', 'Administrative Staff', 'Admin', 'admin_manager', 'Ops management. Tiers: Health Center+', 108, TRUE),
  ('admin-dept-coord', 'Department Coordinator', 'Administrative Staff', 'Admin', 'admin_staff', 'Dept coordination. Tiers: All', 109, TRUE),
  ('admin-health-info', 'Health Information Manager', 'Administrative Staff', 'Records', 'admin_records_lead', 'Records leadership. Tiers: Health Center+', 110, TRUE),
  ('admin-records-off', 'Medical Records Officer', 'Administrative Staff', 'Records', 'admin_records', 'Records management. Tiers: All', 111, TRUE),
  ('admin-coder', 'Medical Coder', 'Administrative Staff', 'Finance', 'admin_billing', 'Coding/billing. Tiers: Primary Hospital+', 112, TRUE),
  ('admin-biller', 'Medical Biller', 'Administrative Staff', 'Finance', 'admin_billing', 'Billing operations. Tiers: Primary Hospital+', 113, TRUE),
  ('admin-accountant', 'Accountant', 'Administrative Staff', 'Finance', 'admin_finance', 'Financial accounting. Tiers: Primary Hospital+', 114, TRUE),
  ('admin-billing-off', 'Billing Officer', 'Administrative Staff', 'Finance', 'admin_billing', 'Billing oversight. Tiers: Health Center+', 115, TRUE),
  ('admin-insurance', 'Insurance Coordinator', 'Administrative Staff', 'Finance', 'admin_billing', 'Insurance liaison. Tiers: Primary Hospital+', 116, TRUE),
  ('admin-hr-manager', 'HR Manager', 'Administrative Staff', 'HR', 'admin_hr', 'HR management. Tiers: Primary Hospital+', 117, TRUE),
  ('admin-recruiter', 'Recruiter', 'Administrative Staff', 'HR', 'admin_hr', 'Staff recruitment. Tiers: Health Center+', 118, TRUE),
  ('admin-training', 'Training Coordinator', 'Administrative Staff', 'HR', 'admin_hr', 'Staff training. Tiers: All', 119, TRUE),

  -- 12. IT & DIGITAL HEALTH
  ('it-health-spec', 'Health IT Specialist', 'IT & System', 'IT', 'it_staff', 'IT support. Tiers: Health Center+', 120, TRUE),
  ('it-emr-admin', 'EMR/EHR Administrator', 'IT & System', 'IT', 'it_admin', 'EMR admin. Tiers: Primary Hospital+', 121, TRUE),
  ('it-sys-admin', 'System Administrator', 'IT & System', 'IT', 'it_admin', 'System admin. Tiers: Primary Hospital+', 122, TRUE),
  ('it-db-admin', 'Database Administrator', 'IT & System', 'IT', 'it_admin', 'Database admin. Tiers: Primary Hospital+', 123, TRUE),
  ('it-cyber-spec', 'Cybersecurity Specialist', 'IT & System', 'IT', 'it_security', 'Security. Tiers: General Specialized Hospital+', 124, TRUE),
  ('it-data-analyst', 'Data Analyst (Healthcare)', 'IT & System', 'IT', 'it_data', 'Data analysis. Tiers: Primary Hospital+', 125, TRUE),
  ('it-ai-engineer', 'AI/Clinical Decision Support Engineer', 'IT & System', 'IT', 'it_ai_eng', 'AI/clinical support. Tiers: General Specialized Hospital+', 126, TRUE),

  -- 13. SUPPORT & FACILITY
  ('support-housekeeping', 'Cleaner / Housekeeping Staff', 'Support Staff', 'Facility', 'staff_support', 'Cleaning. Tiers: All', 127, TRUE),
  ('support-infection', 'Infection Control Staff', 'Support Staff', 'Facility', 'staff_support', 'Infection prevention. Tiers: All', 128, TRUE),
  ('support-waste', 'Waste Management Staff', 'Support Staff', 'Facility', 'staff_support', 'Waste management. Tiers: All', 129, TRUE),
  ('support-kitchen', 'Kitchen Staff', 'Support Staff', 'Hospitality', 'staff_support', 'Food preparation. Tiers: Health Center+', 130, TRUE),
  ('support-diet-asst', 'Diet Kitchen Assistant', 'Support Staff', 'Hospitality', 'staff_support', 'Diet support. Tiers: Health Center+', 131, TRUE),
  ('support-food-worker', 'Food Service Worker', 'Support Staff', 'Hospitality', 'staff_support', 'Food service. Tiers: All', 132, TRUE),
  ('support-security', 'Security Guard', 'Support Staff', 'Security', 'staff_security', 'Security. Tiers: All', 133, TRUE),
  ('support-safety', 'Safety Officer', 'Support Staff', 'Security', 'staff_security', 'Safety management. Tiers: Health Center+', 134, TRUE),
  ('support-store-mgr', 'Store Manager', 'Support Staff', 'Logistics', 'staff_logistics', 'Store management. Tiers: Primary Hospital+', 135, TRUE),
  ('support-inventory', 'Inventory Manager', 'Support Staff', 'Logistics', 'staff_logistics', 'Inventory control. Tiers: Health Center+', 136, TRUE),
  ('support-supply', 'Supply Chain Officer', 'Support Staff', 'Logistics', 'staff_logistics', 'Supply chain. Tiers: Primary Hospital+', 137, TRUE),

  -- 14. PHARMACY MANAGEMENT
  ('pharm-chief', 'Chief Pharmacist', 'Allied Health', 'Pharmacy', 'pharm_lead', 'Pharmacy leadership. Tiers: Primary Hospital+', 138, TRUE),
  ('pharm-dispensing', 'Dispensing Pharmacist', 'Allied Health', 'Pharmacy', 'pharm_pharmacist', 'Dispensing. Tiers: Health Center+', 139, TRUE),
  ('pharm-inventory', 'Inventory Pharmacist', 'Allied Health', 'Pharmacy', 'pharm_pharmacist', 'Drug inventory. Tiers: Health Center+', 140, TRUE),

  -- 15. COMMUNITY & OUTREACH
  ('comm-health-worker', 'Community Health Worker', 'External / Community', 'Outreach', 'comm_worker', 'Community care. Tiers: All', 141, TRUE),
  ('comm-extension', 'Health Extension Worker', 'External / Community', 'Outreach', 'comm_extension', 'Health extension. Tiers: All', 142, TRUE),
  ('comm-outreach-coord', 'Outreach Coordinator', 'External / Community', 'Outreach', 'comm_worker', 'Outreach programs. Tiers: Health Center+', 143, TRUE),
  ('comm-public-health', 'Public Health Officer', 'External / Community', 'Outreach', 'comm_lead', 'Public health. Tiers: Primary Hospital+', 144, TRUE),
  ('comm-epidemiologist', 'Epidemiologist', 'External / Community', 'Outreach', 'comm_lead', 'Epidemiology. Tiers: General Specialized Hospital+', 145, TRUE),

  -- 16. EDUCATION, RESEARCH & LEGAL
  ('edu-medical', 'Medical Educator', 'Clinical Staff', 'Academic', 'doctor_edu', 'Medical training. Tiers: Primary Hospital+', 146, TRUE),
  ('edu-clin-trainer', 'Clinical Trainer', 'Clinical Staff', 'Academic', 'staff_edu', 'Clinical training. Tiers: Health Center+', 147, TRUE),
  ('res-scientist', 'Research Scientist', 'Clinical Staff', 'Research', 'staff_research', 'Research. Tiers: General Specialized Hospital+', 148, TRUE),
  ('res-trial-coord', 'Clinical Trial Coordinator', 'Clinical Staff', 'Research', 'staff_research', 'Clinical trials. Tiers: General Specialized Hospital+', 149, TRUE),
  ('res-academic', 'Academic Staff', 'Clinical Staff', 'Academic', 'staff_edu', 'Academic role. Tiers: Primary Hospital+', 150, TRUE),
  ('legal-advisor', 'Legal Advisor', 'Administrative Staff', 'Legal', 'admin_legal', 'Legal counsel. Tiers: Primary Hospital+', 151, TRUE),
  ('legal-compliance', 'Compliance Officer', 'Administrative Staff', 'Legal', 'admin_legal', 'Compliance. Tiers: Health Center+', 152, TRUE),
  ('legal-risk-mgr', 'Risk Manager', 'Administrative Staff', 'Legal', 'admin_legal', 'Risk management. Tiers: Primary Hospital+', 153, TRUE),
  ('legal-ethics-comm', 'Ethics Committee Member', 'Administrative Staff', 'Legal', 'admin_legal', 'Ethics oversight. Tiers: Primary Hospital+', 154, TRUE)

ON CONFLICT (template_key) DO UPDATE
SET
  title = EXCLUDED.title,
  role_group = EXCLUDED.role_group,
  category = EXCLUDED.category,
  api_role = EXCLUDED.api_role,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  active = TRUE,
  updated_at = NOW();

-- Create tier-based staff template requirements table
CREATE TABLE IF NOT EXISTS staff_template_tier_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_template_key VARCHAR(255) NOT NULL REFERENCES staff_role_templates(template_key) ON DELETE CASCADE,
    organization_tier VARCHAR(50) NOT NULL CHECK (organization_tier IN ('health-post', 'health-center', 'primary-hospital', 'general-specialized-hospital', 'national-health-system')),
    min_staff_required INTEGER DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(staff_template_key, organization_tier)
);

-- Seed tier-based access (Simplified - key roles only)
INSERT INTO staff_template_tier_access (staff_template_key, organization_tier, min_staff_required, notes)
VALUES
  -- Health Post (Minimal staff)
  ('med-gp', 'health-post', 1, 'At least 1 GP'),
  ('nurse-rn', 'health-post', 1, 'At least 1 RN'),
  ('nurse-lpn', 'health-post', 1, 'Practical nurse'),
  ('allied-pharmacist', 'health-post', 1, 'Pharmacist or trained tech'),
  ('diag-lab-tech', 'health-post', 1, 'Lab technician'),
  ('nurse-aide', 'health-post', 2, 'Support staff'),
  ('admin-hospital', 'health-post', 1, 'Administrator'),
  ('admin-training', 'health-post', 1, 'Training coordinator'),
  
  -- Health Center (Moderate staff)
  ('med-gp', 'health-center', 2, 'At least 2 GPs'),
  ('med-director', 'health-center', 1, 'Medical director'),
  ('nurse-rn', 'health-center', 3, 'At least 3 RNs'),
  ('nurse-manager', 'health-center', 1, 'Ward manager'),
  ('nurse-triage', 'health-center', 1, 'Triage nurse'),
  ('allied-pharmacist', 'health-center', 1, 'Pharmacist'),
  ('diag-lab-director', 'health-center', 1, 'Lab director'),
  ('diag-lab-tech', 'health-center', 2, 'Lab technicians'),
  
  -- Primary Hospital (Advanced)
  ('med-attending', 'primary-hospital', 2, 'Senior physicians'),
  ('surg-general', 'primary-hospital', 1, 'At least 1 surgeon'),
  ('nurse-rn', 'primary-hospital', 8, 'Multiple RNs'),
  ('nurse-surgical', 'primary-hospital', 2, 'Operating room nurses'),
  ('proc-anesthesiologist', 'primary-hospital', 1, 'Anesthesiologist'),
  ('diag-lab-scientist', 'primary-hospital', 1, 'Lab scientist'),
  
  -- General Specialized Hospital (Complex)
  ('med-consultant', 'general-specialized-hospital', 3, 'Multiple consultants'),
  ('surg-ortho', 'general-specialized-hospital', 1, 'Specialist surgeons'),
  ('proc-pathologist', 'general-specialized-hospital', 1, 'Pathologist'),
  
  -- National Health System (Full capability)
  ('surg-cardio', 'national-health-system', 1, 'Cardiothoracic surgeon'),
  ('res-scientist', 'national-health-system', 1, 'Research capability')

ON CONFLICT (staff_template_key, organization_tier) DO UPDATE
SET
  min_staff_required = EXCLUDED.min_staff_required,
  notes = EXCLUDED.notes,
  updated_at = NOW();

-- Create staff template approval/request tracking
CREATE TABLE IF NOT EXISTS organization_staff_template_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    staff_template_key VARCHAR(255) NOT NULL REFERENCES staff_role_templates(template_key),
    requested_by UUID NOT NULL REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revoked')),
    justification TEXT,
    approval_notes TEXT,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, staff_template_key)
);

CREATE INDEX IF NOT EXISTS idx_org_staff_requests_org_id ON organization_staff_template_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_staff_requests_status ON organization_staff_template_requests(status);
