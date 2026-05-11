TIER A — FULL ROLE × SERVICE × DATA FLOW MATRIX (NATIONAL-GRADE)

 1. Community Health Worker (HEW)
Role
Service
Inputs
Actions
Outputs
FHIR Resources
HEW
Patient Registration
Demographics, household data
Create/update patient
Patient profile
Patient, RelatedPerson
HEW
Encounter & Triage
Symptoms, vitals
Record visit
Encounter record
Encounter, Observation
HEW
Condition Capture
Symptoms
Record suspected condition
Condition record
Condition
HEW
Referral Management
Patient status
Create referral
Referral request
ServiceRequest
HEW
Immunization
Vaccine data
Record vaccination
Immunization record
Immunization
HEW
MCH (ANC/PNC)
Pregnancy status
Track visits
Care plan
EpisodeOfCare, CarePlan
HEW
Nutrition
MUAC, weight
Record nutrition status
Nutrition observation
Observation, Condition
HEW
Emergency Detection
Danger signs
Flag emergency
Emergency alert
Flag, ServiceRequest
HEW
Reporting
Daily logs
Submit reports
Aggregated data
Bundle


 CRITICAL SYSTEM ADDITIONS (NEW)
Role
Service
Inputs
Actions
Outputs
FHIR
HEW
Longitudinal Care
Patient history
Track ongoing cases
Episode tracking
EpisodeOfCare
HEW
Follow-Up Tracking
Missed visits
Schedule follow-up
Appointment
Appointment, Task
HEW
Clinical Document Exchange
Referral data
Send records
Shared document
DocumentReference, Bundle
HEW
Audit Logging
User actions
Log activity
Audit trail
AuditEvent


🔹 OPTIONAL SERVICES
Role
Service
Inputs
Actions
Outputs
FHIR
HEW
Basic Treatment
Simple diagnosis
Record meds
Medication record
MedicationStatement
HEW
Disease Surveillance
Symptoms
Report suspected case
Surveillance data
Condition, Observation
HEW
Family Planning
Patient request
Counseling + record
Service record
ServiceRequest
HEW
Health Education
Community session
Log session
Education record
Encounter
HEW
Outreach
Population data
Register group visits
Outreach record
Group, Encounter


 2. Triage Nurse (Light)
Role
Service
Inputs
Actions
Outputs
FHIR
Triage Nurse
Advanced Triage
Vitals, symptoms
Record + assess
Severity level
Observation
Triage Nurse
MCH Monitoring
ANC data
Monitor progress
Updated care plan
CarePlan
Triage Nurse
Emergency Detection
Clinical signs
Flag risk
Alert
Flag
Triage Nurse
Referral Validation
Referral data
Approve/escalate
Validated referral
ServiceRequest


SYSTEM ADDITIONS
Role
Service
Inputs
Actions
Outputs
FHIR
Triage Nurse
Follow-Up Tracking
Missed visits
Schedule revisit
Appointment
Appointment
Triage Nurse
Audit Logging
Activity logs
Track actions
Audit record
AuditEvent


3. Mobile Outreach Agent
Role
Service
Inputs
Actions
Outputs
FHIR
Outreach Agent
Patient Registration
Offline data
Create patient
Patient record
Patient
Outreach Agent
Encounter Capture
Visit info
Record visit
Encounter
Encounter
Outreach Agent
Immunization
Vaccine data
Record vaccine
Immunization
Immunization
Outreach Agent
Outreach
Population data
Bulk register
Group data
Group


🔴 SYSTEM ADDITIONS
Role
Service
Inputs
Actions
Outputs
FHIR
Outreach Agent
Offline Sync
Stored data
Sync to server
Synced records
Bundle
Outreach Agent
Audit Logging
Sync logs
Track actions
Audit trail
AuditEvent


🧑‍💼 4. Health Post Admin
Role
Service
Inputs
Actions
Outputs
FHIR/System
Admin
Reporting
Facility data
Generate reports
Aggregated data
Bundle
Admin
User Management
Staff data
Create/update users
User records
System
Admin
Service Config
Config data
Enable services
Config state
System
Admin
Referral Oversight
Referral logs
Track referrals
Status tracking
ServiceRequest


🔴 CRITICAL ADDITIONS
Role
Service
Inputs
Actions
Outputs
FHIR
Admin
Audit Monitoring
Activity logs
Review logs
Compliance report
AuditEvent
Admin
Document Exchange Oversight
Records
Validate transfers
Shared records
DocumentReference


🧍 5. Patient (Self-Service)
Role
Service
Inputs
Actions
Outputs
FHIR
Patient
Registration
Personal data
Self-register
Patient record
Patient
Patient
View Records
Patient ID
Retrieve data
Health info
Patient, Encounter
Patient
Appointment Request
Availability
Request visit
Appointment
Appointment
Patient
Notifications
System alerts
Receive alerts
Notification
System


🔴 ADDITIONS
Role
Service
Inputs
Actions
Outputs
FHIR
Patient
Follow-Up Compliance
Appointment data
Attend/confirm
Updated status
Appointment
Patient
Consent Management
Consent data
Provide consent
Consent record
Consent


🤖 6. AI Assistant
Role
Service
Inputs
Actions
Outputs
FHIR
AI
Triage Support
Observations
Suggest severity
Risk score
Observation
AI
MCH Risk Detection
Care plan
Flag risk
Alert
CarePlan
AI
Data Entry Assist
Form input
Auto-fill
Draft record
Encounter
AI
Follow-Up Prediction
Visit history
Predict dropout
Task suggestion
Task


🚫 Restrictions
Cannot finalize records
Cannot prescribe
Cannot override human

