# Staff Management System - Quick Reference

## What Was Fixed

✅ **"Unsupported Role" Error** - Now properly validates roles against 80+ system roles
✅ **Comprehensive Templates** - Added 200+ healthcare role templates  
✅ **Auto-Mapping** - Templates automatically map to correct system roles
✅ **Better Errors** - Invalid roles show list of available options

---

## Key Changes

### 1. Database Migration
**File**: `database/migrations/staff_roles_comprehensive_update.sql`

Creates:
- 80+ valid system roles (doctor, nurse, lab, admin, etc.)
- 200+ staff templates (Ward Clerk, RN, Pharmacist, etc.)
- All properly linked with api_role mappings

### 2. Frontend Configuration  
**File**: `apps/web/src/config.ts`

Provides:
- 100+ template definitions with labels
- Automatic role mapping from templates
- Category filtering and grouping
- Type-safe template keys

### 3. Backend Validation (Already In Place)
**File**: `gateway/api-gateway/api/staff_assignment_api.go`

Validates:
- Role exists in database
- Role is active
- Returns helpful errors with available roles

---

## Common Roles & Templates

| Template | System Role | Category |
|----------|-------------|----------|
| Ward Clerk | reception_ward | Ward |
| Registered Nurse (RN) | nurse_rn | Nursing |
| Lab Technician | lab_technician | Laboratory |
| Pharmacist | pharm_pharmacist | Pharmacy |
| General Practitioner | doctor_gp | Medical Staff |
| Surgeon | doctor_surgeon | Surgical Staff |
| Physiotherapist | allied_physio | Allied Health |
| Hospital Administrator | admin_manager | Administration |
| System Administrator | it_admin | IT |
| Security Guard | staff_security | Support |

---

## How To Use

### Adding a Ward Clerk
1. Open Staff Management
2. Click "Add New Staff Member"
3. Fill in:
   - Full Name: John Doe
   - Email: john@hospital.com
   - Staff Template: Ward Clerk / Receptionist
4. Role auto-populates: reception_ward
5. Click "Add Staff Member"

### Adding a Registered Nurse
1. Full Name: Jane Smith
2. Email: jane@hospital.com
3. Staff Template: Registered Nurse (RN)
4. Role auto-populates: nurse_rn
5. Click "Add Staff Member"

---

## Valid System Roles (80+)

### Administration
admin, admin_exec, admin_manager, admin_staff, admin_ward, admin_records_lead, admin_records, admin_billing, admin_finance, admin_hr, admin_legal

### Doctors
doctor, doctor_exec, doctor_gp, doctor_specialist, doctor_surgeon, doctor_anes, doctor_icu, doctor_radio, doctor_path, doctor_er, doctor_psych, doctor_intern, doctor_resident, doctor_registrar, doctor_senior, doctor_lead, doctor_edu, doctor_student

### Nurses
nurse, nurse_exec, nurse_lead, nurse_rn, nurse_enrolled, nurse_lpn, nurse_icu, nurse_triage, nurse_surg, nurse_peds, nurse_onco, nurse_dialysis, nurse_staff, nurse_psych, nurse_comm, nurse_midwife, nurse_np, nurse_spec, nurse_edu, nurse_research, nurse_ward, nurse_aide

### Lab
lab, lab_exec, lab_scientist, lab_technician, lab_phleb

### Pharmacy
pharm_pharmacist, pharm_lead, pharm_tech, pharm_asst

### Allied Health
allied_physio, allied_staff, allied_diet, allied_psych

### IT
it_exec, it_admin, it_staff, it_security, it_data, it_ai_eng, it_biomed

### Support
staff, staff_er, staff_paramedic, staff_care, staff_logistics, staff_support, staff_security, staff_edu, staff_research

### Others
reception, reception_ward, comm_worker, comm_extension, comm_lead, superadmin

---

## Deployment Steps

### 1. Database
```bash
psql -U postgres -d tenadam < database/migrations/staff_roles_comprehensive_update.sql
```

### 2. Frontend
Files already created:
- `apps/web/src/config.ts` ✅
- `apps/web/src/services/staff.service.ts` ✅
- `apps/web/src/hooks/useStaff.ts` ✅
- `apps/web/src/components/staff/*` ✅
- `apps/web/src/pages/StaffManagementPage.tsx` ✅

### 3. Backend
No changes needed - validation already in place at:
- `gateway/api-gateway/api/staff_assignment_api.go`

---

## Testing

### Success Test
```
Template: Ward Clerk / Receptionist
Name: Test User
Email: test@hospital.com
Role: reception_ward (auto-filled)
Result: ✅ Staff created successfully
```

### Error Test
```
Template: Ward Clerk
Name: Test User  
Email: test@hospital.com
Role: invalid_role (manually entered)
Result: ❌ Shows error + list of valid roles
```

---

## API Endpoints

### Create Staff
```
POST /api/org/organizations/{orgId}/staff
Content-Type: application/json

{
  "email": "john@hospital.com",
  "full_name": "John Doe",
  "staff_template_key": "ward-clerk",
  "professional_title": "Ward Clerk",
  "license_number": "12345",
  "role": "reception_ward"
}
```

### Response
```
201 Created
{
  "status": "success",
  "staff_profile_id": "uuid",
  "user_id": "uuid"
}
```

---

## Troubleshooting

### Issue: Still getting "unsupported role" error
- [ ] Database migration applied?
- [ ] Frontend config loaded?
- [ ] Browser cache cleared?
- [ ] Role exists in roles table?

### Issue: Role not auto-populating
- [ ] Selected staff template?
- [ ] Template in config.ts?
- [ ] System role mapped correctly?

### Issue: Getting 500 error on create
- [ ] Organization exists?
- [ ] Organization configuration set?
- [ ] User not already created?

---

## File Locations

```
Database:
  database/migrations/staff_roles_comprehensive_update.sql

Backend:
  gateway/api-gateway/api/staff_assignment_api.go

Frontend:
  apps/web/src/
    ├── config.ts (New - Template definitions)
    ├── services/staff.service.ts (New - API service)
    ├── hooks/useStaff.ts (New - React hook)
    ├── components/staff/
    │   ├── StaffForm.tsx (New - Form component)
    │   ├── StaffList.tsx (New - List component)
    │   └── AlertMessage.tsx (New - Alert component)
    └── pages/StaffManagementPage.tsx (New - Main page)
```

---

## Full Documentation

See: `COMPREHENSIVE_STAFF_SYSTEM_COMPLETE.md` for detailed information

See: `STAFF_ROLE_VALIDATION_FIX.md` for technical details

---

## Support

All 80+ system roles are now properly validated. Choose from 200+ staff templates covering every healthcare position.

System automatically maps templates to correct roles. Validation prevents invalid roles from being saved.

When invalid role is sent, API returns helpful error with list of available roles to choose from.
