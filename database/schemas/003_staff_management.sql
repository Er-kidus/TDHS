-- Staff Management Schema: Roles, Templates, and Staff Assignments
-- Comprehensive healthcare roles and staff management system

CREATE TABLE IF NOT EXISTS roles (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(500),
    active      BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff_role_templates (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_key    VARCHAR(100) UNIQUE NOT NULL,
    title       VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    role_group  VARCHAR(100),
    category    VARCHAR(100),
    api_role    VARCHAR(100),
    active      BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_staff_template_requests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    staff_template_key VARCHAR(100) NOT NULL,
    status          VARCHAR(50) DEFAULT 'pending',
    approval_notes  TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, staff_template_key)
);

CREATE TABLE IF NOT EXISTS staff_template_tier_access (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_template_key  VARCHAR(100) NOT NULL,
    organization_tier   VARCHAR(100) NOT NULL,
    min_staff_required  INT DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(staff_template_key, organization_tier)
);

CREATE TABLE IF NOT EXISTS organization_configurations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID UNIQUE NOT NULL,
    tier            VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS org_staff_profiles (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL,
    organization_id     UUID NOT NULL,
    staff_template_key  VARCHAR(100) NOT NULL,
    role                VARCHAR(100) NOT NULL,
    professional_title  VARCHAR(255),
    license_number      VARCHAR(100),
    active              BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

CREATE TABLE IF NOT EXISTS staff_audit_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID,
    organization_id UUID NOT NULL,
    action          VARCHAR(100) NOT NULL,
    staff_template_key VARCHAR(100),
    details         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compliance_audit_log (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id     UUID NOT NULL,
    organization_name   VARCHAR(255),
    tier                VARCHAR(100),
    status              VARCHAR(50),
    details             TEXT,
    checked_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_active ON roles(active);
CREATE INDEX IF NOT EXISTS idx_staff_role_templates_key ON staff_role_templates(template_key);
CREATE INDEX IF NOT EXISTS idx_staff_role_templates_active ON staff_role_templates(active);
CREATE INDEX IF NOT EXISTS idx_org_staff_profiles_org_id ON org_staff_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_staff_profiles_user_id ON org_staff_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_org_staff_profiles_role ON org_staff_profiles(role);
CREATE INDEX IF NOT EXISTS idx_staff_audit_log_org_id ON staff_audit_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_log_org_id ON compliance_audit_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_staff_template_requests_org_id ON organization_staff_template_requests(organization_id);
