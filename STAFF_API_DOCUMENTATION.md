# Staff Management API Documentation

## Overview

The Staff Management API provides endpoints for managing staff role templates, handling staff assignment requests, and monitoring organizational compliance with tier-based staffing requirements.

### Base URL
```
https://api.tenadam.local/api
```

### Authentication
All endpoints require authentication via JWT token in the `Authorization` header:
```
Authorization: Bearer {jwt_token}
```

---

## Endpoints

### 1. Get Pending Staff Requests

**Endpoint**: `GET /admin/staff-requests/pending`

**Authorization**: Super Admin only

**Description**: Returns all pending staff template requests awaiting approval.

**Response**:
```json
[
  {
    "id": "uuid",
    "organization_id": "uuid",
    "organization_name": "Health Center 01",
    "organization_tier": "health-center",
    "staff_template_key": "spec-pediatrician",
    "staff_template_title": "Pediatrician",
    "requested_by_email": "admin@example.com",
    "status": "pending",
    "justification": "We have pediatric ward with 50+ patients requiring specialist care",
    "approval_notes": null,
    "approved_by_email": null,
    "approved_at": null,
    "created_at": "2026-04-25T10:00:00Z",
    "updated_at": "2026-04-25T10:00:00Z"
  }
]
```

---

### 2. Get Organization Staff Requests

**Endpoint**: `GET /organizations/{org_id}/staff-requests`

**Authorization**: Organization Admin or Super Admin

**Parameters**:
- `org_id` (path): Organization UUID

**Query Parameters**:
- `status` (optional): Filter by status (pending, approved, rejected, revoked)

**Response**: Same as endpoint 1, filtered for organization

---

### 3. Get Available Staff Templates

**Endpoint**: `GET /organizations/{org_id}/staff-templates/available`

**Authorization**: Organization Admin or Super Admin

**Description**: Returns all staff templates available for organization's tier.

**Response**:
```json
[
  {
    "template_key": "med-gp",
    "title": "General Practitioner (GP)",
    "role_group": "Clinical Staff",
    "category": "Medical Staff",
    "api_role": "doctor_gp",
    "description": "Primary care physician. Tiers: All",
    "sort_order": 15,
    "active": true,
    "min_staff_required": 1,
    "available_tier": "health-center"
  }
]
```

---

### 4. Approve Staff Request

**Endpoint**: `POST /admin/staff-requests/{request_id}/approve`

**Authorization**: Super Admin only

**Request Body**:
```json
{
  "status": "approved",
  "approval_notes": "Verified organization tier and staffing requirements met"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Request approved"
}
```

---

### 5. Reject Staff Request

**Endpoint**: `POST /admin/staff-requests/{request_id}/reject`

**Authorization**: Super Admin only

**Request Body**:
```json
{
  "status": "rejected",
  "approval_notes": "Staff template not available for organization tier"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Request rejected"
}
```

---

### 6. Revoke Staff Access

**Endpoint**: `POST /admin/staff-requests/{request_id}/revoke`

**Authorization**: Super Admin only

**Description**: Revokes previously approved staff template access (for misconduct/non-compliance).

**Request Body**:
```json
{
  "reason": "Organization violated credential verification standards. Staff member lost license."
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Access revoked"
}
```

---

### 7. Request Staff Template

**Endpoint**: `POST /organizations/{org_id}/staff-requests`

**Authorization**: Organization Admin or higher

**Description**: Organization admin requests a new staff template role.

**Request Body**:
```json
{
  "staff_template_key": "med-intern",
  "justification": "We are establishing a medical training program and need intern positions"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Staff request submitted"
}
```

**Error Cases**:
- `STAFF_TEMPLATE_NOT_APPROVED`: Template already exists in different status
- `TIER_RESTRICTION`: Template not available for organization tier

---

### 8. Get Compliance Report

**Endpoint**: `GET /organizations/{org_id}/compliance/report`

**Authorization**: Organization Admin or Super Admin

**Description**: Returns staffing compliance status for organization against tier requirements.

**Response**:
```json
{
  "organization_id": "uuid",
  "organization_name": "Primary Hospital 01",
  "organization_tier": "primary-hospital",
  "total_approved_staff": 95,
  "minimum_required": 103,
  "compliance_status": "at_risk",
  "missing_roles": [
    {
      "template_key": "surg-general",
      "title": "General Surgeon",
      "required": 1,
      "current": 0,
      "missing": 1
    },
    {
      "template_key": "nurse-icu",
      "title": "ICU Nurse",
      "required": 2,
      "current": 1,
      "missing": 1
    }
  ],
  "unauthorized_roles": [],
  "last_checked_at": "2026-04-25T23:00:00Z"
}
```

---

### 9. Get Staff Audit Log

**Endpoint**: `GET /organizations/{org_id}/audit-log`

**Authorization**: Organization Admin or Super Admin

**Query Parameters**:
- `limit` (optional, default: 50): Number of records to return

**Response**:
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "organization_id": "uuid",
    "action": "approved",
    "staff_template_key": "med-gp",
    "details": "Approved for GP role - meets tier requirements",
    "created_at": "2026-04-25T10:30:00Z"
  }
]
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200  | OK - Request successful |
| 201  | Created - Resource created successfully |
| 400  | Bad Request - Invalid input |
| 401  | Unauthorized - Authentication required |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource not found |
| 409  | Conflict - Resource already exists |
| 500  | Internal Server Error |

---

## Error Responses

### Format
```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    "field": "value"
  }
}
```

### Example Errors

**Tier Restriction**:
```json
{
  "error": "TIER_RESTRICTION",
  "message": "Staff template 'surg-cardio' not available for tier 'health-center'",
  "details": {
    "template_key": "surg-cardio",
    "tier": "health-center",
    "required_tier": "national-health-system"
  }
}
```

**Unauthorized**:
```json
{
  "error": "UNAUTHORIZED",
  "message": "Only Super Admin can approve staff requests",
  "details": {
    "required_role": "superadmin",
    "user_role": "admin"
  }
}
```

---

## Request/Response Examples

### Example 1: Organization Requests Staff Template

**Request**:
```bash
curl -X POST https://api.tenadam.local/api/organizations/org-hc-01/staff-requests \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "staff_template_key": "spec-pediatrician",
    "justification": "We have pediatric ward with 50+ patients requiring specialist care"
  }'
```

**Response** (201 Created):
```json
{
  "status": "success",
  "message": "Staff request submitted"
}
```

---

### Example 2: Super Admin Reviews & Approves

**Request**:
```bash
curl -X POST https://api.tenadam.local/api/admin/staff-requests/{request_id}/approve \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "approval_notes": "Verified: org has pediatric ward, tier 2+, meets prerequisites"
  }'
```

**Response** (200 OK):
```json
{
  "status": "success",
  "message": "Request approved"
}
```

---

### Example 3: Check Compliance

**Request**:
```bash
curl -X GET https://api.tenadam.local/api/organizations/org-ph-01/compliance/report \
  -H "Authorization: Bearer {token}"
```

**Response** (200 OK):
```json
{
  "organization_id": "org-ph-01",
  "organization_name": "Primary Hospital 01",
  "organization_tier": "primary-hospital",
  "total_approved_staff": 103,
  "minimum_required": 103,
  "compliance_status": "compliant",
  "missing_roles": [],
  "unauthorized_roles": [],
  "last_checked_at": "2026-04-25T23:00:00Z"
}
```

---

## Webhooks (Future)

Staff approval/rejection events will trigger webhooks to organization endpoints:

### Staff Approved Webhook
```json
{
  "event": "staff.approved",
  "organization_id": "uuid",
  "staff_template_key": "med-gp",
  "approved_at": "2026-04-25T10:30:00Z",
  "approved_by": "superadmin@tenadam.local"
}
```

### Staff Revoked Webhook
```json
{
  "event": "staff.revoked",
  "organization_id": "uuid",
  "staff_template_key": "med-gp",
  "reason": "Non-compliance detected",
  "revoked_at": "2026-04-26T14:00:00Z",
  "revoked_by": "superadmin@tenadam.local"
}
```

---

## Rate Limiting

- **Admin endpoints**: 100 requests/minute
- **Organization endpoints**: 300 requests/minute
- **Rate limit headers**:
  - `X-RateLimit-Limit`: Maximum requests
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Best Practices

1. **Always include justification** when requesting staff roles
2. **Monitor compliance status** regularly (weekly recommended)
3. **Act on audit logs** - review changes made to staff assignments
4. **Keep credentials current** - verify licenses/certifications annually
5. **Report violations** - notify Super Admin of credential issues

---

## Integration Examples

### Python Client
```python
import requests

class TenadamStaffClient:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {"Authorization": f"Bearer {token}"}
    
    def get_pending_requests(self):
        return requests.get(
            f"{self.base_url}/admin/staff-requests/pending",
            headers=self.headers
        ).json()
    
    def approve_request(self, request_id, notes):
        return requests.post(
            f"{self.base_url}/admin/staff-requests/{request_id}/approve",
            headers=self.headers,
            json={"status": "approved", "approval_notes": notes}
        ).json()
```

### JavaScript/Node.js
```javascript
class TenadamStaffClient {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async getPendingRequests() {
    const res = await fetch(`${this.baseUrl}/admin/staff-requests/pending`, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    return res.json();
  }

  async approveRequest(requestId, notes) {
    const res = await fetch(
      `${this.baseUrl}/admin/staff-requests/${requestId}/approve`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'approved', approval_notes: notes })
      }
    );
    return res.json();
  }
}
```

---

## Support

For API questions or issues:
- Email: api-support@tenadam.local
- Documentation: https://docs.tenadam.local
- Status Page: https://status.tenadam.local
