TIER E — FULL ROLE × SERVICE × DATA FLOW MATRIX (NATIONAL TERTIARY + TEACHING + RESEARCH HOSPITALS)

🧠 1. Consultant / Super-Specialist Physician
Role
Service
Inputs
Actions
Outputs
FHIR Resources
Consultant
Complex Diagnosis
Multi-system data
Diagnose rare disease
Condition
Condition
Consultant
Specialist Consultation
Referrals
Evaluate cases
Clinical impression
ClinicalImpression
Consultant
Advanced Care Planning
Chronic/complex cases
Long-term planning
CarePlan
CarePlan
Consultant
Multidisciplinary Care
Team input
Coordinate care
Shared plan
CarePlan
Consultant
Procedure Approval
Surgical/lab request
Approve/deny
Authorization
ServiceRequest
Consultant
Referral Acceptance
Tier D referrals
Accept cases
Admission plan
Encounter


🔴 ADVANCED SYSTEM LAYERS
Role
Service
Inputs
Actions
Outputs
FHIR
Consultant
Genetic Risk Stratification
Genomics
Interpret risk
Risk profile
MolecularSequence
Consultant
Oncology Protocols
Cancer data
Define chemo plan
Treatment protocol
CarePlan
Consultant
ICU Escalation Oversight
ICU data
Direct ICU care
Escalation plan
Encounter
Consultant
Audit Clinical Governance
Clinical actions
Review safety
Compliance report
AuditEvent


🔪 2. Super-Specialist Surgeon (Transplant / Neurosurgery / Cardiac)
Role
Service
Inputs
Actions
Outputs
FHIR
Surgeon
Complex Surgery
Imaging/labs
Perform surgery
Procedure record
Procedure
Surgeon
Transplant Surgery
Donor/recipient data
Organ transplant
Transplant record
Procedure
Surgeon
Surgical Planning
Pre-op assessment
Plan surgery
Surgical plan
CarePlan
Surgeon
Post-Op Management
Recovery data
Monitor complications
Observation
Observation
Surgeon
Emergency Surgery
Trauma
Immediate surgery
Emergency procedure
Procedure


🔴 OR + TRANSPLANT SYSTEM ADDITIONS
Role
Service
Inputs
Actions
Outputs
FHIR
Surgeon
OR Command System
Surgery schedule
Control OR flow
OR execution plan
Schedule
Surgeon
Organ Allocation System
Donor registry
Assign organs
Allocation record
Specimen
Surgeon
Surgical Inventory Control
Supplies
Track usage
Inventory update
Medication


🧠 3. Intensivist (ICU Command Authority)
Role
Service
Inputs
Actions
Outputs
FHIR
Intensivist
ICU Management
ICU patients
Manage critical care
ICU plan
Encounter
Intensivist
Ventilator Control
Respiratory data
Adjust ventilation
Device control
DeviceUseStatement
Intensivist
Hemodynamic Support
BP, labs
Manage shock
Stabilization plan
MedicationAdministration
Intensivist
Multi-organ Failure Care
System failure data
Coordinate support
ICU strategy
CarePlan
Intensivist
Code Blue Leadership
Arrest event
Resuscitate patient
Emergency record
Procedure


🔴 ICU SYSTEM LAYERS
Role
Service
Inputs
Actions
Outputs
FHIR
Intensivist
ICU Bed Allocation
Capacity
Assign ICU beds
Location update
Location
Intensivist
Critical Risk Prediction
Vitals
Predict collapse
Alert
Observation


💉 4. Advanced Anesthesiologist
Role
Service
Inputs
Actions
Outputs
FHIR
Anesthetist
Complex Anesthesia
Surgery plan
High-risk sedation
Procedure record
MedicationAdministration
Anesthetist
ICU Sedation
ICU patient
Long sedation control
ICU record
MedicationAdministration
Anesthetist
Pain Management
Chronic pain
Manage therapy
CarePlan
CarePlan
Anesthetist
Surgical Monitoring
OR vitals
Intra-op control
Observation
Observation


🧠 5. Resident Doctor (Supervised Clinical Layer)
Role
Service
Inputs
Actions
Outputs
FHIR
Resident
Draft Diagnosis
Patient data
Suggest diagnosis
Draft Condition
Condition
Resident
Care Plan Drafting
Clinical data
Create plan
Draft CarePlan
CarePlan
Resident
Order Requests
Labs/imaging
Request tests
ServiceRequest
ServiceRequest
Resident
Documentation
Clinical notes
Record encounter
Encounter
Encounter


🚫 Restrictions
Cannot finalize diagnosis
Cannot approve surgery
Requires consultant validation

🧑‍⚕️ 6. Intern Doctor (Entry Clinical Layer)
Role
Service
Inputs
Actions
Outputs
FHIR
Intern
Data Entry
Patient info
Record data
Observation
Observation
Intern
Documentation
Clinical notes
Write records
Encounter
Encounter
Intern
Procedure Assistance
Surgery assist
Assist procedures
Procedure log
Procedure


👩‍⚕️ 7. Specialized Nurses (ICU / Oncology / Dialysis)
Role
Service
Inputs
Actions
Outputs
FHIR
Nurse
ICU Monitoring
ICU vitals
Continuous monitoring
Observation
Observation
Nurse
Oncology Care
Chemo plan
Administer treatment
Medication record
MedicationAdministration
Nurse
Dialysis Operation
Dialysis data
Run dialysis
Treatment record
Procedure
Nurse
Device Management
ICU devices
Operate machines
Device record
DeviceUseStatement


🧪 8. Advanced Laboratory Specialist
Role
Service
Inputs
Actions
Outputs
FHIR
Lab Specialist
Genetic Testing
DNA sample
Analyze genetics
Molecular report
MolecularSequence
Lab Specialist
Histopathology
Tissue sample
Cancer diagnosis
Diagnostic report
DiagnosticReport
Lab Specialist
Advanced Diagnostics
Complex samples
Deep analysis
Observation
Observation


🩻 9. Advanced Radiologist
Role
Service
Inputs
Actions
Outputs
FHIR
Radiologist
CT/MRI Interpretation
Imaging data
Diagnose scans
Diagnostic report
DiagnosticReport
Radiologist
Angiography Analysis
Vascular scans
Interpret vessels
Report
ImagingStudy
Radiologist
Interventional Guidance
Procedure data
Guide surgery
Imaging support
ImagingStudy


💊 10. Clinical Pharmacist (Advanced ICU/Oncology)
Role
Service
Inputs
Actions
Outputs
FHIR
Pharmacist
ICU Medication Control
ICU drugs
Adjust dosing
Medication record
MedicationAdministration
Pharmacist
Oncology Drugs
Chemo protocol
Manage meds
Treatment record
MedicationRequest
Pharmacist
Interaction Review
Full med list
Detect conflicts
Alert
AllergyIntolerance


🎓 11. Medical Educator / Professor
Role
Service
Inputs
Actions
Outputs
FHIR
Educator
Teaching Rounds
Clinical cases
Supervise trainees
Encounter record
Encounter
Educator
Skill Evaluation
Trainee performance
Assess learners
Evaluation
Observation
Educator
Training Documentation
Education sessions
Record training
DocumentReference
DocumentReference


🔬 12. Clinical Researcher
Role
Service
Inputs
Actions
Outputs
FHIR
Researcher
Clinical Trials
Patient data
Run trials
Research study
ResearchStudy
Researcher
Patient Enrollment
Consent
Enroll subjects
Trial cohort
ResearchSubject
Researcher
Data Analysis
Clinical data
Analyze outcomes
Research results
Observation


🧑‍💼 13. Hospital Administrator (Advanced)
Role
Service
Inputs
Actions
Outputs
FHIR
Admin
ICU Capacity Management
Bed data
Allocate ICU beds
Location
Location
Admin
OR Scheduling System
Surgery queue
Schedule OR
Schedule
Schedule
Admin
Resource Allocation
Staff/equipment
Distribute resources
Optimization plan
Task
Admin
National Reporting
Hospital data
Send reports
Health stats
Bundle


🧍 14. Patient (Advanced Tertiary Care)
Role
Service
Inputs
Actions
Outputs
FHIR
Patient
Specialist Care
Appointment
Receive care
Encounter
Encounter
Patient
ICU Admission
Critical condition
ICU stay
EpisodeOfCare
EpisodeOfCare
Patient
Surgery
Surgical plan
Undergo surgery
Procedure
Procedure
Patient
Research Consent
Trial request
Join study
Consent
Consent


🤖 15. AI Clinical Assistant (Advanced Hospital AI)
Role
Service
Inputs
Actions
Outputs
FHIR
AI
ICU Risk Prediction
Vitals
Predict deterioration
Alert
Observation
AI
Imaging Assistance
CT/MRI
Assist diagnosis
Insight
ImagingStudy
AI
Treatment Optimization
Care plans
Suggest improvements
Plan
CarePlan
AI
Clinical Decision Support
Patient data
Assist diagnosis
Recommendation
Condition



