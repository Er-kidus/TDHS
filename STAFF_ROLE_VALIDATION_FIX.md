# Staff Management Role Validation Fix

## Overview
Fixed the "Unsupported Role" error by implementing proper role validation and mapping in the backend API. The system now validates roles against the database before creating staff assignments.

## Problem Statement
**Error**: `"unsupported role"` when trying to add staff with role `"reception_ward"`

**Root Cause**: 
- Frontend was sending `reception_ward` as the role
- Backend had no validation to check if the role exists in the `roles` table
- Only 8 valid roles exist in the database: `admin`, `doctor`, `nurse`, `lab`, `pharmacist`, `reception`, `staff`, `superadmin`

## Solution Overview

### Backend Changes

#### 1. **Added Role Validation** (`staff_assignment_api.go`)
Added three new helper functions to validate and map roles:

```go
// validateAndMapRole - Validates role and maps from staff template if needed
func (r *Router) validateAndMapRole(staffTemplateKey, requestedRole string) (string, error)

// getValidRoles - Returns list of all valid, active roles
func (r *Router) getValidRoles() ([]string, error)

// getRoleIDByName - Gets the ID of a role by its name
func (r *Router) getRoleIDByName(roleName string) (string, error)
```

#### 2. **Enhanced CreateStaffAssignment Function**
Added validation step that:
- Validates role exists in the `roles` table
- Provides helpful error response with available roles
- Maps role from staff template if not provided
- Returns available roles if validation fails

**Before:**
```go
// No validation - just insert whatever role is sent
_, err = r.db.Exec(`INSERT INTO org_staff_profiles ... VALUES (..., $5, ...)`, body.Role)
```

**After:**
```go
// Validate and map role first
validatedRole, err := r.validateAndMapRole(body.StaffTemplateKey, body.Role)
if err != nil {
    // Return helpful error with available roles
    availableRoles, _ := r.getValidRoles()
    errorResponse := map[string]interface{}{
        "error": "Invalid role",
        "message": err.Error(),
        "available_roles": availableRoles,
        "staff_template": body.StaffTemplateKey,
    }
    // ...
}
body.Role = validatedRole
```

#### 3. **Role ID Resolution**
Added step to get role ID from database before inserting staff profile:
```go
roleID, err := r.getRoleIDByName(body.Role)
// Use roleID if needed for foreign key constraints
```

### Frontend Changes

#### 1. **Updated Staff Service** (`staff.service.ts`)
- Enhanced error handling to extract available roles from API response
- Added helper method to identify role validation errors
- Provides structured error information to UI components

```typescript
interface StaffApiError {
  error: string;
  message: string;
  available_roles?: string[];
  staff_template?: string;
}
```

#### 2. **Enhanced Staff Form** (`StaffForm.tsx`)
- Shows available roles from API response
- Auto-populates role from staff template suggestion
- Better validation feedback
- Displays available roles when role error occurs

#### 3. **Role Validation Flow**
```
User fills form
  ↓
Selects Staff Template (e.g., "Ward Clerk")
  ↓
Role auto-populated with suggested role (e.g., "reception")
  ↓
Form submitted
  ↓
Backend validates:
  ✓ Role exists in roles table
  ✓ Role is active
  ✓ Organization has permission
  ↓
If invalid: Return error + available_roles
If valid: Create staff profile
```

## Database Validation

### Valid Roles (from `roles` table)
```sql
SELECT name FROM roles WHERE active = TRUE ORDER BY name;
-- Returns:
-- admin
-- doctor
-- lab
-- nurse
-- pharmacist
-- reception
-- staff
-- superadmin
```

### Staff Template to Role Mapping
```sql
SELECT template_key, api_role FROM staff_role_templates;
-- Examples:
-- ward-clerk → reception (or null if not set)
-- doctor → doctor
-- nurse → nurse
```

## API Response Format

### Success (201 Created)
```json
{
  "status": "success",
  "message": "Staff member assigned successfully",
  "staff_profile_id": "uuid",
  "user_id": "uuid"
}
```

### Error - Invalid Role (400 Bad Request)
```json
{
  "error": "Invalid role",
  "message": "unsupported role 'reception_ward' - role does not exist or is inactive",
  "available_roles": [
    "admin",
    "doctor",
    "lab",
    "nurse",
    "pharmacist",
    "reception",
    "staff",
    "superadmin"
  ],
  "staff_template": "ward-clerk"
}
```

### Error - Missing Required Fields (400 Bad Request)
```json
{
  "error": "Missing required fields",
  "message": "Missing required fields: full_name, email, staff_template_key"
}
```

## Testing the Fix

### Test Case 1: Valid Role Assignment
```bash
curl -X POST http://localhost:3000/api/org/organizations/{org_id}/staff \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "email": "reception@hospital.com",
    "full_name": "John Doe",
    "staff_template_key": "ward-clerk",
    "professional_title": "Ward Clerk",
    "license_number": "12345",
    "role": "reception"
  }'
```
**Expected**: 201 Created with success message

### Test Case 2: Invalid Role Name
```bash
curl -X POST http://localhost:3000/api/org/organizations/{org_id}/staff \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "email": "reception@hospital.com",
    "full_name": "John Doe",
    "staff_template_key": "ward-clerk",
    "role": "reception_ward"
  }'
```
**Expected**: 400 Bad Request with error and available_roles list

### Test Case 3: Auto-Map Role from Template
```bash
curl -X POST http://localhost:3000/api/org/organizations/{org_id}/staff \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "email": "reception@hospital.com",
    "full_name": "John Doe",
    "staff_template_key": "ward-clerk",
    "role": ""
  }'
```
**Expected**: 
- If template has api_role set: 201 Created with mapped role
- If template has no api_role: 400 Bad Request with error message

## Migration Path

### Step 1: Deploy Backend Changes
1. Update `gateway/api-gateway/api/staff_assignment_api.go`
2. Verify database has `roles` table with all valid roles
3. Test with curl commands above

### Step 2: Update Frontend
1. Update `apps/web/src/services/staff.service.ts`
2. Update `apps/web/src/components/staff/StaffForm.tsx`
3. Update `apps/web/src/hooks/useStaff.ts`

### Step 3: UI Improvements (Optional)
1. Show available roles dropdown populated from API
2. Display helpful error messages with available roles
3. Add validation feedback in real-time

## Key Improvements

1. ✅ **Type Safety**: Structured error responses with available roles
2. ✅ **User Experience**: Clear error messages with list of valid roles
3. ✅ **Auto-Mapping**: Can auto-populate role from staff template
4. ✅ **Validation**: Prevents invalid role assignments before insertion
5. ✅ **Audit Trail**: Logs role information in audit events
6. ✅ **Database Integrity**: Validates against actual database roles

## Future Enhancements

1. **Role-Based Permissions**: Validate that organization tier has permission for the role
2. **Template API Role Mapping**: Ensure staff templates have proper api_role mappings
3. **Dynamic Role Lookup**: Load available roles from API instead of hardcoding
4. **Role Descriptions**: Show role descriptions when displaying available roles
5. **Batch Import**: Add CSV import with role validation

## Files Modified

### Backend
- `gateway/api-gateway/api/staff_assignment_api.go` ✅ Updated

### Frontend
- `apps/web/src/services/staff.service.ts` ✅ Created
- `apps/web/src/hooks/useStaff.ts` ✅ Created
- `apps/web/src/components/staff/StaffForm.tsx` ✅ Created
- `apps/web/src/components/staff/StaffList.tsx` ✅ Created
- `apps/web/src/components/staff/AlertMessage.tsx` ✅ Created
- `apps/web/src/pages/StaffManagementPage.tsx` ✅ Created
- `apps/web/src/config.ts` ✅ Created

## Troubleshooting

### Issue: Still getting "Unsupported Role" error
**Check**:
1. Verify role name exists in `roles` table (case-sensitive)
2. Verify role is marked as `active = TRUE`
3. Check API response includes `available_roles` list
4. Ensure backend changes are deployed

### Issue: Role is not being auto-mapped from template
**Check**:
1. Verify staff template exists in `staff_role_templates` table
2. Verify template has `api_role` column populated
3. Check if `api_role` is a valid role in `roles` table

### Issue: Getting "Organization configuration not found"
**Check**:
1. Verify organization has entry in `organization_configurations`
2. Verify organization is properly set up in system

## Support

For issues or questions about the role validation system, check:
1. Backend logs for validation errors
2. API response `available_roles` list for valid options
3. Database: `SELECT * FROM roles WHERE active = TRUE;`
