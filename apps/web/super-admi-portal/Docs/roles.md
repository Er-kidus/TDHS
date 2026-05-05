🧠 NATIONAL HEALTHCARE ROLE REGISTRY (COMPLETE)

🏛️ 1. GOVERNANCE & NATIONAL HEALTH SYSTEM ROLES
Role
Category
Level
System Role
Board of Directors
Governance
National
admin
Hospital Owners
Governance
National
admin
Trustees
Governance
National
admin
Ministry Health Officer
Governance
National
admin
Regulatory Compliance Officer
Governance
National
admin
Chief Executive Officer (CEO)
Executive
Institution
admin
Chief Operating Officer (COO)
Executive
Institution
admin
Chief Medical Officer (CMO)
Clinical Leadership
Institution
doctor
Chief Nursing Officer (CNO)
Nursing Leadership
Institution
nurse
Chief Financial Officer (CFO)
Finance
Institution
admin
Chief Information Officer (CIO)
IT Governance
Institution
admin
Chief Technology Officer (CTO)
IT Systems
Institution
admin
Chief Human Resources Officer (CHRO)
HR
Institution
admin
Chief Compliance Officer
Governance
Institution
admin


🏥 2. CLINICAL DOCTORS (ALL TIERS)
🟢 Primary & General Care
Role
Level
General Practitioner (GP)
Tier B
Medical Officer
Tier C
Attending Physician
Tier D
Consultant Physician
Tier D/E
Department Head (HOD)
Tier D/E


🟠 SPECIALISTS (CORE HOSPITAL SPECIALTIES)
Role
Specialty
Cardiologist
Heart
Neurologist
Brain/Nervous system
Dermatologist
Skin
Pediatrician
Children
Psychiatrist
Mental health
Oncologist
Cancer
Endocrinologist
Hormones
Gastroenterologist
Digestive
Pulmonologist
Lung
Nephrologist
Kidney
Infectious Disease Specialist
Infection
Emergency Physician
Emergency


🔪 SURGICAL ROLES
Role
Specialty
General Surgeon
General surgery
Orthopedic Surgeon
Bones
Neurosurgeon
Brain surgery
Cardiothoracic Surgeon
Heart/lungs
Plastic Surgeon
Reconstruction
Urologist
Urinary system
OB/GYN
Maternity surgery


🧠 TIER E SUPER-SPECIALISTS
Role
Function
Super Specialist Consultant
Complex cases
Transplant Surgeon
Organ transplant
Oncology Surgeon
Cancer surgery
Interventional Cardiologist
Cardiac procedures
Epileptologist
Complex neurology
Neonatologist
ICU newborn care


🏥 3. EMERGENCY & CRITICAL CARE
Role
Level
Emergency Medicine Physician
Tier D/E
Intensivist (ICU Specialist)
Tier E
Trauma Surgeon
Tier D/E
Anesthesiologist
Tier D/E
Code Blue Team Leader
ICU


👩‍⚕️ 4. NURSING STAFF (ALL TIERS)
General Nursing
Role
Registered Nurse (RN)
Enrolled Nurse
Licensed Practical Nurse
Bedside Nurse
Ward Nurse
Charge Nurse


SPECIALIZED NURSING
Role
Area
ICU Nurse
Critical care
Emergency Nurse
ER
Surgical Nurse
OR
Pediatric Nurse
Children
Oncology Nurse
Cancer
Dialysis Nurse
Kidney
Psychiatric Nurse
Mental
Infection Control Nurse
Infection prevention
Community Health Nurse
Outreach
Midwife
Maternity


ADVANCED NURSING
Role
Nurse Practitioner (NP)
Clinical Nurse Specialist
Nurse Educator
Nurse Researcher
Nurse Unit Manager


🧪 5. ALLIED HEALTH PROFESSIONALS
Role
Physiotherapist
Occupational Therapist
Speech & Language Therapist
Respiratory Therapist
Dietitian
Nutritionist
Psychologist
Social Worker


💊 6. PHARMACY ROLES
Role
Pharmacist
Clinical Pharmacist
Pharmacy Technician
Pharmacy Assistant


🧪 7. LABORATORY ROLES
Role
Medical Laboratory Technologist
Lab Technician
Lab Scientist
Histopathology Specialist
Genetic Lab Specialist


🩻 8. RADIOLOGY & IMAGING
Role
Radiologist
Radiology Technician
MRI/CT Technician
Ultrasound Technician


🏥 9. HOSPITAL OPERATIONS
Role
Hospital Administrator
Health Center Administrator
Clinic Manager
Ward Manager
Bed Manager
Scheduling Officer
Patient Flow Coordinator


🧍 10. PATIENT & COMMUNITY ROLES
Role
Patient
Caregiver
Family Representative
Community Health Volunteer


🧠 11. AI & SYSTEM ROLES
Role
AI Clinical Assistant
AI Triage Engine
AI Imaging Assistant
AI Pharmacy Checker
AI Referral Router
AI Documentation Assistant


🏥 12. SPECIALTY FACILITY ROLES (NEW CATEGORY)
Dental
Role
Dentist
Dental Surgeon
Dental Hygienist

Dermatology Clinic
Role
Dermatologist
Derm Nurse

Ophthalmology
Role
Ophthalmologist
Optometrist

Cardiology Clinic
Role
Cardiologist
Cardiac Technician


🧠 13. GOVERNMENT & PUBLIC HEALTH ROLES
Role
Public Health Officer
Epidemiologist
Disease Surveillance Officer
Health Data Analyst
Immunization Program Officer


⚙️ 14. SYSTEM META ROLES (EMR ENGINE)
Role
System Admin
Security Officer
Audit Officer
Data Protection Officer
Integration Engine


📊 FINAL COUNT (APPROX)
Category
Roles
Governance
13
Doctors
25+
Surgery
8+
Nursing
25+
Allied Health
8
Pharmacy
4
Lab
5
Radiology
4
Operations
6
Public Health
5
AI/System
6
Specialty Clinics
10+

👉 TOTAL: 110–130+ REAL-WORLD ROLES

🧠 HOW THIS IS USED IN YOUR EMR
1. ROLE TEMPLATE SYSTEM
Every hospital selects from this list
No free-text roles allowed
Ensures national standardization

2. FACILITY CONFIGURATION RULE
Each facility:
Facility {
  tier: "A | B | C | D | E",
  allowedRoles: Role[],
  enabledServices: Service[],
}


3. RBAC ENFORCEMENT
Permission {
  role,
  service,
  actions: ["create","read","update","approve"]
}



