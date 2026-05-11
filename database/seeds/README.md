# Seed Files Quick Reference

## Summary

The database seeding system is organized into **4 modular SQL files** that build a complete development/testing environment. Each file builds on the previous one and uses conflict-handling for idempotency.

## Files at a Glance

| # | File | Purpose | Size | Duration | Key Output |
|---|------|---------|------|----------|-----------|
| 1 | `00_reset_and_demo_seed.sql` | Initialize tenant, orgs, roles, superadmin | 5.5 KB | ~200ms | 1 tenant, 10 orgs, 5 roles, 1 superadmin |
| 2 | `001_staff_roles_and_templates.sql` | Comprehensive healthcare roles & templates | 16 KB | ~300ms | 80+ roles, 80+ templates |
| 3 | `002_org_admins_and_demo_patients.sql` | Organization admins and 50 demo patients | 20 KB | ~500ms | 10 admins, 50 patients |
| 4 | `003_advanced_demo_data.sql` | Telemedicine, chronic care, pharmacy, AI | 10 KB | ~400ms | Sessions, meds, orders, consent |

**Total seeding time: ~1.5 seconds**

---

## What Gets Seeded

### Tier 1: Tenants & Organizations
```
Default Tenant (1)
├── Health Post 01 & 02 (2)
├── Health Center 01 & 02 (2)
├── Primary Hospital 01 & 02 (2)
├── General Specialized Hospital 01 & 02 (2)
└── National Health System Node 01 & 02 (2)
```

### Tier 2: Roles & Templates
- **Roles**: 80+ comprehensive healthcare roles
- **Templates**: 80+ staff role templates with sort order and categories
- **Coverage**: Executive, Medical, Nursing, Diagnostic, Pharmacy, Allied Health, Admin, IT, Support, Community

### Tier 3: Users & Patients
- **Admins**: 10 (one per organization)
- **Patients**: 50 (10 per tier level)
- **Doctors**: 3 demo providers

### Tier 4: Rich Demo Features
- Telemedicine sessions with anatomy annotations
- Chronic care plans (diabetes, pregnancy)
- Recurrent medications
- Pharmacy data (5 meds, 3 pharmacies, 2 orders)
- AI learning consents
- Demo appointments

---

## Quick Login Reference

| Role | Email | Password |
|------|-------|----------|
| Superadmin | superadmin@tenadam.local | SuperAdmin123! |
| Org Admin (Health Post 01) | admin.hp01@tenadam.local | OrgHp01! |
| Org Admin (Primary Hospital 01) | admin.ph01@tenadam.local | OrgPh01! |
| Patient (Health Post) | patient-hp-01@tenadam.local | PatientHP01! |
| Patient (Primary Hospital) | patient-ph-01@tenadam.local | PatientPH01! |

**Pattern**: `patient-{tier}-{number}@tenadam.local` → `Patient{TIER}{NUMBER}!`

---

## Execution

### One-liner (all seeds)
```bash
# macOS/Linux
for seed in database/seeds/{00,001,002,003}_*.sql; do psql -U postgres -d tenadam_development -f "$seed"; done

# Windows PowerShell
Get-ChildItem database/seeds -Filter "*.sql" | Sort-Object Name | ForEach-Object { psql -U postgres -d tenadam_development -f $_.FullName }
```

### Individual seeds (if needed)
```bash
psql -U postgres -d tenadam_development -f database/seeds/00_reset_and_demo_seed.sql
psql -U postgres -d tenadam_development -f database/seeds/001_staff_roles_and_templates.sql
psql -U postgres -d tenadam_development -f database/seeds/002_org_admins_and_demo_patients.sql
psql -U postgres -d tenadam_development -f database/seeds/003_advanced_demo_data.sql
```

### With Rails
```bash
rails db:migrate          # Ensure schema exists
# Then execute seed scripts above
```

---

## Key Features

✅ **Idempotent**: Safe to re-run multiple times  
✅ **Ordered**: Each file depends on previous ones  
✅ **Modular**: Can skip individual files if needed  
✅ **Conflict-aware**: Uses `ON CONFLICT` for safe upserts  
✅ **Comprehensive**: 80+ roles, 50 patients, telemedicine, pharmacy  
✅ **Deterministic**: Same output every run  

---

## File Dependencies

```
00_reset_and_demo_seed.sql
        ↓
001_staff_roles_and_templates.sql
        ↓
002_org_admins_and_demo_patients.sql
        ↓
003_advanced_demo_data.sql
```

**Never skip a file** - each builds on the previous one.

---

## After Seeding

### Verify Everything Worked
```sql
-- Quick checks (run these in psql)
SELECT COUNT(*) as orgs FROM organizations;           -- Should be 10
SELECT COUNT(*) as roles FROM roles;                  -- Should be 80+
SELECT COUNT(*) as patients FROM patients;            -- Should be 50
SELECT COUNT(*) as users FROM users;                  -- Should be 11 (1 superadmin + 10 admins)
SELECT COUNT(*) as sessions FROM patient_telemedicine_sessions;  -- Should be 1+
```

### Try Logging In
1. **Superadmin**: superadmin@tenadam.local / SuperAdmin123!
2. **Org Admin**: admin.hp01@tenadam.local / OrgHp01!
3. **Patient**: patient-hp-01@tenadam.local / PatientHP01!

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "relation does not exist" | Run `rails db:migrate` first |
| "duplicate key value" | Seeds handle conflicts, but check if DB was properly reset |
| "connection refused" | Start PostgreSQL: `docker-compose up -d postgres` |
| "password auth failed" | Check DB credentials in connection string |
| Partial seeding | Always run all 4 files in order, don't skip any |

---

## Files Reference

- **00_reset_and_demo_seed.sql** - Base infrastructure (tenant, orgs, roles)
- **001_staff_roles_and_templates.sql** - Role taxonomy and templates
- **002_org_admins_and_demo_patients.sql** - Users and 50 patients
- **003_advanced_demo_data.sql** - Telemedicine, pharmacy, AI data
- **demo_credentials.md** - Complete credentials reference
- **SEED_EXECUTION_GUIDE.md** - Detailed execution guide with verification queries

---

## Notes

- All demos use `@tenadam.local` email domain for isolation
- Passwords are test-only (never use in production)
- Seeds truncate on first run but are idempotent after
- Each organization has exactly one admin
- 50 patients distributed across 5 tiers (10 each)
- Telemedicine demo ready for end-to-end testing

For detailed information, see `SEED_EXECUTION_GUIDE.md` and `demo_credentials.md`.
