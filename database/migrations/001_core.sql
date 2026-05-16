-- 001_core.sql
-- Core schema: tenants, organizations, roles, users (org staff)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS tenants (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Single-tenant default for local/dev
INSERT INTO tenants (name, slug)
VALUES ('Default Tenant', 'default')
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS organizations (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id   UUID REFERENCES tenants(id) ON DELETE SET NULL,
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO organizations (tenant_id, name, slug)
VALUES ((SELECT id FROM tenants WHERE slug = 'default'), 'Default Organization', 'default-org')
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS roles (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(500),
    active      BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO roles (name)
VALUES ('superadmin'), ('admin'), ('doctor'), ('nurse'), ('staff')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS users (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id        UUID REFERENCES tenants(id) ON DELETE SET NULL,
    organization_id  UUID REFERENCES organizations(id) ON DELETE SET NULL,
    full_name        VARCHAR(255) NOT NULL,
    email            VARCHAR(255) UNIQUE NOT NULL,
    password_hash    VARCHAR(255) NOT NULL,
    active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id  UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Bootstrap local super-admin and org-admin users for portal access
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'superadmin@tenadam.local') THEN
    INSERT INTO users (tenant_id, organization_id, full_name, email, password_hash)
    VALUES (
      (SELECT id FROM tenants WHERE slug = 'default'),
      (SELECT id FROM organizations WHERE slug = 'default-org'),
      'System Super Admin',
      'superadmin@tenadam.local',
      crypt('SuperAdmin123!', gen_salt('bf'))
    );

    INSERT INTO user_roles (user_id, role_id)
    VALUES (
      (SELECT id FROM users WHERE email = 'superadmin@tenadam.local'),
      (SELECT id FROM roles WHERE name = 'superadmin')
    )
    ON CONFLICT DO NOTHING;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@tenadam.local') THEN
    INSERT INTO users (tenant_id, organization_id, full_name, email, password_hash)
    VALUES (
      (SELECT id FROM tenants WHERE slug = 'default'),
      (SELECT id FROM organizations WHERE slug = 'default-org'),
      'System Admin',
      'admin@tenadam.local',
      crypt('Admin123!', gen_salt('bf'))
    );

    INSERT INTO user_roles (user_id, role_id)
    VALUES (
      (SELECT id FROM users WHERE email = 'admin@tenadam.local'),
      (SELECT id FROM roles WHERE name = 'admin')
    )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
