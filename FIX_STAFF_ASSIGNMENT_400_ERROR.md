# ✅ STAFF ASSIGNMENT FIX - CORRECT REQUEST FORMAT

## The Problem

You were getting a **400 Bad Request** error because the request body didn't match what the API expects.

## The Solution

### Your Current Request (WRONG ❌)
```json
{
  "Add Staff": "Reception",
  "reception@tenadam.com": "reception@tenadam.com",
  "Ward Clerk (reception_ward)": "reception_ward",
  "Active": true,
  "Receptionist": "12346789jk"
}
```

### Correct Request Format (RIGHT ✅)
```json
{
  "email": "reception@tenadam.com",
  "full_name": "Reception Staff",
  "staff_template_key": "ward-clerk",
  "professional_title": "Receptionist",
  "license_number": "12346789jk",
  "role": "reception",
  "active": true
}
```

---

## Complete cURL Example

```bash
curl -X POST http://localhost:4000/api/org/organizations/2c5a80be-e9e8-4a50-9b6a-18c360510c2c/staff \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "email": "reception@tenadam.com",
    "full_name": "Reception Staff Name",
    "staff_template_key": "ward-clerk",
    "professional_title": "Receptionist",
    "license_number": "12346789jk",
    "role": "reception",
    "active": true
  }'
```

---

## Field Mapping Guide

| Form Input | JSON Field | Type | Example |
|-----------|-----------|------|---------|
| "Reception" (name) | `full_name` | string | "Reception Staff Name" |
| "reception@tenadam.com" (email) | `email` | string | "reception@tenadam.com" |
| "Ward Clerk (reception_ward)" (role) | `staff_template_key` | string | "ward-clerk" |
| "Receptionist" (title) | `professional_title` | string | "Receptionist" |
| "12346789jk" (license) | `license_number` | string | "12346789jk" |
| "reception" (role type) | `role` | string | "reception" |
| "Active" | `active` | boolean | true |

---

## Staff Template Keys (Valid Values)

Before assignment, make sure the staff template is **approved** for your organization. Common keys:

```
Medical:
- med-gp (General Practitioner)
- med-director (Medical Director)
- med-intern (Intern)

Nursing:
- nurse-rn (Registered Nurse)
- nurse-lpn (Licensed Practical Nurse)
- nurse-manager (Nurse Manager)
- nurse-aide (Nursing Aide)
- nurse-midwife (Midwife)

Support/Admin:
- ward-clerk (Ward Clerk) ✓ (from your form)
- admin-hospital (Hospital Administrator)
- admin-records-off (Medical Records Officer)
- support-security (Security Guard)
- support-housekeeping (Housekeeping Staff)

Allied Health:
- allied-pharmacist (Pharmacist)
- allied-pharm-tech (Pharmacy Technician)
- allied-dietitian (Dietitian)
- allied-physio (Physiotherapist)

Diagnostic:
- diag-lab-tech (Lab Technician)
- diag-phleb (Phlebotomist)
- diag-sonographer (Sonographer)
```

---

## Step-by-Step: Adding a Staff Member

### Step 1: Check Available Templates
```bash
GET /api/org/organizations/2c5a80be-e9e8-4a50-9b6a-18c360510c2c/staff-templates/available
```

Look for `"ward-clerk"` in the response.

### Step 2: If Not Approved, Request Approval
```bash
POST /api/org/organizations/2c5a80be-e9e8-4a50-9b6a-18c360510c2c/staff-requests
Content-Type: application/json

{
  "staff_template_key": "ward-clerk",
  "justification": "We need reception staff for ward administration"
}
```

**Wait for Super Admin approval** ✅

### Step 3: Create Staff Member
```bash
POST /api/org/organizations/2c5a80be-e9e8-4a50-9b6a-18c360510c2c/staff
Content-Type: application/json

{
  "email": "reception@tenadam.com",
  "full_name": "Reception Staff Name",
  "staff_template_key": "ward-clerk",
  "professional_title": "Receptionist",
  "license_number": "12346789jk",
  "role": "reception",
  "active": true
}
```

### Success Response (201 Created)
```json
{
  "status": "success",
  "message": "Staff member assigned successfully",
  "staff_profile_id": "uuid",
  "user_id": "uuid"
}
```

---

## Error Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `400 Bad Request` | Invalid JSON or missing fields | Check all fields are present & valid JSON |
| `403 - "Staff template not approved"` | Template not approved yet | Request approval from Super Admin first |
| `403 - "Staff template not available"` | Template not allowed for your org tier | Use GET staff-templates/available to see allowed roles |
| `401 Unauthorized` | Missing JWT token | Include Authorization header with valid token |

---

## Frontend Form → API Payload Conversion

If you're building a form, map it like this:

```javascript
const formData = {
  fullName: "Reception Staff Name",
  email: "reception@tenadam.com",
  templateKey: "ward-clerk",
  title: "Receptionist",
  licenseNumber: "12346789jk",
  role: "reception",
  active: true
};

// Convert to API payload
const payload = {
  full_name: formData.fullName,
  email: formData.email,
  staff_template_key: formData.templateKey,
  professional_title: formData.title,
  license_number: formData.licenseNumber,
  role: formData.role,
  active: formData.active
};

fetch(`/api/org/organizations/${orgId}/staff`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(payload)
})
.then(r => r.json())
.then(data => console.log('Success!', data))
.catch(e => console.error('Error:', e));
```

---

## See Also

- `STAFF_API_DOCUMENTATION.md` - Full API reference
- `STAFF_TIER_QUICK_REFERENCE.md` - All valid staff template keys by tier
- `STAFF_ASSIGNMENT_GUIDE.md` - Detailed assignment guide

---

✅ **Now your request will work!**

Use the correct JSON format above and your staff member will be assigned successfully.
