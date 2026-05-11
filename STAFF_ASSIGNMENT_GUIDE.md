# Staff Assignment API - Correct Request Format

## Endpoint
```
POST /api/organizations/{org_id}/staff
```

## Required Setup Before Assignment

1. **Staff Template Must Be Approved**
   - Go to Super Admin dashboard
   - Approve the staff template (e.g., "Ward Clerk") for your organization
   - Status must be "approved"

2. **User Email Domain**
   - User should exist in the system OR will be auto-created

## Correct Request Body

```json
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

## Field Explanations

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `email` | string | ✅ YES | User email - will create user if doesn't exist |
| `full_name` | string | ✅ YES | Full name of staff member |
| `staff_template_key` | string | ✅ YES | Template key must be approved for org |
| `professional_title` | string | ✅ YES | Job title (e.g., "Receptionist", "Nurse") |
| `license_number` | string | ✅ YES | License/ID number |
| `role` | string | ✅ YES | Role type (e.g., "reception", "nurse", "doctor") |
| `active` | boolean | ✅ YES | Activated status (true/false) |

## Step-by-Step Guide

### Step 1: Get Available Staff Templates for Your Org

```bash
GET /api/organizations/{org_id}/staff-templates/available
```

**Response:**
```json
[
  {
    "template_key": "ward-clerk",
    "title": "Ward Clerk",
    "role_group": "Support Staff",
    "category": "Ward",
    "api_role": "reception_ward",
    "description": "Ward administration. Tiers: All"
  }
]
```

### Step 2: Make Sure Template is Approved

Check that the template shows in the list above. If not, request approval from Super Admin:

```bash
POST /api/organizations/{org_id}/staff-requests
Content-Type: application/json

{
  "staff_template_key": "ward-clerk",
  "justification": "We need reception staff for ward administration"
}
```

**Wait for Super Admin approval** ✅

### Step 3: Assign Staff Member

```bash
POST /api/organizations/{org_id}/staff
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

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Staff member assigned successfully",
  "staff_profile_id": "uuid-here",
  "user_id": "uuid-here"
}
```

## Common Errors & Fixes

### Error: 400 Bad Request
**Cause:** Missing required fields or invalid JSON

**Fix:** Ensure all required fields are present and valid:
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

### Error: 403 Forbidden - "Staff template not approved"
**Cause:** Template hasn't been approved for your organization

**Fix:**
1. Submit approval request (see Step 2 above)
2. Wait for Super Admin to approve
3. Then assign staff

### Error: 403 Forbidden - "Staff template not available for tier"
**Cause:** Your organization tier doesn't support this staff role

**Fix:** Use `GET /api/organizations/{org_id}/staff-templates/available` to see allowed roles

### Error: 401 Unauthorized
**Cause:** Not logged in or wrong credentials

**Fix:** Ensure your JWT token is valid and included in Authorization header

## Valid Staff Template Keys (Common)

```
- ward-clerk (Ward Clerk)
- nurse-rn (Registered Nurse)
- nurse-lpn (Licensed Practical Nurse)
- med-gp (General Practitioner)
- diag-lab-tech (Lab Technician)
- allied-pharmacist (Pharmacist)
- allied-pharm-tech (Pharmacy Technician)
- support-housekeeping (Housekeeping Staff)
- support-security (Security Guard)
```

See `STAFF_TIER_QUICK_REFERENCE.md` for complete list by tier.

## Example cURL Request

```bash
curl -X POST http://localhost:4000/api/organizations/2c5a80be-e9e8-4a50-9b6a-18c360510c2c/staff \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {your-jwt-token}" \
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

## Other Staff Endpoints

### List All Staff for Organization
```bash
GET /api/organizations/{org_id}/staff
```

### Get Single Staff Member
```bash
GET /api/organizations/{org_id}/staff/{staff_id}
```

### Update Staff Member
```bash
PUT /api/organizations/{org_id}/staff/{staff_id}
Content-Type: application/json

{
  "professional_title": "Senior Receptionist",
  "license_number": "NEW-LICENSE-NUM",
  "active": true
}
```

### Remove Staff Member
```bash
DELETE /api/organizations/{org_id}/staff/{staff_id}
```

---

**Need help?** Check `STAFF_API_DOCUMENTATION.md` for full API reference.
