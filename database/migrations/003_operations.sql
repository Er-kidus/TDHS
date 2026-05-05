-- 003_operations.sql
-- Operations schema: appointments

CREATE TABLE IF NOT EXISTS appointments (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id     UUID REFERENCES tenants(id) ON DELETE SET NULL,

    patient_id    UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    created_by    UUID REFERENCES users(id) ON DELETE SET NULL,

    scheduled_at  TIMESTAMPTZ NOT NULL,
    status        VARCHAR(50) NOT NULL DEFAULT 'booked',
    reason        TEXT,
    notes         TEXT,

    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON appointments(scheduled_at);
