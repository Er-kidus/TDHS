-- 011_org_tier_staff_configuration.sql
-- Add tier-based organization configuration and staff profile metadata.

CREATE TABLE IF NOT EXISTS organization_tier_requirements (
    tier TEXT PRIMARY KEY,
    description TEXT NOT NULL DEFAULT '',
    min_staff JSONB NOT NULL DEFAULT '{}'::jsonb,
    default_services JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO organization_tier_requirements (tier, description, min_staff, default_services)
VALUES
    (
        'basic',
        'Basic outpatient operation with minimum staffing.',
        '{"admin":1,"reception":1,"nurse":1,"doctor":1}'::jsonb,
        '["General Consultation","Basic Triage"]'::jsonb
    ),
    (
        'standard',
        'General clinic with diagnostics and extended nursing support.',
        '{"admin":1,"reception":2,"nurse":3,"doctor":2,"lab":1}'::jsonb,
        '["General Consultation","Laboratory","Pharmacy","Basic Triage"]'::jsonb
    ),
    (
        'enterprise',
        'Hospital-level operation with specialist and queue capacity.',
        '{"admin":2,"reception":4,"nurse":8,"doctor":6,"lab":2,"pharmacist":2}'::jsonb,
        '["General Consultation","Laboratory","Pharmacy","Telemedicine","Emergency Triage"]'::jsonb
    )
ON CONFLICT (tier) DO NOTHING;

CREATE TABLE IF NOT EXISTS organization_configurations (
    organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
    tier TEXT NOT NULL DEFAULT 'basic' REFERENCES organization_tier_requirements(tier),
    enabled_services JSONB NOT NULL DEFAULT '[]'::jsonb,
    min_staff JSONB NOT NULL DEFAULT '{}'::jsonb,
    queue_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS org_staff_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    role TEXT NOT NULL,
    staff_template_key TEXT,
    professional_title TEXT,
    license_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_staff_profiles_org_id ON org_staff_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_staff_profiles_role ON org_staff_profiles(role);
CREATE INDEX IF NOT EXISTS idx_org_staff_profiles_license ON org_staff_profiles(license_number);

INSERT INTO organization_configurations (organization_id, tier, enabled_services, min_staff)
SELECT
    o.id,
    'basic',
    COALESCE(o.services, '["General Consultation"]'::jsonb),
    '{"admin":1,"reception":1,"nurse":1,"doctor":1}'::jsonb
FROM organizations o
ON CONFLICT (organization_id) DO NOTHING;

WITH user_primary_roles AS (
    SELECT
        u.id AS user_id,
        u.organization_id,
        COALESCE(MIN(r.name), 'staff') AS role_name
    FROM users u
    LEFT JOIN user_roles ur ON ur.user_id = u.id
    LEFT JOIN roles r ON r.id = ur.role_id
    WHERE u.organization_id IS NOT NULL
    GROUP BY u.id, u.organization_id
)
INSERT INTO org_staff_profiles (user_id, organization_id, role)
SELECT user_id, organization_id, role_name
FROM user_primary_roles
ON CONFLICT (user_id) DO NOTHING;
