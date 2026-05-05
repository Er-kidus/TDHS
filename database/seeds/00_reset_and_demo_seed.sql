-- Reset local/dev data and seed a reproducible demo dataset.
-- This file is used by infrastructure/scripts/seed.sh when present.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT IN (
        'tenants',
        'roles',
        'staff_role_templates',
        'organization_tier_requirements',
        'services',
        'service_resources',
        'service_availability',
        'service_rules',
        'service_transitions'
      )
  LOOP
    EXECUTE format('TRUNCATE TABLE public.%I RESTART IDENTITY CASCADE', r.tablename);
  END LOOP;
END $$;

INSERT INTO tenants (name, slug)
VALUES ('Default Tenant', 'default')
ON CONFLICT (slug) DO UPDATE SET updated_at = NOW();

INSERT INTO organizations (tenant_id, name, slug, contact_name, contact_email, contact_phone, address, latitude, longitude, services)
VALUES
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Default Organization', 'default-org', 'System Super Admin', 'superadmin@tenadam.local', '+251900000000', 'Addis Ababa', 0, 0, '[]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  tenant_id = EXCLUDED.tenant_id,
  name = EXCLUDED.name,
  contact_name = EXCLUDED.contact_name,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  address = EXCLUDED.address,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  services = EXCLUDED.services,
  updated_at = NOW();

INSERT INTO roles (name)
VALUES ('superadmin'), ('admin'), ('doctor'), ('nurse'), ('staff')
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (tenant_id, organization_id, full_name, email, password_hash, active)
VALUES (
  (SELECT id FROM tenants WHERE slug = 'default'),
  (SELECT id FROM organizations WHERE slug = 'default-org'),
  'System Super Admin',
  'superadmin@tenadam.local',
  crypt('SuperAdmin123!', gen_salt('bf')),
  TRUE
)
ON CONFLICT (email) DO UPDATE SET
  tenant_id = EXCLUDED.tenant_id,
  organization_id = EXCLUDED.organization_id,
  full_name = EXCLUDED.full_name,
  password_hash = EXCLUDED.password_hash,
  active = TRUE,
  updated_at = NOW();

INSERT INTO user_roles (user_id, role_id)
SELECT
  (SELECT id FROM users WHERE email = 'superadmin@tenadam.local'),
  (SELECT id FROM roles WHERE name = 'superadmin')
ON CONFLICT DO NOTHING;
