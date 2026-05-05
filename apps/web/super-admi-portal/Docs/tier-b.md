Perfect — this is a strong Tier B already. Now I’ll upgrade it to full national-grade (no gaps, full system layers, full data flow, no missing roles/services).
I will:
keep your structure ✔
add missing services (continuity, safety, billing, audit, interoperability) ✔
add missing roles (pharmacy, records, referral, etc.) ✔
expand into FULL IMPLEMENTATION TABLE (Role × Service × Inputs × Actions × Outputs × FHIR) ✔

🟡 TIER B — FULL ROLE × SERVICE × DATA FLOW MATRIX (NATIONAL-GRADE)

👨‍⚕️ 1. General Practitioner (GP / Medical Officer)
Role
Service
Inputs
Actions
Outputs
FHIR Resources
GP
OPD Consultation
Symptoms, history
Diagnose, treat
Encounter record
Encounter
GP
Condition Management
Clinical findings
Create/update diagnosis
Condition
Condition
GP
Clinical Assessment
Vitals, symptoms
Full evaluation
Clinical impression
ClinicalImpression
GP
Prescription Service
Diagnosis
Prescribe medication
Prescription
MedicationRequest
GP
Minor Procedures
Injury data
Perform procedures
Procedure record
Procedure
GP
Referral Management
Case severity
Refer patient
Referral
ServiceRequest
GP
Care Planning
Chronic data
Create plan
Care plan
CarePlan


CRITICAL SYSTEM ADDITIONS
Role
Service
Inputs
Actions
Outputs
FHIR
GP
Longitudinal Care
Patient history
Manage chronic cases
Episode tracking
EpisodeOfCare
GP
Follow-Up Management
Visit history
Schedule revisit
Appointment
Appointment, Task
GP
Medication Reconciliation
Medication history
Review meds
Updated list
MedicationStatement
GP
Drug Interaction Check
Med list
Validate safety
Safety alert
AllergyIntolerance
GP
Clinical Document Exchange
Referral data
Share records
Document
DocumentReference
GP
Audit Logging
Actions
Log activity
Audit trail
AuditEvent


👩‍⚕️ 2. Registered Nurse (Clinic Nurse)
Role
Service
Inputs
Actions
Outputs
FHIR
Nurse
Triage Service
Vitals, symptoms
Record triage
Observation
Observation
Nurse
Medication Administration
Prescription
Administer meds
Admin record
MedicationAdministration
Nurse
Follow-Up Monitoring
Care plan
Monitor patient
Updated status
Observation
Nurse
Wound Care
Injury
Provide care
Procedure record
Procedure


🔴 ADDITIONS
Role
Service
Inputs
Actions
Outputs
FHIR
Nurse
Follow-Up Tracking
Missed visits
Track compliance
Appointment update
Appointment
Nurse
Patient Education
Patient data
Educate patient
Education record
Encounter
Nurse
Audit Logging
Activity
Track actions
Audit trail
AuditEvent


🧪 3. Medical Laboratory Technologist
Role
Service
Inputs
Actions
Outputs
FHIR
Lab Tech
Specimen Collection
Patient sample
Collect specimen
Specimen record
Specimen
Lab Tech
Lab Testing
Sample
Run tests
Test result
Observation
Lab Tech
Result Reporting
Test data
Publish results
Diagnostic report
DiagnosticReport
Lab Tech
Sample Processing
Sample
Label/store
Processed sample
Specimen


🔴 ADDITIONS
Role
Service
Inputs
Actions
Outputs
FHIR
Lab Tech
Result Validation
Test data
Verify results
Validated report
DiagnosticReport
Lab Tech
Audit Logging
Activity
Track actions
AuditEvent
AuditEvent


💊 4. Pharmacist / Pharmacy Technician (MISSING — NOW ADDED)
Role
Service
Inputs
Actions
Outputs
FHIR
Pharmacist
Prescription Validation
Prescription
Verify meds
Approved prescription
MedicationRequest
Pharmacist
Medication Dispensing
Approved Rx
Dispense meds
Dispense record
MedicationDispense
Pharmacist
Medication Counseling
Patient
Educate
Counseling record
Encounter


🔴 ADDITIONS
Role
Service
Inputs
Actions
Outputs
FHIR
Pharmacist
Drug Interaction Check
Med list
Validate
Alert
AllergyIntolerance
Pharmacist
Inventory Tracking
Stock
Update stock
Inventory record
Medication
Pharmacist
Audit Logging
Activity
Track
Audit trail
AuditEvent


🧾 5. Health Information Officer / Records Officer (CRITICAL ROLE ADDED)
Role
Service
Inputs
Actions
Outputs
FHIR
HIO
Record Management
Patient data
Maintain records
Clean data
Patient
HIO
Data Quality Control
Records
Validate
Clean dataset
Bundle
HIO
Document Management
Clinical docs
Organize
Document store
DocumentReference


🔴 ADDITIONS
Role
Service
Inputs
Actions
Outputs
FHIR
HIO
Interoperability
External data
Exchange
Synced data
Bundle
HIO
Audit Monitoring
Logs
Review
Compliance
AuditEvent


🧑‍💼 6. Clinic Administrator / Operations Manager
Role
Service
Inputs
Actions
Outputs
FHIR/System
Admin
Patient Flow
Queue data
Manage flow
Updated queue
Encounter
Admin
Appointment Scheduling
Requests
Schedule
Appointment
Appointment
Admin
Staff Management
Staff data
Manage users
User records
System
Admin
Reporting
System data
Generate reports
Reports
Bundle
Admin
Billing
Service usage
Generate claims
Invoice
Claim, Invoice


🔴 ADDITIONS
Role
Service
Inputs
Actions
Outputs
FHIR
Admin
Financial Reporting
Claims
Analyze
Financial report
Claim
Admin
Audit Monitoring
Logs
Review
Compliance
AuditEvent
Admin
Referral Oversight
Referral data
Track
Status
ServiceRequest


🧍 7. Patient
Role
Service
Inputs
Actions
Outputs
FHIR
Patient
OPD Visit
Symptoms
Attend
Encounter
Encounter
Patient
View Records
Patient ID
Retrieve
Health data
Patient
Patient
Prescription Access
Rx
View
Medication list
MedicationRequest
Patient
Appointment Booking
Availability
Schedule
Appointment
Appointment


🔴 ADDITIONS
Role
Service
Inputs
Actions
Outputs
FHIR
Patient
Follow-Up Compliance
Appointment
Attend/confirm
Updated status
Appointment
Patient
Consent Management
Consent
Approve
Consent record
Consent


🤖 8. AI Clinical Assistant
Role
Service
Inputs
Actions
Outputs
FHIR
AI
Symptom Analysis
Symptoms
Suggest conditions
Suggestions
Observation
AI
Risk Scoring
Patient data
Evaluate risk
Risk score
Observation
AI
Prescription Draft
Diagnosis
Suggest meds
Draft Rx
MedicationRequest
AI
Clinical Summary
Records
Generate summary
Summary
ClinicalImpression


🔴 ADDITIONS
Role
Service
Inputs
Actions
Outputs
FHIR
AI
Follow-Up Prediction
Visit history
Predict dropouts
Task
Task
AI
Decision Support
Clinical data
Suggest plan
CarePlan draft
CarePlan



