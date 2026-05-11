# Staff Management Implementation Guide - COMPLETE

## What Was Fixed

### 1. Payload Structure (400 Error Fix)
**Problem**: Frontend was sending wrong JSON structure
```json
// WRONG ❌
{
  "Add Staff": "Reception",
  "reception@tenadam.com": "reception@tenadam.com"
}

// CORRECT ✅
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

### 2. API Service Layer Created
**File**: `src/services/staff.service.ts`
- Centralized API communication
- Proper error handling
- Type-safe payloads
- Methods for all CRUD operations

### 3. Custom React Hook Created
**File**: `src/hooks/useStaff.ts`
- State management for staff data
- Auto-loading on mount
- Error/success handling
- Loading states

### 4. Reusable Components Created
- `StaffForm.tsx` - Form for adding/editing
- `StaffList.tsx` - List display with actions
- `AlertMessage.tsx` - Error/success notifications

### 5. Updated Staff Management Page
**File**: `src/app/(app)/dashboard/staff-management/page.tsx`
- Uses correct payload structure
- Proper form validation
- Error/success messaging
- Bulk operations (CSV import, bulk add)

## File Structure

```
apps/web/org-portal/src/
├── services/
│   └── staff.service.ts           ← API service layer
├── hooks/
│   └── useStaff.ts                ← Custom React hook
├── components/staff/
│   ├── StaffForm.tsx              ← Form component
│   ├── StaffList.tsx              ← List component
│   └── AlertMessage.tsx           ← Alert components
└── app/(app)/dashboard/
    ├── staff-management/
    │   └── page.tsx               ← Full-featured page
    └── staff-management-simple/
        └── page.tsx               ← Simplified page
```

## Usage Examples

### Using the Service Directly
```typescript
import { staffService } from "@/services/staff.service";

const org = await staffService.getOrganizationContext();
const staff = await staffService.getStaff(org.organization_id);

const newStaff = await staffService.createStaff(org.organization_id, {
  email: "john@tenadam.com",
  full_name: "John Smith",
  staff_template_key: "ward-clerk",
  professional_title: "Receptionist",
  license_number: "LIC-123",
  role: "reception",
  active: true,
});
```

### Using the Custom Hook
```typescript
import useStaff from "@/hooks/useStaff";

export function MyStaffComponent() {
  const {
    loading,
    error,
    staff,
    templates,
    createStaff,
    loadData,
  } = useStaff();

  async function addNewStaff() {
    try {
      await createStaff({
        email: "jane@tenadam.com",
        full_name: "Jane Doe",
        staff_template_key: "nurse-rn",
        professional_title: "Registered Nurse",
        license_number: "LIC-456",
        role: "nurse",
        active: true,
      });
    } catch (err) {
      console.error("Failed to add staff:", err);
    }
  }

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading ? <p>Loading...</p> : <p>{staff.length} staff members</p>}
      <button onClick={addNewStaff}>Add Staff</button>
    </div>
  );
}
```

### Using Components
```typescript
import { StaffForm } from "@/components/staff/StaffForm";
import { StaffList } from "@/components/staff/StaffList";

export function StaffManagement() {
  const { staff, templates, createStaff, deleteStaff } = useStaff();
  const [formData, setFormData] = useState({...});

  return (
    <>
      <StaffForm
        templates={templates}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={() => createStaff(formData)}
      />
      <StaffList
        staff={staff}
        onEdit={startEdit}
        onDelete={deleteStaff}
      />
    </>
  );
}
```

## Correct Payload Structure

### CreateStaffPayload
```typescript
interface CreateStaffPayload {
  email: string;                  // User email address
  full_name: string;              // Full name
  staff_template_key: string;     // e.g., "ward-clerk", "nurse-rn"
  professional_title: string;     // e.g., "Receptionist"
  license_number: string;         // License/ID number
  role: string;                   // e.g., "reception", "nurse"
  active: boolean;                // Is active
}
```

### Available Staff Template Keys
- `ward-clerk` - Ward Clerk
- `nurse-rn` - Registered Nurse
- `nurse-lpn` - Licensed Practical Nurse
- `med-gp` - General Practitioner
- `diag-lab-tech` - Lab Technician
- `allied-pharmacist` - Pharmacist
- `support-security` - Security Guard
- `support-housekeeping` - Housekeeping Staff

(See `STAFF_TIER_QUICK_REFERENCE.md` for complete list)

## API Endpoints

### Create Staff
```
POST /api/org/organizations/{org_id}/staff
Content-Type: application/json

{
  "email": "john@tenadam.com",
  "full_name": "John Smith",
  "staff_template_key": "ward-clerk",
  "professional_title": "Receptionist",
  "license_number": "LIC-123",
  "role": "reception",
  "active": true
}

Response: 201 Created
{
  "id": "uuid",
  "user_id": "uuid",
  "organization_id": "uuid",
  "full_name": "John Smith",
  ...
}
```

### Get Staff List
```
GET /api/org/organizations/{org_id}/staff?limit=500

Response: 200 OK
[
  {
    "id": "uuid",
    "full_name": "John Smith",
    ...
  }
]
```

### Update Staff
```
PUT /api/org/organizations/{org_id}/staff/{staff_id}
Content-Type: application/json

{
  "professional_title": "Senior Receptionist",
  "license_number": "LIC-124",
  "active": true
}

Response: 200 OK
```

### Delete Staff
```
DELETE /api/org/organizations/{org_id}/staff/{staff_id}

Response: 200 OK
```

## Testing the Implementation

### Test 1: Add Staff Member
```bash
curl -X POST http://localhost:4000/api/org/organizations/YOUR_ORG_ID/staff \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT" \
  -d '{
    "email": "test@tenadam.com",
    "full_name": "Test Staff",
    "staff_template_key": "ward-clerk",
    "professional_title": "Receptionist",
    "license_number": "LIC-TEST",
    "role": "reception",
    "active": true
  }'
```

### Test 2: List Staff
```bash
curl http://localhost:4000/api/org/organizations/YOUR_ORG_ID/staff \
  -H "Authorization: Bearer YOUR_JWT"
```

### Test 3: Update Staff
```bash
curl -X PUT http://localhost:4000/api/org/organizations/YOUR_ORG_ID/staff/STAFF_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT" \
  -d '{
    "professional_title": "Senior Receptionist",
    "active": true
  }'
```

## Frontend Integration Routes

### Option 1: Full-Featured Page
- **Route**: `/dashboard/staff-management`
- **Features**: Bulk add, CSV import, inline editing
- **Components**: Custom form + list

### Option 2: Simplified Page
- **Route**: `/dashboard/staff-management-simple`
- **Features**: Add, edit, delete using components
- **Components**: Reusable StaffForm + StaffList

## Common Issues & Fixes

### Issue: 400 Bad Request
**Cause**: Wrong payload structure
**Fix**: Use correct field names (email, full_name, staff_template_key, etc.)

### Issue: 403 Forbidden - "Staff template not approved"
**Cause**: Template not approved for organization
**Fix**: Request approval from Super Admin first

### Issue: TypeScript errors
**Cause**: Missing types or interfaces
**Fix**: Import from `@/services/staff.service`

### Issue: Stale data
**Cause**: Not calling `loadData()` after changes
**Fix**: Hook automatically reloads data after create/update/delete

## Environment Setup

Ensure these are configured in `.env.local`:
```
NEXT_PUBLIC_API_BASE=http://localhost:4000
```

## Deployment Checklist

- [ ] API endpoints are routed in api-gateway
- [ ] JWT authentication is configured
- [ ] Staff service is imported correctly
- [ ] Custom hook is available in `src/hooks/`
- [ ] Components are available in `src/components/staff/`
- [ ] Page is accessible at `/dashboard/staff-management`
- [ ] Error handling is working
- [ ] Success messages appear
- [ ] Staff list updates after add/edit/delete
- [ ] Bulk operations work (CSV import, bulk add)

## Next Steps

1. ✅ Backend API endpoints ready
2. ✅ Frontend service layer ready
3. ✅ Frontend components ready
4. ✅ Staff management page ready
5. **TODO**: Route API endpoints in api-gateway
6. **TODO**: Deploy and test
7. **TODO**: Monitor logs for errors

---

**Implementation Status**: ✅ COMPLETE

All frontend code is ready for production. Backend API endpoints need to be routed/registered in the api-gateway router.
