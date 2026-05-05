# STAFF MANAGEMENT SYSTEM - VISUAL DEPLOYMENT GUIDE

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/TypeScript)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  StaffManagementPage.tsx                                         │
│  ├── StaffForm.tsx (Create/Edit)                                 │
│  │   ├── Template Selector (100+)                               │
│  │   ├── Role Auto-mapper                                       │
│  │   └── Form Validation                                        │
│  └── StaffList.tsx (Display)                                    │
│      ├── Staff Table                                            │
│      ├── Actions (Edit/Delete)                                  │
│      └── Status Indicators                                      │
│                                                                   │
│  Services: staff.service.ts                                      │
│  Hooks: useStaff.ts                                             │
│  Config: config.ts (100+ templates)                             │
│                                                                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP/REST API
         ┌─────────────────┴─────────────────┐
         │                                   │
┌────────▼──────────────────────────────────▼────────────────────┐
│           API GATEWAY (Go/HTTP Handler)                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  staff_assignment_api.go                                        │
│  ├── CreateStaffAssignment()                                    │
│  │   ├── validateAndMapRole() ✓ Validation                     │
│  │   ├── getValidRoles() ✓ List available                      │
│  │   ├── Check approval status                                  │
│  │   ├── Check tier access                                      │
│  │   └── Create profile + audit log                            │
│  ├── GetOrganizationStaff()                                     │
│  ├── UpdateStaffMember()                                        │
│  └── DeleteStaffMember()                                        │
│                                                                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ PostgreSQL Driver
         ┌─────────────────┴─────────────────┐
         │                                   │
┌────────▼──────────────────────────────────▼────────────────────┐
│           DATABASE (PostgreSQL)                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  CORE TABLES:                                                   │
│  ├── roles (80+)              ┌─ doctor_gp, doctor_specialist │
│  │                            ├─ nurse_rn, nurse_lpn          │
│  │                            ├─ lab_technician, lab_phleb    │
│  │                            ├─ pharm_pharmacist             │
│  │                            ├─ admin, admin_exec, admin_hr  │
│  │                            ├─ reception_ward, reception    │
│  │                            ├─ staff_care, staff_logistics  │
│  │                            └─ superadmin                   │
│  │                                                              │
│  ├── staff_role_templates (40+)  ┌─ ward-clerk                │
│  │   (template_key → api_role)    ├─ nurse-rn                 │
│  │   Maps roles for UI            ├─ diag-lab-tech            │
│  │                                ├─ pharm-dispensing         │
│  │                                └─ med-gp                   │
│  │                                                              │
│  ├── org_staff_profiles         ┌─ user_id                    │
│  │   (Actual assignments)       ├─ organization_id            │
│  │                              ├─ staff_template_key         │
│  │                              └─ role (validated)           │
│  │                                                              │
│  ├── organization_staff_template_requests                      │
│  │   (Approval workflow)                                       │
│  │                                                              │
│  ├── staff_template_tier_access                                │
│  │   (Tier restrictions)                                       │
│  │                                                              │
│  ├── organization_configurations                               │
│  │   (Org tier settings)                                       │
│  │                                                              │
│  ├── staff_audit_log                                           │
│  │   (Change tracking)                                         │
│  │                                                              │
│  └── compliance_audit_log                                      │
│      (Compliance tracking)                                     │
│                                                                   │
│  INDEXES:                                                       │
│  ├── roles(name, active)                                       │
│  ├── staff_role_templates(template_key, active)               │
│  ├── org_staff_profiles(org_id, user_id, role)                │
│  └── audit_logs(org_id)                                        │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow

### Creating a Staff Member

```
USER                  FRONTEND              API GATEWAY           DATABASE
 │                       │                      │                   │
 ├─ Select Template ────>│                      │                   │
 │                       │ Auto-map Role        │                   │
 │                       │ (config.ts)          │                   │
 │                       │                      │                   │
 ├─ Fill Form ─────────>│                      │                   │
 │ (Name, Email, etc)   │                      │                   │
 │                       │                      │                   │
 ├─ Click Submit ──────>│                      │                   │
 │                       │ POST /api/org/.../staff                  │
 │                       ├─────────────────────>│                   │
 │                       │                      │ validateAndMapRole│
 │                       │                      │ getValidRoles()   │
 │                       │                      │ Check approval    │
 │                       │                      ├──────────────────>│
 │                       │                      │ SELECT FROM roles │
 │                       │                      │ WHERE name = ?    │
 │                       │                      │<──────────────────┤
 │                       │                      │ ✓ Role Exists     │
 │                       │                      │                   │
 │                       │                      │ INSERT staff      │
 │                       │                      │ INSERT audit log  │
 │                       │                      ├──────────────────>│
 │                       │                      │<──────────────────┤
 │                       │ 201 Created          │                   │
 │                       │<─────────────────────┤                   │
 │                       │                      │                   │
 │<─ Success Message ────│                      │                   │
 │  Staff Added!         │                      │                   │
 │                       │                      │                   │
 └─ Refresh List ──────>│                      │                   │
                        │ GET /api/org/.../staff                   │
                        ├─────────────────────>│                   │
                        │                      ├──────────────────>│
                        │                      │ SELECT * FROM     │
                        │                      │ org_staff_profiles│
                        │                      │<──────────────────┤
                        │ Staff List            │                   │
                        │<─────────────────────┤                   │
                        │                      │                   │
```

### Invalid Role Scenario

```
USER                  FRONTEND              API GATEWAY           DATABASE
 │                       │                      │                   │
 ├─ Select Template ────>│                      │                   │
 ├─ Manually Enter ─────>│                      │                   │
 │  Invalid Role         │                      │                   │
 │                       │                      │                   │
 ├─ Click Submit ──────>│                      │                   │
 │                       │ POST with invalid_role                  │
 │                       ├─────────────────────>│                   │
 │                       │                      │ validateAndMapRole│
 │                       │                      │ getValidRoles()   │
 │                       │                      ├──────────────────>│
 │                       │                      │ SELECT COUNT(*) FROM
 │                       │                      │ roles WHERE       │
 │                       │                      │ name = 'invalid'  │
 │                       │                      │<──────────────────┤
 │                       │                      │ ✗ NOT FOUND       │
 │                       │                      │                   │
 │                       │                      │ SELECT FROM roles │
 │                       │                      │ WHERE active = T  │
 │                       │                      │<──────────────────┤
 │                       │ 400 Bad Request      │ (List of 80 roles)
 │                       │ {error, available}   │                   │
 │                       │<─────────────────────┤                   │
 │                       │                      │                   │
 │<─ Error Display ──────│                      │                   │
 │  "Invalid role"       │                      │                   │
 │  Available: [list]    │                      │                   │
 │                       │                      │                   │
```

---

## 📦 Deployment Steps

```
STEP 1: DATABASE SETUP
├── Apply Schema
│   └── psql -f database/schemas/003_staff_management.sql
│       ✓ 8 tables created
│       ✓ Indexes added
│       ✓ Constraints defined
│
├── Apply Seed Data
│   └── psql -f database/seeds/001_staff_roles_and_templates.sql
│       ✓ 80+ roles inserted
│       ✓ 40+ templates inserted
│       ✓ All relationships valid
│
└── Verify
    ├── SELECT COUNT(*) FROM roles;  -- ~80
    ├── SELECT COUNT(*) FROM staff_role_templates;  -- ~40+
    └── All role mappings valid ✓

STEP 2: BACKEND DEPLOYMENT
├── Verify Validation Functions
│   ├── validateAndMapRole() ✓
│   ├── getValidRoles() ✓
│   └── getRoleIDByName() ✓
│
└── Restart API Gateway
    └── docker restart api-gateway

STEP 3: FRONTEND DEPLOYMENT
├── Copy Configuration
│   └── src/config.ts  (100+ templates)
│
├── Copy Services
│   └── src/services/staff.service.ts
│
├── Copy Hooks
│   └── src/hooks/useStaff.ts
│
├── Copy Components
│   ├── src/components/staff/StaffForm.tsx
│   ├── src/components/staff/StaffList.tsx
│   └── src/components/staff/AlertMessage.tsx
│
└── Copy Pages
    └── src/pages/StaffManagementPage.tsx

STEP 4: TESTING
├── API Tests
│   ├── POST with valid role → 201 Created ✓
│   ├── POST with invalid role → 400 with list ✓
│   ├── GET staff list → 200 with data ✓
│   └── DELETE staff → 200 with confirmation ✓
│
├── Frontend Tests
│   ├── Templates load (100+) ✓
│   ├── Role auto-populates ✓
│   ├── Form validation works ✓
│   ├── Errors display properly ✓
│   └── Success messages appear ✓
│
└── Integration Tests
    ├── Create flow works end-to-end ✓
    ├── Error handling shows available roles ✓
    ├── List refreshes after create ✓
    └── Audit logs are created ✓

STEP 5: VERIFICATION
├── Database Check
│   ├── All tables exist ✓
│   ├── All data inserted ✓
│   ├── Indexes present ✓
│   └── Relationships valid ✓
│
├── API Check
│   ├── Validation functions work ✓
│   ├── Error responses correct ✓
│   ├── Audit logs created ✓
│   └── Auth checks passing ✓
│
└── Frontend Check
    ├── Components render ✓
    ├── Workflow complete ✓
    ├── Errors display ✓
    └── Success notifications ✓
```

---

## 📋 File Organization

```
PROJECT ROOT
├── database/
│   ├── schemas/
│   │   ├── 001_core.sql (Existing)
│   │   ├── 002_registry.sql (Existing)
│   │   └── 003_staff_management.sql ✅ NEW
│   └── seeds/
│       └── 001_staff_roles_and_templates.sql ✅ NEW
│
├── gateway/api-gateway/api/
│   ├── staff_assignment_api.go (Updated)
│   ├── staff_validation.go (Existing)
│   └── routes.go (Existing)
│
├── apps/web/src/
│   ├── config.ts ✅ NEW
│   ├── services/
│   │   └── staff.service.ts ✅ NEW
│   ├── hooks/
│   │   └── useStaff.ts ✅ NEW
│   ├── components/staff/
│   │   ├── StaffForm.tsx ✅ NEW
│   │   ├── StaffList.tsx ✅ NEW
│   │   └── AlertMessage.tsx ✅ NEW
│   └── pages/
│       └── StaffManagementPage.tsx ✅ NEW
│
└── Documentation/
    ├── COMPREHENSIVE_STAFF_SYSTEM_COMPLETE.md ✅ NEW
    ├── DATABASE_DEPLOYMENT_GUIDE.md ✅ NEW
    ├── STAFF_ROLE_VALIDATION_FIX.md ✅ NEW
    ├── STAFF_ROLE_VALIDATION_FIX_SUMMARY.md ✅ NEW
    ├── STAFF_SYSTEM_QUICK_REFERENCE.md ✅ NEW
    ├── DATABASE_IMPLEMENTATION_CHECKLIST.md ✅ NEW
    ├── IMPLEMENTATION_COMPLETE.md ✅ NEW
    └── VISUAL_DEPLOYMENT_GUIDE.md ✅ NEW (this file)
```

---

## 🎯 Role Hierarchy

```
SUPERADMIN
    │
    └─── ADMIN_EXEC
         │
         ├─── DOCTOR_EXEC (CMO)
         │    ├─── DOCTOR_SENIOR (Attending)
         │    │    ├─── DOCTOR_LEAD (HOD)
         │    │    ├─── DOCTOR_SPECIALIST (Consultant)
         │    │    ├─── DOCTOR_SURGEON
         │    │    ├─── DOCTOR_ANES (Anesthesiologist)
         │    │    ├─── DOCTOR_ICU (Intensivist)
         │    │    ├─── DOCTOR_RADIO (Radiologist)
         │    │    ├─── DOCTOR_PATH (Pathologist)
         │    │    ├─── DOCTOR_ER (Emergency)
         │    │    ├─── DOCTOR_PSYCH (Psychiatrist)
         │    │    └─── DOCTOR_GP (General Practitioner)
         │    │
         │    ├─── DOCTOR_REGISTRAR (Mid-level)
         │    ├─── DOCTOR_RESIDENT (Training)
         │    ├─── DOCTOR_INTERN (Junior)
         │    └─── DOCTOR_STUDENT (Student)
         │
         ├─── NURSE_EXEC (CNO)
         │    ├─── NURSE_LEAD (Manager)
         │    ├─── NURSE_RN (Registered)
         │    ├─── NURSE_LPN (Licensed Practical)
         │    ├─── NURSE_ENROLLED (Enrolled)
         │    ├─── NURSE_ICU, NURSE_TRIAGE, etc.
         │    └─── NURSE_AIDE (Support)
         │
         ├─── LAB_EXEC (Director)
         │    ├─── LAB_SCIENTIST
         │    ├─── LAB_TECHNICIAN
         │    ├─── LAB_PHLEB (Phlebotomist)
         │    └─── DIAG_RADIOGRAPHER
         │
         ├─── PHARM_LEAD (Chief)
         │    ├─── PHARM_PHARMACIST
         │    ├─── PHARM_TECH
         │    └─── PHARM_ASST
         │
         ├─── ADMIN_HR, ADMIN_BILLING, etc.
         │    └─── ADMIN_STAFF
         │
         ├─── IT_ADMIN, IT_SECURITY, etc.
         │    └─── IT_STAFF
         │
         └─── STAFF (Support)
              ├─── STAFF_CARE (Patient Care)
              ├─── STAFF_LOGISTICS (Transport)
              ├─── STAFF_SECURITY
              ├─── STAFF_PARAMEDIC
              └─── STAFF_SUPPORT (General)
```

---

## 🔍 Error Response Format

```
VALID REQUEST:
POST /api/org/organizations/{id}/staff
├─ Email: valid@hospital.com
├─ Full Name: John Doe
├─ Template: ward-clerk
└─ Role: reception_ward

RESPONSE (201 Created):
{
  "status": "success",
  "message": "Staff member assigned successfully",
  "staff_profile_id": "uuid-1234",
  "user_id": "uuid-5678"
}

─────────────────────────────────────

INVALID REQUEST:
POST /api/org/organizations/{id}/staff
├─ Email: test@hospital.com
├─ Full Name: Test User
├─ Template: ward-clerk
└─ Role: invalid_role ❌

RESPONSE (400 Bad Request):
{
  "error": "Invalid role",
  "message": "unsupported role 'invalid_role' - role does not exist or is inactive",
  "available_roles": [
    "admin",
    "admin_billing",
    "admin_exec",
    "admin_finance",
    "admin_hr",
    "admin_legal",
    "admin_manager",
    "admin_records",
    "admin_records_lead",
    "admin_staff",
    "admin_ward",
    "allied_diet",
    "allied_physio",
    "allied_psych",
    "allied_staff",
    "comm_extension",
    "comm_lead",
    "comm_worker",
    "diag_radio_tech",
    "diag_radiographer",
    "doctor",
    "doctor_anes",
    "doctor_edu",
    "doctor_exec",
    "doctor_er",
    "doctor_gp",
    "doctor_icu",
    "doctor_intern",
    "doctor_lead",
    "doctor_path",
    "doctor_psych",
    "doctor_radio",
    "doctor_registrar",
    "doctor_resident",
    "doctor_senior",
    "doctor_specialist",
    "doctor_student",
    "doctor_surgeon",
    "it_admin",
    "it_ai_eng",
    "it_biomed",
    "it_data",
    "it_exec",
    "it_security",
    "it_staff",
    "lab",
    "lab_exec",
    "lab_phleb",
    "lab_scientist",
    "lab_technician",
    "nurse",
    "nurse_aide",
    "nurse_comm",
    "nurse_edu",
    "nurse_enrolled",
    "nurse_exec",
    "nurse_icu",
    "nurse_lead",
    "nurse_lpn",
    "nurse_midwife",
    "nurse_np",
    "nurse_onco",
    "nurse_psych",
    "nurse_research",
    "nurse_rn",
    "nurse_spec",
    "nurse_staff",
    "nurse_surg",
    "nurse_triage",
    "nurse_ward",
    "pharm_asst",
    "pharm_lead",
    "pharm_pharmacist",
    "pharm_tech",
    "reception",
    "reception_ward",
    "staff",
    "staff_care",
    "staff_edu",
    "staff_er",
    "staff_logistics",
    "staff_paramedic",
    "staff_research",
    "staff_security",
    "staff_support",
    "superadmin"
  ],
  "staff_template": "ward-clerk"
}
```

---

## ✅ Success Metrics

After deployment, verify:

```
✓ Database Queries
  └── SELECT COUNT(*) FROM roles;  -- ~80
  └── SELECT COUNT(*) FROM staff_role_templates;  -- ~40+

✓ API Endpoints
  └── Valid role creates staff (201)
  └── Invalid role shows error (400)
  └── GET returns staff list (200)
  └── DELETE deactivates staff (200)

✓ Frontend
  └── Templates dropdown populated (100+)
  └── Role auto-populates from template
  └── Form validation working
  └── Error messages display
  └── Success notifications appear

✓ Audit Trail
  └── Staff creation logged
  └── Staff changes tracked
  └── Compliance reports available

✓ Performance
  └── Role validation < 50ms
  └── Staff creation < 200ms
  └── Staff list load < 500ms
```

---

## 🎊 READY FOR DEPLOYMENT!

All components are in place and documented.
Start with: **DATABASE_DEPLOYMENT_GUIDE.md**

Deploy with confidence! 🚀
