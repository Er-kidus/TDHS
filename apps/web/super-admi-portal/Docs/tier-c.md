Perfect — this is now very close to a real national health system spec. I will now upgrade your Tier C into the FULL IMPLEMENTATION-GRADE MATRIX (same style as Tier A/B), but with:
No duplication
No missing roles/services
Full FHIR mapping
Explicit inputs → actions → outputs
Proper separation of clinical vs operational vs system services
Minor surgery correctly integrated as a procedural domain

🔵 TIER C — FULL ROLE × SERVICE × DATA FLOW MATRIX (NATIONAL-READY HEALTH CENTERS)

👨‍⚕️ 1. Medical Officer (Primary Clinical Authority)
Role
Service
Inputs
Actions
Outputs
FHIR Resources
MO
OPD Consultation
Symptoms, history
Diagnose & treat
Clinical record
Encounter, Condition
MO
Clinical Assessment
Vitals, exam
Full evaluation
Clinical impression
ClinicalImpression
MO
Inpatient Admission
Patient condition
Admit patient
Episode created
EpisodeOfCare, Encounter
MO
Inpatient Management
Ward data
Manage care
Updated care plan
CarePlan
MO
Emergency Stabilization
Critical signs
Stabilize patient
Stabilized record
Observation
MO
Prescription Service
Diagnosis
Prescribe meds
Medication order
MedicationRequest
MO
Referral Management
Severe cases
Refer upward
Referral
ServiceRequest
MO
Minor Surgery
Surgical indication
Perform procedure
Procedure record
Procedure
MO
Delivery Oversight
Labor data
Supervise delivery
Birth record
Procedure


🔴 SYSTEM LAYERS (ADDED)
Role
Service
Inputs
Actions
Outputs
FHIR
MO
Longitudinal Care
Patient history
Track chronic care
Episode tracking
EpisodeOfCare
MO
Follow-Up Management
Discharge cases
Schedule follow-ups
Appointment
Appointment, Task
MO
Medication Reconciliation
Current meds
Review meds
Updated list
MedicationStatement
MO
Drug Safety Check
Prescription list
Detect conflicts
Alert
AllergyIntolerance
MO
Clinical Document Exchange
Referral data
Share records
Document bundle
DocumentReference
MO
Audit Logging
All actions
Log activity
Audit trail
AuditEvent


👩‍⚕️ 2. Midwife (Maternal & Delivery Lead)
Role
Service
Inputs
Actions
Outputs
FHIR
Midwife
ANC Monitoring
Pregnancy data
Track pregnancy
Care plan
EpisodeOfCare
Midwife
Labor Monitoring
Contractions, vitals
Track labor
Delivery status
Observation
Midwife
Delivery Management
Labor stage
Conduct delivery
Birth event
Procedure
Midwife
Postnatal Care
Mother/newborn
Monitor recovery
Follow-up record
Encounter
Midwife
Neonatal Stabilization
Newborn status
Stabilize baby
Neonatal record
Observation
Midwife
Referral Escalation
Complications
Refer case
Referral
ServiceRequest


🔴 SYSTEM ADDITIONS
Role
Service
Inputs
Actions
Outputs
FHIR
Midwife
Follow-Up Tracking
ANC/PNC schedule
Ensure visits
Appointment
Appointment
Midwife
Risk Detection
Pregnancy data
Flag risk
Alert
Flag
Midwife
Audit Logging
Actions
Track care
AuditEvent
AuditEvent


👩‍⚕️ 3. Ward Nurse (Inpatient Execution Layer)
Role
Service
Inputs
Actions
Outputs
FHIR
Nurse
Inpatient Monitoring
Vital signs
Monitor patients
Observation
Observation
Nurse
Medication Administration
Prescriptions
Administer drugs
Medication record
MedicationAdministration
Nurse
Care Plan Execution
Treatment plan
Execute care
Updated status
CarePlan
Nurse
Wound Care
Surgical wounds
Dressing care
Procedure record
Procedure
Nurse
Patient Observation
Patient status
Continuous monitoring
Clinical updates
Encounter


🔴 SYSTEM ADDITIONS
Role
Service
Inputs
Actions
Outputs
FHIR
Nurse
Follow-Up Tracking
Discharge list
Track returns
Appointment
Appointment
Nurse
Infection Control Logging
Infection data
Record cases
Infection report
Condition
Nurse
Audit Logging
Activity
Track actions
Audit trail
AuditEvent


🧪 4. Laboratory Technologist
Role
Service
Inputs
Actions
Outputs
FHIR
Lab Tech
Specimen Collection
Blood/urine
Collect sample
Specimen
Specimen
Lab Tech
Basic Lab Testing
Sample
Run tests
Results
Observation
Lab Tech
Diagnostic Reporting
Test results
Publish report
Report
DiagnosticReport
Lab Tech
Sample Processing
Lab workflow
Process samples
Processed specimen
Specimen


🔴 SYSTEM ADDITIONS
Role
Service
Inputs
Actions
Outputs
FHIR
Lab Tech
Result Validation
Test output
Verify accuracy
Validated report
DiagnosticReport
Lab Tech
Audit Logging
Lab activity
Track actions
AuditEvent
AuditEvent


🩻 5. Radiology Technician
Role
Service
Inputs
Actions
Outputs
FHIR
Radiology Tech
X-Ray Imaging
Patient order
Perform scan
Image
ImagingStudy
Radiology Tech
Basic Ultrasound
Pregnancy/abdomen
Perform scan
Imaging result
ImagingStudy
Radiology Tech
Image Reporting
Scan data
Structured report
Diagnostic report
DiagnosticReport


🔴 SYSTEM ADDITIONS
Role
Service
Inputs
Actions
Outputs
FHIR
Radiology Tech
Audit Logging
Imaging actions
Track usage
AuditEvent
AuditEvent


💊 6. Pharmacy Unit (FULL CLINICAL PHARMACY)
Role
Service
Inputs
Actions
Outputs
FHIR
Pharmacist
Prescription Validation
Rx
Verify safety
Approved Rx
MedicationRequest
Pharmacist
Dispensing
Approved Rx
Dispense meds
Dispense record
MedicationDispense
Pharmacist
Inventory Management
Stock
Update stock
Inventory
Medication
Pharmacist
Medication Administration Support
Hospital meds
Assist admin
Admin record
MedicationAdministration


🔴 SYSTEM ADDITIONS
Role
Service
Inputs
Actions
Outputs
FHIR
Pharmacist
Drug Interaction Check
Medication list
Detect conflicts
Alert
AllergyIntolerance
Pharmacist
Audit Logging
Pharmacy actions
Track usage
AuditEvent
AuditEvent


🧑‍💼 7. Health Center Administrator
Role
Service
Inputs
Actions
Outputs
FHIR
Admin
Bed Management
Admission data
Assign beds
Location update
Location
Admin
Patient Flow
Queue data
Manage flow
Encounter updates
Encounter
Admin
Scheduling
OPD/ward data
Schedule visits
Appointment
Appointment
Admin
Reporting
Facility data
Generate reports
Bundle
Bundle
Admin
Staff Management
Staff data
Manage users
System config
System
Admin
Billing (optional)
Service usage
Generate claims
Invoice
Claim, Invoice


🔴 SYSTEM ADDITIONS
Role
Service
Inputs
Actions
Outputs
FHIR
Admin
Financial Reporting
Claims
Financial analysis
Report
Claim
Admin
Audit Monitoring
Logs
Compliance check
Audit report
AuditEvent
Admin
Referral Tracking
Referrals
Monitor flow
Status
ServiceRequest


🧍 8. Patient
Role
Service
Inputs
Actions
Outputs
FHIR
Patient
OPD Visit
Symptoms
Attend clinic
Encounter
Encounter
Patient
Admission
Clinical need
Hospital stay
EpisodeOfCare
EpisodeOfCare
Patient
Delivery Service
Labor
Receive care
Birth record
Procedure
Patient
View Records
Patient ID
Access data
Clinical history
Patient, Condition
Patient
Discharge Summary
Hospital stay
View report
Document
DocumentReference


🔴 SYSTEM ADDITIONS
Role
Service
Inputs
Actions
Outputs
FHIR
Patient
Follow-Up Compliance
Appointments
Attend visits
Status update
Appointment
Patient
Consent Management
Consent request
Approve care
Consent record
Consent


🤖 9. AI Clinical Assistant
Role
Service
Inputs
Actions
Outputs
FHIR
AI
Risk Monitoring
Vitals
Detect deterioration
Alert
Observation
AI
Delivery Risk Scoring
Pregnancy data
Risk prediction
Flag
Flag
AI
Clinical Suggestions
Patient data
Suggest plan
Draft care plan
CarePlan
AI
Lab Interpretation
Lab results
Interpret results
Insight
DiagnosticReport


🔴 SYSTEM ADDITIONS
Role
Service
Inputs
Actions
Outputs
FHIR
AI
Follow-Up Prediction
Visit history
Predict dropout
Task
Task
AI
Decision Support
Clinical data
Assist planning
Recommendation
CarePlan



