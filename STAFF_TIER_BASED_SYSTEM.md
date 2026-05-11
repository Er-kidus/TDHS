# Tenadam EMR: Tier-Based Staff Template Structure

## Overview

The Tenadam Digital Healthcare System implements a real-world, tier-based staff management system that aligns staff roles with organizational capability levels. This ensures that:

1. **Health Posts** have minimal, essential staff
2. **Health Centers** have expanded primary care and basic diagnostics
3. **Primary Hospitals** have surgical capability and specialized departments
4. **General Specialized Hospitals** have multiple specialists and advanced procedures
5. **National Health System nodes** have full capability including research

---

## Tier Definitions

### Health Post (Tier 1)
**Capability**: Basic primary care, triage, health education, minor procedures
**Key Staff**: 1 GP, 1-2 RNs, 1 pharmacist, 1 lab tech, support staff

**Unavailable Roles**:
- ❌ Surgeons (any specialty)
- ❌ Specialists (except GP)
- ❌ Advanced diagnostics (CT/MRI)
- ❌ Multiple departments

**Approved Roles** (11 total):
- Medical: GP
- Nursing: RN, LPN, Aide
- Allied: Pharmacist
- Diagnostic: Lab Technician, Phlebotomist
- Administrative: Hospital Admin, Training Coordinator
- Support: Security, Housekeeping, Community Worker

---

### Health Center (Tier 2)
**Capability**: Outpatient care, emergency triage, inpatient admission, maternity, basic lab/imaging
**Key Staff**: 2 GPs, Medical Director, 3+ RNs, Lab Director, Sonographer

**Unavailable Roles**:
- ❌ Surgeons (except for referrals)
- ❌ Specialists (limited to primary care)
- ❌ CT/MRI Technicians
- ❌ Advanced procedures (cardiothoracic, neuro-surgery)

**Approved Roles** (36 total):
- Medical: GP (2), Director, Intern
- Nursing: Full spectrum including Midwife, Triage, Manager
- Allied: Pharmacist, Tech, Dietitian, Social Worker
- Diagnostic: Lab Director, Tech, Sonographer
- Administrative: Ops Manager, Billing Officer, Records
- Support: Kitchen, Food Service, Inventory, etc.

---

### Primary Hospital (Tier 3)
**Capability**: Comprehensive care with surgical services, specialized departments, ICU, advanced imaging
**Key Staff**: Multiple physicians, surgeons, specialists, 8+ RNs, full diagnostic suite

**Unavailable Roles**:
- ❌ Cardiothoracic Surgeon (requires National level)
- ❌ AI/Clinical Decision Support Engineer
- ❌ Advanced research positions

**Approved Roles** (103 total):
- Medical: Attending (2+), Registrar, Resident, 5 specialties
- Surgical: General, Orthopedic, Urological, OB/GYN
- Procedures: Anesthesiologist, Intensivist, Radiologist
- Nursing: Director, ICU, Surgical, Pediatric, Midwife
- Allied: All 15 roles including Physiotherapist, Psychologist
- Diagnostic: Lab Scientist, Radiographer, Sonographer, Equipment Tech
- Administrative: Full suite including HR Manager, Billing Suite
- IT: EMR Admin, System Admin, Database Admin

---

### General Specialized Hospital (Tier 4)
**Capability**: Multi-specialty care, advanced procedures, complex cases, specialized imaging
**Key Staff**: Multiple specialists, surgeons, pathologist, oncology, psychiatry, intensive research

**Unavailable Roles**:
- ❌ Cardiothoracic Surgeon (national level)
- ❌ AI Engineer (national level only)
- ❌ Board of Trustees (optional)

**Approved Roles** (75 total):
- Medical: Consultants (3+), 5 specialties including Cardiology, Psychiatry, Oncology
- Surgical: Orthopedic, Neuro, Plastic, Urologist
- Procedures: Pathologist (new tier availability)
- Nursing: Oncology, Dialysis, Psychiatric specialists
- Diagnostic: CT/MRI Technician, Biomedical Engineer
- Allied: Psychologist, Speech Therapist, Respiratory Therapist
- Administrative: Health Information Manager, Cybersecurity Specialist
- Research: Research Scientist, Clinical Trial Coordinator
- IT: Data Analyst, Cybersecurity Specialist

---

### National Health System (Tier 5)
**Capability**: Tertiary care, research, complex surgical cases, epidemiology, AI/decision support
**Key Staff**: Full governance, all specialties, cardiothoracic surgery, research infrastructure

**Available Roles**: All 154 roles including:
- Governance: Board of Directors, Trustees, CEO, CMO, CNO, CFO, CIO, CTO
- Medical: All specialties and ranks
- Surgical: Including Cardiothoracic
- Procedures: All diagnostic and procedure specialists
- Research: Scientists, Academic Staff
- IT: AI Engineer, Cybersecurity Specialist
- Education: Medical Educators, Researchers

---

## Staff Template Request & Approval Workflow

### How Super Admin Approves/Revokes Staff Templates

1. **Organization Admin submits request** with justification
2. **Super Admin reviews** against tier capabilities
3. **Super Admin approves/rejects** based on:
   - Organization tier alignment
   - Credibility assessment
   - Service offerings (what org claims to provide)
   - Minimum staffing requirements met

### Request Status Lifecycle

```
pending → approved → [active in use]
        ↓
       rejected

approved → revoked → [staff role removed]
```

### Example Validation Logic

```sql
-- Health Post cannot request Surgeon
IF org_tier = 'health-post' AND template = 'surg-general'
  THEN reject "Surgeons not available for Health Post tier"

-- Health Center cannot have Cardiothoracic Surgeon
IF org_tier = 'health-center' AND template = 'surg-cardio'
  THEN reject "Cardiothoracic Surgery requires Primary Hospital+ tier"

-- Health Center requesting 3 Specialists requires 3+ doctors
IF staff_count('med-attending') < 3 AND requested_templates > 3
  THEN flag "Review minimum staffing levels"
```

---

## Real-World Alignment

### Health Post
- Often run by 1-2 health extension workers in rural areas
- Serves basic preventive/curative services
- Refers complex cases to health centers

### Health Center
- Community-level facility with maternity services
- Basic surgery may be included (minor procedures)
- Serves 10,000-50,000 population
- Coordinates with hospitals for referrals

### Primary Hospital
- District/provincial level facility
- Has OR, ICU, pediatric ward
- Multiple medical departments
- Trains health professionals

### General Specialized Hospital
- Regional referral center
- Multiple specialized departments
- Advanced diagnostics (CT, MRI)
- Some teaching/research capacity

### National Health System Node
- Tertiary care center
- Full government health system integration
- Research and development
- International standards compliance

---

## Database Tables

### 1. `staff_role_templates` (154 canonical roles)
- `template_key`: Unique identifier (e.g., 'surg-general')
- `title`: Human-readable name
- `role_group`: Category (Clinical, Nursing, Administrative, etc.)
- `category`: Specific type
- `api_role`: Permission level for API
- `description`: Includes tier restrictions in notes
- `sort_order`: Display order
- `active`: Boolean flag

### 2. `staff_template_tier_access`
- Links roles to organization tiers
- Specifies minimum staff required per tier
- Example: Health Center needs at least 1 Lab Director

### 3. `organization_staff_template_requests`
- Tracks all staff role requests
- Status: pending, approved, rejected, revoked
- Includes justification and approval notes
- Records who approved and when

---

## Database Seed Data

Migrations included:

1. **021_staff_templates_tier_based.sql**
   - Creates 154 canonical staff roles with tier descriptions
   - Creates tier access control table
   - Defines minimum staffing per tier

2. **022_seed_tier_based_staff_assignments.sql**
   - Seeds realistic staff assignments for demo organizations
   - Health Post: 11 roles
   - Health Center: 36 roles
   - Primary Hospital: 103 roles
   - General Specialized: 75 roles
   - National System: 82 roles

---

## Query Examples for Admin Dashboard

### List all available staff for Health Center

```sql
SELECT st.title, st.category, sta.min_staff_required
FROM staff_role_templates st
JOIN staff_template_tier_access sta ON st.template_key = sta.staff_template_key
WHERE sta.organization_tier = 'health-center'
ORDER BY st.sort_order;
```

### Check pending staff requests for all organizations

```sql
SELECT 
  org.name,
  st.title,
  ostr.status,
  ostr.justification,
  ostr.created_at
FROM organization_staff_template_requests ostr
JOIN organizations org ON ostr.organization_id = org.id
JOIN staff_role_templates st ON ostr.staff_template_key = st.template_key
WHERE ostr.status = 'pending'
ORDER BY ostr.created_at DESC;
```

### Approve staff template request

```sql
UPDATE organization_staff_template_requests
SET 
  status = 'approved',
  approved_by = :superadmin_user_id,
  approval_notes = 'Verified tier alignment and credibility',
  approved_at = NOW()
WHERE id = :request_id;
```

### Revoke staff access

```sql
UPDATE organization_staff_template_requests
SET 
  status = 'revoked',
  approval_notes = 'Non-compliance with staffing standards',
  updated_at = NOW()
WHERE id = :request_id;
```

---

## Next Steps

1. **Dashboard Integration**: Build UI for Super Admin to:
   - View pending requests
   - Approve/reject with notes
   - Revoke access
   - View org staffing vs tier requirements

2. **Compliance Checks**: Add nightly jobs to verify:
   - Orgs don't exceed unauthorized staff
   - Minimum staffing maintained
   - Audit trail of changes

3. **User Assignment**: Create workflow to:
   - Link staff_profile to approved template
   - Prevent unauthorized role assignment
   - Track actual staff vs approved templates

4. **Reporting**: Enable reports like:
   - "Health Centers missing minimum surgeons"
   - "Unauthorized specialist roles by region"
   - "Staff turnover by tier"
