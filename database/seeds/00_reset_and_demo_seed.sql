-- Reset local/dev data and seed a reproducible demo dataset.
-- This file is used by infrastructure/scripts/seed.sh when present.
-- EXECUTION ORDER: This runs FIRST to reset and seed base tenants/orgs/roles

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

-- 1. Ensure Default Tenant exists
INSERT INTO tenants (name, slug)
VALUES ('Default Tenant', 'default')
ON CONFLICT (slug) DO UPDATE SET updated_at = NOW();

-- 2. Seed demonstration organizations at each tier level
INSERT INTO organizations (tenant_id, name, slug, tier, contact_name, contact_email, contact_phone, address, latitude, longitude, services)
VALUES
  -- Health Posts (Tier 1)
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Green Valley Health Post 01', 'hc-post-01', 'health_post', 'Workworku Assefa', 'contact@hvhp01.local', '+251900100001', 'Addis Ababa, Gulele', 9.0320, 38.7469, '[]'::jsonb),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Green Valley Health Post 02', 'hc-post-02', 'health_post', 'Almaz Tadesse', 'contact@hvhp02.local', '+251900100002', 'Addis Ababa, Nifas Silk', 9.0050, 38.7950, '[]'::jsonb),
  
  -- Health Centers (Tier 2)
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Community Health Center 01', 'hc-center-01', 'health_center', 'Kebede Muleta', 'contact@chc01.local', '+251900200001', 'Addis Ababa, Kazanchis', 9.0270, 38.8015, '[]'::jsonb),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Community Health Center 02', 'hc-center-02', 'health_center', 'Saba Negash', 'contact@chc02.local', '+251900200002', 'Addis Ababa, Piassa', 9.0325, 38.7650, '[]'::jsonb),
  
  -- Primary Hospitals (Tier 3)
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Primary Hospital 01', 'ph-01', 'primary_hospital', 'Dr. Yohannes Tsegaye', 'contact@ph01.local', '+251900300001', 'Addis Ababa, Kolfe Keranio', 8.9950, 38.7250, '[]'::jsonb),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Primary Hospital 02', 'ph-02', 'primary_hospital', 'Dr. Meaza Assefa', 'contact@ph02.local', '+251900300002', 'Addis Ababa, Bole', 9.0050, 38.8050, '[]'::jsonb),
  
  -- General Specialized Hospitals (Tier 4)
  ((SELECT id FROM tenants WHERE slug = 'default'), 'General Specialized Hospital 01', 'gs-01', 'general_specialized_hospital', 'Prof. Abebaw Tessema', 'contact@gs01.local', '+251900400001', 'Addis Ababa, Addis Ketema', 9.0370, 38.7450, '[]'::jsonb),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'General Specialized Hospital 02', 'gs-02', 'general_specialized_hospital', 'Dr. Aster Demissie', 'contact@gs02.local', '+251900400002', 'Addis Ababa, Kirkos', 9.0100, 38.7500, '[]'::jsonb),
  
  -- National Health System Nodes (Tier 5)
  ((SELECT id FROM tenants WHERE slug = 'default'), 'National Health System Node 01', 'nh-01', 'national_health_system', 'Dr. Solomon Bekele', 'contact@nh01.local', '+251900500001', 'Addis Ababa, Yeka', 9.0800, 38.8100, '[]'::jsonb),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'National Health System Node 02', 'nh-02', 'national_health_system', 'Dr. Hiwot Abebe', 'contact@nh02.local', '+251900500002', 'Addis Ababa, Arada', 9.0300, 38.7350, '[]'::jsonb),
  
  -- Default organization for legacy support
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Default Organization', 'default-org', 'health_post', 'System Super Admin', 'superadmin@tenadam.local', '+251900000000', 'Addis Ababa', 0, 0, '[]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  tenant_id = EXCLUDED.tenant_id,
  name = EXCLUDED.name,
  tier = EXCLUDED.tier,
  contact_name = EXCLUDED.contact_name,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  address = EXCLUDED.address,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  services = EXCLUDED.services,
  updated_at = NOW();

-- 3. Seed base roles (will be expanded in 001_staff_roles_and_templates.sql)
INSERT INTO roles (name, description, active)
VALUES 
  ('superadmin', 'Superadmin', TRUE),
  ('admin', 'Administrator', TRUE),
  ('doctor', 'Doctor/Physician', TRUE),
  ('nurse', 'Nurse', TRUE),
  ('staff', 'Support Staff', TRUE)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  updated_at = NOW();

-- 4. Create superadmin user
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

-- 5. Assign superadmin role to superadmin user
INSERT INTO user_roles (user_id, role_id)
SELECT
  (SELECT id FROM users WHERE email = 'superadmin@tenadam.local'),
  (SELECT id FROM roles WHERE name = 'superadmin')
ON CONFLICT DO NOTHING;
