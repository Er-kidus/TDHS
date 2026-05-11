-- 008_org_applications_and_staff_templates.sql
-- Persist organization applications, their configured staff templates, and the staff template catalog.

CREATE TABLE IF NOT EXISTS org_applications (
    id TEXT PRIMARY KEY,
    organization_name TEXT NOT NULL,
    organization_slug TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    license_number TEXT NOT NULL,
    location_address TEXT NOT NULL,
    location_latitude DOUBLE PRECISION NOT NULL DEFAULT 0,
    location_longitude DOUBLE PRECISION NOT NULL DEFAULT 0,
    requested_services JSONB NOT NULL DEFAULT '[]'::jsonb,
    configured_services JSONB NOT NULL DEFAULT '[]'::jsonb,
    selected_staff_templates JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending',
    approved_by TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_applications_status ON org_applications(status);
CREATE INDEX IF NOT EXISTS idx_org_applications_created_at ON org_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_org_applications_slug ON org_applications(organization_slug);

CREATE TABLE IF NOT EXISTS staff_role_templates (
    template_key TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    role_group TEXT NOT NULL,
    category TEXT NOT NULL,
    api_role TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_role_templates_group ON staff_role_templates(role_group);
CREATE INDEX IF NOT EXISTS idx_staff_role_templates_category ON staff_role_templates(category);
CREATE INDEX IF NOT EXISTS idx_staff_role_templates_active ON staff_role_templates(active);
