# Database Seed Execution Guide

This guide explains the database seeding process, seed file organization, and execution workflow.

## Overview

The database seeding system uses **modular, ordered SQL files** that build a complete demo environment in stages. Each seed file has specific dependencies and should be executed in order.

## Seed Files & Execution Order

### 1. **00_reset_and_demo_seed.sql** (Initialization)
**Purpose**: Reset database and seed base infrastructure
**Dependencies**: None

**What it does**:
- Creates PostgreSQL extensions (uuid-ossp, pgcrypto)
- Truncates all non-reference tables (RESTART IDENTITY CASCADE)
- Inserts 1 tenant (`default`)
- Inserts 10 organizations across all 5 healthcare tiers
- Inserts 5 base roles (superadmin, admin, doctor, nurse, staff)
- Creates superadmin user
- Assigns superadmin role

**Reference tables preserved** (NOT truncated):
- `tenants`
- `roles`
- `staff_role_templates`
- `organization_tier_requirements`
- `services`
- `service_resources`
- `service_availability`
- `service_rules`
- `service_transitions`

---

### 2. **001_staff_roles_and_templates.sql** (Comprehensive Roles)
**Purpose**: Populate complete healthcare role taxonomy and staff templates
**Dependencies**: Must run after 00_reset_and_demo_seed.sql

**What it does**:
- Adds role columns if missing (description, active)
- Cleans up non-privileged roles (keeps admin, superadmin)
- Inserts 80+ comprehensive healthcare roles:
  - Executive/Governance
  - Medical (GP, Specialists, Surgeons, etc.)
  - Nursing (RN, LPN, Specialists, Midwives, NP)
  - Diagnostic (Lab, Imaging, Phlebotomy)
  - Pharmacy
  - Allied Health
  - Administration
  - IT & Digital Health
  - Support Staff
  - Community Health
- Inserts 80+ staff role templates with:
  - Template keys (e.g., `med-gp`, `nurse-rn`)
  - Display titles
  - Role groups and categories
  - API role mappings
  - Sort order for UI display

---

### 3. **002_org_admins_and_demo_patients.sql** (Users & Patients)
**Purpose**: Create organization admins and 50 demo patient accounts
**Dependencies**: Must run after 001_staff_roles_and_templates.sql

**What it does**:
- Creates 10 organization admin users (one per org)
- Assigns `admin` role to each org admin
- Creates 50 demo patient accounts:
  - 10 Health Post patients (patient-hp-01 ... 10)
  - 10 Health Center patients (patient-hc-01 ... 10)
  - 10 Primary Hospital patients (patient-ph-01 ... 10)
  - 10 General Specialized Hospital patients (patient-gs-01 ... 10)
  - 10 National Health System patients (patient-nh-01 ... 10)
- All patients have:
  - Deterministic emails and passwords
  - Profile JSON with gender and language preferences
  - Active status

---

### 4. **003_advanced_demo_data.sql** (Rich Demo Content)
**Purpose**: Populate telemedicine, chronic care, pharmacy, and AI features
**Dependencies**: Must run after 002_org_admins_and_demo_patients.sql

**What it does**:
- Creates AI user consents
- Creates chronic care plans (Type 2 Diabetes example)
- Creates pregnancy care plan (Trimester 2 example)
- Creates recurrent medication records
- Creates healthcare provider accounts (3 doctors)
- Creates telemedicine sessions with:
  - Anatomy annotations
  - Session artifacts (recording, transcript, summary)
- Creates appointments from telemedicine workflow
- Creates AI learning samples
- Populates pharmacy data:
  - 5 medications
  - 3 pharmacies
  - 2 patient pharmacy orders

---

## Execution Methods

### Option 1: Using psql (Direct)

```bash
# Execute all seeds in order
psql -h localhost -U postgres -d tenadam_development -f database/seeds/00_reset_and_demo_seed.sql
psql -h localhost -U postgres -d tenadam_development -f database/seeds/001_staff_roles_and_templates.sql
psql -h localhost -U postgres -d tenadam_development -f database/seeds/002_org_admins_and_demo_patients.sql
psql -h localhost -U postgres -d tenadam_development -f database/seeds/003_advanced_demo_data.sql
```

### Option 2: Using Docker Compose

If your `docker-compose.yml` includes a seed script:

```bash
# Execute seed script (if configured)
docker-compose exec postgres psql -U postgres -d tenadam_development -f /docker-entrypoint-initdb.d/seed.sh
```

### Option 3: Batch Execution Script

Create `database/scripts/seed.sh`:

```bash
#!/bin/bash
set -e

DB_HOST=${DB_HOST:-localhost}
DB_USER=${DB_USER:-postgres}
DB_NAME=${DB_NAME:-tenadam_development}

echo "Seeding database: $DB_NAME"

psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f database/seeds/00_reset_and_demo_seed.sql
echo "✓ Base initialization complete"

psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f database/seeds/001_staff_roles_and_templates.sql
echo "✓ Roles and templates complete"

psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f database/seeds/002_org_admins_and_demo_patients.sql
echo "✓ Organizations and patients complete"

psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f database/seeds/003_advanced_demo_data.sql
echo "✓ Advanced demo data complete"

echo "Database seeding complete!"
```

Then run:
```bash
chmod +x database/scripts/seed.sh
./database/scripts/seed.sh
```

### Option 4: From Docker Container

```bash
# If database is in Docker
docker exec -i container_name psql -U postgres -d tenadam_development < database/seeds/00_reset_and_demo_seed.sql
docker exec -i container_name psql -U postgres -d tenadam_development < database/seeds/001_staff_roles_and_templates.sql
docker exec -i container_name psql -U postgres -d tenadam_development < database/seeds/002_org_admins_and_demo_patients.sql
docker exec -i container_name psql -U postgres -d tenadam_development < database/seeds/003_advanced_demo_data.sql
```

---

## Verification Queries

After seeding, verify data completeness:

```sql
-- Check tenant
SELECT COUNT(*) as tenant_count FROM tenants WHERE slug = 'default';

-- Check organizations (should be 10)
SELECT COUNT(*) as org_count FROM organizations WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'default');

-- Check roles (should be 80+)
SELECT COUNT(*) as role_count FROM roles;

-- Check staff templates (should be 80+)
SELECT COUNT(*) as template_count FROM staff_role_templates;

-- Check users
SELECT COUNT(*) as user_count FROM users WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'default');

-- Check patients (should be 50)
SELECT COUNT(*) as patient_count FROM patients WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'default');

-- Check telemedicine sessions
SELECT COUNT(*) as session_count FROM patient_telemedicine_sessions;

-- Check pharmacy data
SELECT COUNT(*) as med_count FROM pharmacy_medications;
SELECT COUNT(*) as pharmacy_count FROM pharmacies;
SELECT COUNT(*) as order_count FROM patient_pharmacy_orders;

-- Test superadmin login
SELECT id, email, full_name FROM users WHERE email = 'superadmin@tenadam.local';

-- Test org admin login
SELECT id, email, full_name FROM users WHERE email = 'admin.hp01@tenadam.local';

-- Test patient login
SELECT id, email, full_name FROM patients WHERE email = 'patient-hp-01@tenadam.local';
```

---

## Common Issues & Solutions

### Issue: "relation does not exist"
**Cause**: Seed ran in wrong order or database schema not migrated yet

**Solution**:
```bash
# Run migrations first
rails db:migrate

# Then run seeds in order
```

### Issue: "duplicate key value violates unique constraint"
**Cause**: Seed includes conflict handling, but may be re-running on non-reset database

**Solution**:
```bash
# Option 1: Reset and reseed
rails db:reset

# Option 2: Run first seed to truncate
psql -h localhost -U postgres -d tenadam_development -f database/seeds/00_reset_and_demo_seed.sql
```

### Issue: "password authentication failed"
**Cause**: Connection credentials mismatch

**Solution**: Adjust connection parameters:
```bash
psql -h localhost -U postgres -d tenadam_development -W  # prompts for password
```

### Issue: "could not connect to server"
**Cause**: Database not running

**Solution**:
```bash
# Start database
docker-compose up -d postgres

# Or ensure PostgreSQL service is running
sudo systemctl start postgresql  # Linux
brew services start postgresql   # macOS
```

---

## Idempotency

All seed files use `ON CONFLICT ... DO UPDATE/NOTHING` patterns, making them **idempotent**:

- Can be re-run safely without errors
- Existing records updated to latest seed values
- Safe for CI/CD pipelines
- Can be used for data maintenance/reset

Example:
```sql
INSERT INTO organizations (tenant_id, name, slug, ...)
VALUES (...)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  contact_email = EXCLUDED.contact_email,
  updated_at = NOW();
```

---

## Integration with Rails

If using Rails migrations + seeds:

**config/database.yml**:
```yaml
development:
  adapter: postgresql
  database: tenadam_development
```

**Seed all data**:
```bash
rails db:seed
# Runs db/seeds.rb which should execute seed scripts in order
```

**Create seeds.rb** to orchestrate:
```ruby
# db/seeds.rb
system("psql -d #{ENV['DATABASE_URL']} -f database/seeds/00_reset_and_demo_seed.sql") or exit 1
system("psql -d #{ENV['DATABASE_URL']} -f database/seeds/001_staff_roles_and_templates.sql") or exit 1
system("psql -d #{ENV['DATABASE_URL']} -f database/seeds/002_org_admins_and_demo_patients.sql") or exit 1
system("psql -d #{ENV['DATABASE_URL']} -f database/seeds/003_advanced_demo_data.sql") or exit 1
```

---

## Performance Notes

- **00_reset_and_demo_seed.sql**: ~200ms (fast)
- **001_staff_roles_and_templates.sql**: ~300ms (many inserts)
- **002_org_admins_and_demo_patients.sql**: ~500ms (50 patients)
- **003_advanced_demo_data.sql**: ~400ms (telemedicine + pharmacy)

**Total seeding time: ~1.5 seconds** (on modern hardware)

---

## Production Considerations

⚠️ **NEVER use these seed files in production**

These seeds are designed for **development and testing only**:
- Contains demo credentials
- Uses test data
- Truncates tables (destructive)
- Disables constraints

For production initialization, create:
- Separate initialization scripts
- Secure credential management
- Proper backup procedures
- Data validation/sanitization

---

## File Locations

```
database/
├── seeds/
│   ├── 00_reset_and_demo_seed.sql          # Base initialization
│   ├── 001_staff_roles_and_templates.sql   # Roles & templates
│   ├── 002_org_admins_and_demo_patients.sql # Users & patients
│   ├── 003_advanced_demo_data.sql          # Rich demo content
│   └── demo_credentials.md                 # Credentials reference
├── scripts/
│   └── seed.sh                             # Seed execution script
└── migrations/
    └── [migration files]                   # Schema migrations
```

---

## Contact & Support

For seed-related issues or questions:
1. Check verification queries above
2. Review seed file comments
3. Consult `demo_credentials.md` for expected data
4. Run individual seed files to isolate issues
