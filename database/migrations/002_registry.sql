-- 002_registry.sql
-- Registry schema: patients (FHIR-inspired)

CREATE TABLE IF NOT EXISTS patients (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id     UUID REFERENCES tenants(id) ON DELETE SET NULL,

    -- Step 1 (basic registration)
    full_name     VARCHAR(255) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    phone         VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    -- FHIR-inspired profile payload (Step 2 modal fields are stored here)
    profile       JSONB NOT NULL DEFAULT '{}'::jsonb,

    active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_tenant_id ON patients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
