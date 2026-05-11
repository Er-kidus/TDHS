````md
# 🧠 TENADAM NATIONAL HEALTH PLATFORM — BUILD RULES (MASTER ARCHITECTURE CONTRACT)

> This document defines **how the system must be built**, what MUST NOT be built as pre-packaged modules, and how **governance, services, roles, and UI must be composed at runtime**.

---

# 🚨 1. CORE ARCHITECTURE PRINCIPLE (MOST IMPORTANT)

## ❌ DO NOT BUILD AS FIXED SYSTEM MODULES

The following MUST NOT be hardcoded as fixed systems:

- ❌ Telemedicine system (as a monolith)
- ❌ Pharmacy system (as a monolith)
- ❌ AI system (as a monolith)
- ❌ Patient system (as a monolith)
- ❌ Role system (as static definitions)

---

## ✅ INSTEAD BUILD AS:

> 🧩 “Composable National Health Services Graph”

Everything must be:

- Service-based
- Permission-controlled
- Configurable at runtime
- Activated by governance layer
- Assigned per facility type
- Mapped via RBAC kernel

---

# 🏛️ 2. GOVERNANCE-FIRST ARCHITECTURE

## 🧠 SUPERADMIN ROLE (NATIONAL LEVEL)

Superadmin does NOT build features.

Superadmin ONLY:

### ✔ Defines:
- Role templates
- Facility templates
- Service bundles
- National compliance rules
- Default mappings

### ✔ Approves:
- Organization registrations
- Facility configurations
- Role activation
- Service activation

---

## 🏥 ORGANIZATION REGISTRATION FLOW

When a hospital/clinic registers:

1. Select facility type (Tier A–E or specialty)
2. System suggests default service bundles
3. Organization can:
   - accept defaults
   - modify services
   - request custom services
4. Superadmin can approve overrides

---

# 🧩 3. SERVICE-FIRST DESIGN RULE

## EVERYTHING IS A SERVICE

No system is prebuilt.

### Examples:

| Domain | Becomes |
|--------|--------|
| Telemedicine | QueueService + ConsultationService + ReferralService |
| Pharmacy | MedicationDispenseService + InventoryService |
| AI | TriageAssistService + SummarizationService |
| Patient Portal | IdentityService + RecordsAccessService |

---

## 🧠 SERVICE RULES

Each service must define:

```ts
Service {
  id: string;
  name: string;
  fhirMapping: Resource[];
  actions: Action[];
  inputSchema: JSONSchema;
  outputSchema: JSONSchema;
  requiresApproval: boolean;
  allowedRoles: Role[];
}
````

---

# 🏗️ 4. ROLE SYSTEM RULES (DYNAMIC RBAC)

## ❌ DO NOT HARDCODE ROLES

Instead:

* Roles are CREATED by governance
* Roles are ASSIGNED per facility
* Roles are LINKED to services

---

## ROLE STRUCTURE

```ts
Role {
  id: string;
  name: string;
  category: "clinical" | "admin" | "support" | "ai";
  permissions: Permission[];
}
```

---

## PERMISSION MODEL

```ts
Permission {
  serviceId: string;
  actions: ("create" | "read" | "update" | "execute" | "approve")[];
}
```

---

# 🏥 5. FACILITY GENERATION ENGINE RULES

## ❌ DO NOT BUILD STATIC TIERS IN CODE

Instead:

> Tier A–E are CONFIG TEMPLATES, NOT SYSTEM LOGIC

---

## FACILITY CREATION FLOW

When a facility is created:

1. Select:

   * Tier (A–E)
   * Specialty (optional)
2. System loads:

   * default service bundle
   * default role bundle
3. Admin can:

   * remove services
   * add services
   * assign roles

---

## SPECIALTY FACILITIES

Examples:

* Dermatology Clinic
* Dental Clinic
* Eye Clinic
* Orthopedic Center

Each is:

> A FILTERED SERVICE BUNDLE over Tier B/C/D/E capabilities

NOT a new system.

---

# 🧠 6. AI LAYER RULES (IMPORTANT)

## ❌ AI IS NOT A SYSTEM

AI is ONLY a SERVICE PROVIDER

### AI Services include:

* SymptomCheckerService
* TriageSuggestionService
* NoteTakerService
* ClinicalSummarizerService
* RoutingSuggestionService

---

## AI RULES

* AI CANNOT finalize records
* AI CANNOT prescribe independently
* AI CANNOT assign diagnosis authority
* AI MUST always output “suggestions only”
* Human approval required for execution

---

# 💊 7. PHARMACY RULES

Pharmacy is NOT a system.

It is a SERVICE SET:

* MedicationRequestService
* MedicationDispenseService
* InventoryService
* PrescriptionValidationService

---

## RULE

* Only licensed roles can dispense
* AI can suggest prescriptions only
* Every dispense must create FHIR MedicationDispense

---

# 📡 8. TELEMEDICINE RULES

Telemedicine is NOT a system.

It is composed of:

* QueueService
* ConsultationService
* MatchingService
* ReferralService
* AppointmentService

---

## RULES

* Doctors are “gig providers”
* Patients enter a national queue pool
* AI pre-triage assigns routing
* Facility referral is optional output

---

# 🧍 9. PATIENT LAYER RULES

Patient system is NOT a module.

It is:

* IdentityService
* RecordsAccessService
* AppointmentService
* NotificationService

---

## RULE

* Patients are SERVICE CONSUMERS only
* No system logic is tied to patient module

---

# 💳 10. PAYMENT INTEGRATION RULES

## PAYMENT IS A CROSS-CUTTING SERVICE

NOT part of pharmacy or telemedicine.

---

## PAYMENT SERVICE TYPES

```ts
PaymentService {
  invoiceGeneration;
  insuranceVerification;
  mobileMoneyIntegration;
  walletService;
  transactionLedger;
}
```

---

## PAYMENT RULES

* Every billable service generates Invoice
* Payment is independent of service execution
* Supports:

  * insurance
  * cash
  * mobile money
* Payment failure does NOT delete clinical records

---

# 🧩 11. UI BUILD RULES (CRITICAL)

## ❌ DO NOT BUILD:

* test dashboards
* mock pages
* sample UI
* isolated components

---

## ✅ BUILD INSTEAD:

> “Production-Ready UI Component Library + Pages Registry”

---

## UI RULES

### Every module MUST output:

#### 1. Pages

* Patient pages
* Doctor pages
* Admin pages
* Facility pages

#### 2. Components

* Tables
* Forms
* Queues
* Dashboards
* Charts

#### 3. Layouts

* Role-based dashboards
* Facility dashboards
* National dashboards

---

## UI COMPONENT RULE

Each UI must be:

```ts
UIComponent {
  name: string;
  role: Role[];
  service: string;
  dataSource: FHIRResource[];
  actions: Action[];
}
```

---

## DASHBOARD RULE

Every role gets:

* Overview dashboard
* Work queue dashboard
* Detail workspace
* Action panel

---

# 🔁 12. SERVICE GRAPH RULE

All services must connect into a national graph:

```text
Patient → AI Triage → Queue → Doctor → Facility → Pharmacy → Payment
```

OR

```text
Patient → AI → Telemedicine → Referral → Hospital → Discharge → Billing
```

---

# 🧠 13. ORCHESTRATION RULE (AGENTS + SUBAGENTS)

## SYSTEM MUST SUPPORT:

### 1. National Orchestrator

* routes services
* enforces RBAC
* manages queues

### 2. Facility Agents

* manage local workflows

### 3. AI Agents

* assist but never finalize

---

## RULE

Agents communicate ONLY through:

* Service events
* FHIR resources
* Queue updates

NOT direct function calls

---
