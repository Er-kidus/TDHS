-- 004_patient_portal_modules.sql
-- Patient portal supporting modules (doctors, labs, billing, insurance, messaging, documents, telemedicine, pharmacy)

CREATE TABLE IF NOT EXISTS doctors (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id     UUID REFERENCES tenants(id) ON DELETE SET NULL,
    full_name     VARCHAR(255) NOT NULL,
    specialty     VARCHAR(120) NOT NULL,
    location      VARCHAR(255) NOT NULL,
    rating        NUMERIC(3,2) NOT NULL DEFAULT 4.5,
    years_exp     INT NOT NULL DEFAULT 5,
    available     BOOLEAN NOT NULL DEFAULT TRUE,
    available_at  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_prescriptions (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id          UUID REFERENCES tenants(id) ON DELETE SET NULL,
    patient_id         UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    prescribing_doctor VARCHAR(255) NOT NULL,
    medication_name    VARCHAR(255) NOT NULL,
    dosage             VARCHAR(120) NOT NULL,
    frequency          VARCHAR(120) NOT NULL,
    refill_due_date    DATE,
    status             VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_lab_results (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id      UUID REFERENCES tenants(id) ON DELETE SET NULL,
    patient_id     UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    test_name      VARCHAR(255) NOT NULL,
    status         VARCHAR(50) NOT NULL DEFAULT 'pending',
    result_value   VARCHAR(255),
    normal_range   VARCHAR(255),
    abnormal       BOOLEAN NOT NULL DEFAULT FALSE,
    collected_at   TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_invoices (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id      UUID REFERENCES tenants(id) ON DELETE SET NULL,
    patient_id     UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL,
    amount         NUMERIC(12,2) NOT NULL,
    currency       VARCHAR(8) NOT NULL DEFAULT 'USD',
    status         VARCHAR(50) NOT NULL DEFAULT 'unpaid',
    due_date       DATE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_insurance (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id      UUID REFERENCES tenants(id) ON DELETE SET NULL,
    patient_id     UUID NOT NULL UNIQUE REFERENCES patients(id) ON DELETE CASCADE,
    provider       VARCHAR(255) NOT NULL,
    policy_number  VARCHAR(120) NOT NULL,
    coverage       TEXT NOT NULL,
    valid_from     DATE,
    valid_to       DATE,
    claims_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_messages (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id      UUID REFERENCES tenants(id) ON DELETE SET NULL,
    patient_id     UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    sender         VARCHAR(255) NOT NULL,
    channel        VARCHAR(50) NOT NULL DEFAULT 'doctor',
    content        TEXT NOT NULL,
    attachment_url TEXT,
    read           BOOLEAN NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_documents (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id      UUID REFERENCES tenants(id) ON DELETE SET NULL,
    patient_id     UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    name           VARCHAR(255) NOT NULL,
    category       VARCHAR(80) NOT NULL DEFAULT 'report',
    url            TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_telemedicine_sessions (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id         UUID REFERENCES tenants(id) ON DELETE SET NULL,
    patient_id        UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_name       VARCHAR(255) NOT NULL,
    scheduled_at      TIMESTAMPTZ NOT NULL,
    status            VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    connection_status VARCHAR(50) NOT NULL DEFAULT 'stable',
    notes             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pharmacy_medications (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id      UUID REFERENCES tenants(id) ON DELETE SET NULL,
    name           VARCHAR(255) NOT NULL,
    dosage         VARCHAR(120),
    quantity_label VARCHAR(120),
    price          NUMERIC(12,2) NOT NULL,
    currency       VARCHAR(8) NOT NULL DEFAULT 'USD',
    prescription_required BOOLEAN NOT NULL DEFAULT TRUE,
    in_stock       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pharmacies (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id     UUID REFERENCES tenants(id) ON DELETE SET NULL,
    name          VARCHAR(255) NOT NULL,
    location      VARCHAR(255) NOT NULL,
    distance_km   NUMERIC(6,2) NOT NULL DEFAULT 1.0,
    eta_minutes   INT NOT NULL DEFAULT 30,
    open_now      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_pharmacy_orders (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id      UUID REFERENCES tenants(id) ON DELETE SET NULL,
    patient_id     UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    medication_id  UUID REFERENCES pharmacy_medications(id) ON DELETE SET NULL,
    quantity       INT NOT NULL DEFAULT 1,
    total_amount   NUMERIC(12,2) NOT NULL,
    currency       VARCHAR(8) NOT NULL DEFAULT 'USD',
    status         VARCHAR(50) NOT NULL DEFAULT 'pending',
    delivery_mode  VARCHAR(50) NOT NULL DEFAULT 'delivery',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO doctors (tenant_id, full_name, specialty, location, rating, years_exp, available, available_at)
SELECT (SELECT id FROM tenants WHERE slug='default'), 'Dr. Rediet Bekele', 'Internal Medicine', 'Addis Ababa', 4.90, 11, TRUE, NOW() + INTERVAL '1 day'
WHERE NOT EXISTS (SELECT 1 FROM doctors WHERE full_name='Dr. Rediet Bekele');

INSERT INTO doctors (tenant_id, full_name, specialty, location, rating, years_exp, available, available_at)
SELECT (SELECT id FROM tenants WHERE slug='default'), 'Dr. Tadesse Alemu', 'Cardiology', 'Bole', 4.80, 14, TRUE, NOW() + INTERVAL '2 day'
WHERE NOT EXISTS (SELECT 1 FROM doctors WHERE full_name='Dr. Tadesse Alemu');

INSERT INTO pharmacy_medications (tenant_id, name, dosage, quantity_label, price, currency, prescription_required, in_stock)
SELECT (SELECT id FROM tenants WHERE slug='default'), 'Metformin', '500mg', '30 tablets', 8.20, 'USD', TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM pharmacy_medications WHERE name='Metformin' AND dosage='500mg');

INSERT INTO pharmacy_medications (tenant_id, name, dosage, quantity_label, price, currency, prescription_required, in_stock)
SELECT (SELECT id FROM tenants WHERE slug='default'), 'Atorvastatin', '20mg', '30 tablets', 12.10, 'USD', TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM pharmacy_medications WHERE name='Atorvastatin' AND dosage='20mg');

INSERT INTO pharmacies (tenant_id, name, location, distance_km, eta_minutes, open_now)
SELECT (SELECT id FROM tenants WHERE slug='default'), 'Tenadam Central Pharmacy', 'Addis Ababa', 1.40, 20, TRUE
WHERE NOT EXISTS (SELECT 1 FROM pharmacies WHERE name='Tenadam Central Pharmacy');

INSERT INTO pharmacies (tenant_id, name, location, distance_km, eta_minutes, open_now)
SELECT (SELECT id FROM tenants WHERE slug='default'), 'Bole Care Pharmacy', 'Bole', 3.20, 35, TRUE
WHERE NOT EXISTS (SELECT 1 FROM pharmacies WHERE name='Bole Care Pharmacy');
