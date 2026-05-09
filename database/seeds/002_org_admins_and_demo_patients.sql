-- Seed data: Organization Admins and Demo Patient Accounts
-- EXECUTION ORDER: This runs THIRD after 00_reset_and_demo_seed.sql and 001_staff_roles_and_templates.sql
-- Creates admin users for each organization and demo patient accounts for testing

BEGIN;

-- ===== ORGANIZATION ADMIN ACCOUNTS (one admin per organization) =====

-- Health Post 01 Admin
INSERT INTO users (tenant_id, organization_id, full_name, email, password_hash, active)
SELECT
  (SELECT id FROM tenants WHERE slug = 'default'),
  (SELECT id FROM organizations WHERE slug = 'hc-post-01'),
  'Health Post 01 Admin',
  'admin.hp01@tenadam.local',
  crypt('OrgHp01!', gen_salt('bf')),
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin.hp01@tenadam.local');

INSERT INTO user_roles (user_id, role_id)
SELECT
  (SELECT id FROM users WHERE email = 'admin.hp01@tenadam.local'),
  (SELECT id FROM roles WHERE name = 'admin')
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_id = (SELECT id FROM users WHERE email = 'admin.hp01@tenadam.local')
  AND role_id = (SELECT id FROM roles WHERE name = 'admin')
);

-- Health Post 02 Admin
INSERT INTO users (tenant_id, organization_id, full_name, email, password_hash, active)
SELECT
  (SELECT id FROM tenants WHERE slug = 'default'),
  (SELECT id FROM organizations WHERE slug = 'hc-post-02'),
  'Health Post 02 Admin',
  'admin.hp02@tenadam.local',
  crypt('OrgHp02!', gen_salt('bf')),
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin.hp02@tenadam.local');

INSERT INTO user_roles (user_id, role_id)
SELECT
  (SELECT id FROM users WHERE email = 'admin.hp02@tenadam.local'),
  (SELECT id FROM roles WHERE name = 'admin')
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_id = (SELECT id FROM users WHERE email = 'admin.hp02@tenadam.local')
  AND role_id = (SELECT id FROM roles WHERE name = 'admin')
);

-- Health Center 01 Admin
INSERT INTO users (tenant_id, organization_id, full_name, email, password_hash, active)
SELECT
  (SELECT id FROM tenants WHERE slug = 'default'),
  (SELECT id FROM organizations WHERE slug = 'hc-center-01'),
  'Health Center 01 Admin',
  'admin.hc01@tenadam.local',
  crypt('OrgHc01!', gen_salt('bf')),
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin.hc01@tenadam.local');

INSERT INTO user_roles (user_id, role_id)
SELECT
  (SELECT id FROM users WHERE email = 'admin.hc01@tenadam.local'),
  (SELECT id FROM roles WHERE name = 'admin')
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_id = (SELECT id FROM users WHERE email = 'admin.hc01@tenadam.local')
  AND role_id = (SELECT id FROM roles WHERE name = 'admin')
);

-- Health Center 02 Admin
INSERT INTO users (tenant_id, organization_id, full_name, email, password_hash, active)
SELECT
  (SELECT id FROM tenants WHERE slug = 'default'),
  (SELECT id FROM organizations WHERE slug = 'hc-center-02'),
  'Health Center 02 Admin',
  'admin.hc02@tenadam.local',
  crypt('OrgHc02!', gen_salt('bf')),
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin.hc02@tenadam.local');

INSERT INTO user_roles (user_id, role_id)
SELECT
  (SELECT id FROM users WHERE email = 'admin.hc02@tenadam.local'),
  (SELECT id FROM roles WHERE name = 'admin')
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_id = (SELECT id FROM users WHERE email = 'admin.hc02@tenadam.local')
  AND role_id = (SELECT id FROM roles WHERE name = 'admin')
);

-- Primary Hospital 01 Admin
INSERT INTO users (tenant_id, organization_id, full_name, email, password_hash, active)
SELECT
  (SELECT id FROM tenants WHERE slug = 'default'),
  (SELECT id FROM organizations WHERE slug = 'ph-01'),
  'Primary Hospital 01 Admin',
  'admin.ph01@tenadam.local',
  crypt('OrgPh01!', gen_salt('bf')),
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin.ph01@tenadam.local');

INSERT INTO user_roles (user_id, role_id)
SELECT
  (SELECT id FROM users WHERE email = 'admin.ph01@tenadam.local'),
  (SELECT id FROM roles WHERE name = 'admin')
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_id = (SELECT id FROM users WHERE email = 'admin.ph01@tenadam.local')
  AND role_id = (SELECT id FROM roles WHERE name = 'admin')
);

-- Primary Hospital 02 Admin
INSERT INTO users (tenant_id, organization_id, full_name, email, password_hash, active)
SELECT
  (SELECT id FROM tenants WHERE slug = 'default'),
  (SELECT id FROM organizations WHERE slug = 'ph-02'),
  'Primary Hospital 02 Admin',
  'admin.ph02@tenadam.local',
  crypt('OrgPh02!', gen_salt('bf')),
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin.ph02@tenadam.local');

INSERT INTO user_roles (user_id, role_id)
SELECT
  (SELECT id FROM users WHERE email = 'admin.ph02@tenadam.local'),
  (SELECT id FROM roles WHERE name = 'admin')
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_id = (SELECT id FROM users WHERE email = 'admin.ph02@tenadam.local')
  AND role_id = (SELECT id FROM roles WHERE name = 'admin')
);

-- General Specialized Hospital 01 Admin
INSERT INTO users (tenant_id, organization_id, full_name, email, password_hash, active)
SELECT
  (SELECT id FROM tenants WHERE slug = 'default'),
  (SELECT id FROM organizations WHERE slug = 'gs-01'),
  'General Specialized Hospital 01 Admin',
  'admin.gs01@tenadam.local',
  crypt('OrgGs01!', gen_salt('bf')),
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin.gs01@tenadam.local');

INSERT INTO user_roles (user_id, role_id)
SELECT
  (SELECT id FROM users WHERE email = 'admin.gs01@tenadam.local'),
  (SELECT id FROM roles WHERE name = 'admin')
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_id = (SELECT id FROM users WHERE email = 'admin.gs01@tenadam.local')
  AND role_id = (SELECT id FROM roles WHERE name = 'admin')
);

-- General Specialized Hospital 02 Admin
INSERT INTO users (tenant_id, organization_id, full_name, email, password_hash, active)
SELECT
  (SELECT id FROM tenants WHERE slug = 'default'),
  (SELECT id FROM organizations WHERE slug = 'gs-02'),
  'General Specialized Hospital 02 Admin',
  'admin.gs02@tenadam.local',
  crypt('OrgGs02!', gen_salt('bf')),
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin.gs02@tenadam.local');

INSERT INTO user_roles (user_id, role_id)
SELECT
  (SELECT id FROM users WHERE email = 'admin.gs02@tenadam.local'),
  (SELECT id FROM roles WHERE name = 'admin')
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_id = (SELECT id FROM users WHERE email = 'admin.gs02@tenadam.local')
  AND role_id = (SELECT id FROM roles WHERE name = 'admin')
);

-- National Health System Node 01 Admin
INSERT INTO users (tenant_id, organization_id, full_name, email, password_hash, active)
SELECT
  (SELECT id FROM tenants WHERE slug = 'default'),
  (SELECT id FROM organizations WHERE slug = 'nh-01'),
  'National Health System Node 01 Admin',
  'admin.nh01@tenadam.local',
  crypt('OrgNh01!', gen_salt('bf')),
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin.nh01@tenadam.local');

INSERT INTO user_roles (user_id, role_id)
SELECT
  (SELECT id FROM users WHERE email = 'admin.nh01@tenadam.local'),
  (SELECT id FROM roles WHERE name = 'admin')
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_id = (SELECT id FROM users WHERE email = 'admin.nh01@tenadam.local')
  AND role_id = (SELECT id FROM roles WHERE name = 'admin')
);

-- National Health System Node 02 Admin
INSERT INTO users (tenant_id, organization_id, full_name, email, password_hash, active)
SELECT
  (SELECT id FROM tenants WHERE slug = 'default'),
  (SELECT id FROM organizations WHERE slug = 'nh-02'),
  'National Health System Node 02 Admin',
  'admin.nh02@tenadam.local',
  crypt('OrgNh02!', gen_salt('bf')),
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin.nh02@tenadam.local');

INSERT INTO user_roles (user_id, role_id)
SELECT
  (SELECT id FROM users WHERE email = 'admin.nh02@tenadam.local'),
  (SELECT id FROM roles WHERE name = 'admin')
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_id = (SELECT id FROM users WHERE email = 'admin.nh02@tenadam.local')
  AND role_id = (SELECT id FROM roles WHERE name = 'admin')
);

-- ===== DEMO PATIENT ACCOUNTS =====
-- Each tier has 10 patients for testing purposes
-- Pattern: patient-{tier}-{number}@tenadam.local with corresponding password

-- Health Post Patients (10 patients)
INSERT INTO patients (tenant_id, full_name, email, phone, password_hash, profile, active)
VALUES
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient HP-01', 'patient-hp-01@tenadam.local', '+251900010101', crypt('PatientHP01!', gen_salt('bf')), '{"gender":"male","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient HP-02', 'patient-hp-02@tenadam.local', '+251900010102', crypt('PatientHP02!', gen_salt('bf')), '{"gender":"female","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient HP-03', 'patient-hp-03@tenadam.local', '+251900010103', crypt('PatientHP03!', gen_salt('bf')), '{"gender":"male","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient HP-04', 'patient-hp-04@tenadam.local', '+251900010104', crypt('PatientHP04!', gen_salt('bf')), '{"gender":"female","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient HP-05', 'patient-hp-05@tenadam.local', '+251900010105', crypt('PatientHP05!', gen_salt('bf')), '{"gender":"male","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient HP-06', 'patient-hp-06@tenadam.local', '+251900010106', crypt('PatientHP06!', gen_salt('bf')), '{"gender":"female","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient HP-07', 'patient-hp-07@tenadam.local', '+251900010107', crypt('PatientHP07!', gen_salt('bf')), '{"gender":"male","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient HP-08', 'patient-hp-08@tenadam.local', '+251900010108', crypt('PatientHP08!', gen_salt('bf')), '{"gender":"female","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient HP-09', 'patient-hp-09@tenadam.local', '+251900010109', crypt('PatientHP09!', gen_salt('bf')), '{"gender":"male","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient HP-10', 'patient-hp-10@tenadam.local', '+251900010110', crypt('PatientHP10!', gen_salt('bf')), '{"gender":"female","preferred_language":"am"}'::jsonb, TRUE)
ON CONFLICT (email) DO UPDATE SET updated_at = NOW();

-- Health Center Patients (10 patients)
INSERT INTO patients (tenant_id, full_name, email, phone, password_hash, profile, active)
VALUES
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient HC-01', 'patient-hc-01@tenadam.local', '+251900020101', crypt('PatientHC01!', gen_salt('bf')), '{"gender":"male","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient HC-02', 'patient-hc-02@tenadam.local', '+251900020102', crypt('PatientHC02!', gen_salt('bf')), '{"gender":"female","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient HC-03', 'patient-hc-03@tenadam.local', '+251900020103', crypt('PatientHC03!', gen_salt('bf')), '{"gender":"male","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient HC-04', 'patient-hc-04@tenadam.local', '+251900020104', crypt('PatientHC04!', gen_salt('bf')), '{"gender":"female","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient HC-05', 'patient-hc-05@tenadam.local', '+251900020105', crypt('PatientHC05!', gen_salt('bf')), '{"gender":"male","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient HC-06', 'patient-hc-06@tenadam.local', '+251900020106', crypt('PatientHC06!', gen_salt('bf')), '{"gender":"female","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient HC-07', 'patient-hc-07@tenadam.local', '+251900020107', crypt('PatientHC07!', gen_salt('bf')), '{"gender":"male","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient HC-08', 'patient-hc-08@tenadam.local', '+251900020108', crypt('PatientHC08!', gen_salt('bf')), '{"gender":"female","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient HC-09', 'patient-hc-09@tenadam.local', '+251900020109', crypt('PatientHC09!', gen_salt('bf')), '{"gender":"male","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient HC-10', 'patient-hc-10@tenadam.local', '+251900020110', crypt('PatientHC10!', gen_salt('bf')), '{"gender":"female","preferred_language":"am"}'::jsonb, TRUE)
ON CONFLICT (email) DO UPDATE SET updated_at = NOW();

-- Primary Hospital Patients (10 patients)
INSERT INTO patients (tenant_id, full_name, email, phone, password_hash, profile, active)
VALUES
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient PH-01', 'patient-ph-01@tenadam.local', '+251900030101', crypt('PatientPH01!', gen_salt('bf')), '{"gender":"male","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient PH-02', 'patient-ph-02@tenadam.local', '+251900030102', crypt('PatientPH02!', gen_salt('bf')), '{"gender":"female","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient PH-03', 'patient-ph-03@tenadam.local', '+251900030103', crypt('PatientPH03!', gen_salt('bf')), '{"gender":"male","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient PH-04', 'patient-ph-04@tenadam.local', '+251900030104', crypt('PatientPH04!', gen_salt('bf')), '{"gender":"female","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient PH-05', 'patient-ph-05@tenadam.local', '+251900030105', crypt('PatientPH05!', gen_salt('bf')), '{"gender":"male","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient PH-06', 'patient-ph-06@tenadam.local', '+251900030106', crypt('PatientPH06!', gen_salt('bf')), '{"gender":"female","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient PH-07', 'patient-ph-07@tenadam.local', '+251900030107', crypt('PatientPH07!', gen_salt('bf')), '{"gender":"male","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient PH-08', 'patient-ph-08@tenadam.local', '+251900030108', crypt('PatientPH08!', gen_salt('bf')), '{"gender":"female","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient PH-09', 'patient-ph-09@tenadam.local', '+251900030109', crypt('PatientPH09!', gen_salt('bf')), '{"gender":"male","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient PH-10', 'patient-ph-10@tenadam.local', '+251900030110', crypt('PatientPH10!', gen_salt('bf')), '{"gender":"female","preferred_language":"am"}'::jsonb, TRUE)
ON CONFLICT (email) DO UPDATE SET updated_at = NOW();

-- General Specialized Hospital Patients (10 patients)
INSERT INTO patients (tenant_id, full_name, email, phone, password_hash, profile, active)
VALUES
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient GS-01', 'patient-gs-01@tenadam.local', '+251900040101', crypt('PatientGS01!', gen_salt('bf')), '{"gender":"male","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient GS-02', 'patient-gs-02@tenadam.local', '+251900040102', crypt('PatientGS02!', gen_salt('bf')), '{"gender":"female","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient GS-03', 'patient-gs-03@tenadam.local', '+251900040103', crypt('PatientGS03!', gen_salt('bf')), '{"gender":"male","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient GS-04', 'patient-gs-04@tenadam.local', '+251900040104', crypt('PatientGS04!', gen_salt('bf')), '{"gender":"female","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient GS-05', 'patient-gs-05@tenadam.local', '+251900040105', crypt('PatientGS05!', gen_salt('bf')), '{"gender":"male","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient GS-06', 'patient-gs-06@tenadam.local', '+251900040106', crypt('PatientGS06!', gen_salt('bf')), '{"gender":"female","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient GS-07', 'patient-gs-07@tenadam.local', '+251900040107', crypt('PatientGS07!', gen_salt('bf')), '{"gender":"male","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient GS-08', 'patient-gs-08@tenadam.local', '+251900040108', crypt('PatientGS08!', gen_salt('bf')), '{"gender":"female","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient GS-09', 'patient-gs-09@tenadam.local', '+251900040109', crypt('PatientGS09!', gen_salt('bf')), '{"gender":"male","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient GS-10', 'patient-gs-10@tenadam.local', '+251900040110', crypt('PatientGS10!', gen_salt('bf')), '{"gender":"female","preferred_language":"am"}'::jsonb, TRUE)
ON CONFLICT (email) DO UPDATE SET updated_at = NOW();

-- National Health System Patients (10 patients)
INSERT INTO patients (tenant_id, full_name, email, phone, password_hash, profile, active)
VALUES
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient NH-01', 'patient-nh-01@tenadam.local', '+251900050101', crypt('PatientNH01!', gen_salt('bf')), '{"gender":"male","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient NH-02', 'patient-nh-02@tenadam.local', '+251900050102', crypt('PatientNH02!', gen_salt('bf')), '{"gender":"female","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient NH-03', 'patient-nh-03@tenadam.local', '+251900050103', crypt('PatientNH03!', gen_salt('bf')), '{"gender":"male","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient NH-04', 'patient-nh-04@tenadam.local', '+251900050104', crypt('PatientNH04!', gen_salt('bf')), '{"gender":"female","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient NH-05', 'patient-nh-05@tenadam.local', '+251900050105', crypt('PatientNH05!', gen_salt('bf')), '{"gender":"male","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient NH-06', 'patient-nh-06@tenadam.local', '+251900050106', crypt('PatientNH06!', gen_salt('bf')), '{"gender":"female","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient NH-07', 'patient-nh-07@tenadam.local', '+251900050107', crypt('PatientNH07!', gen_salt('bf')), '{"gender":"male","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient NH-08', 'patient-nh-08@tenadam.local', '+251900050108', crypt('PatientNH08!', gen_salt('bf')), '{"gender":"female","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient NH-09', 'patient-nh-09@tenadam.local', '+251900050109', crypt('PatientNH09!', gen_salt('bf')), '{"gender":"male","preferred_language":"am"}'::jsonb, TRUE),
  ((SELECT id FROM tenants WHERE slug = 'default'), 'Patient NH-10', 'patient-nh-10@tenadam.local', '+251900050110', crypt('PatientNH10!', gen_salt('bf')), '{"gender":"female","preferred_language":"am"}'::jsonb, TRUE)
ON CONFLICT (email) DO UPDATE SET updated_at = NOW();

COMMIT;
