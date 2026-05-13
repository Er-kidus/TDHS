-- 024_doctor_workflow_tables.sql
-- Doctor workflow tables: lab orders, prescriptions, follow-ups, visit summaries

CREATE TABLE IF NOT EXISTS lab_orders (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id               UUID REFERENCES tenants(id) ON DELETE SET NULL,
    appointment_id          UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    
    patient_id              VARCHAR(255) NOT NULL,
    patient_name            VARCHAR(255) NOT NULL,
    patient_dob             VARCHAR(50),
    
    order_id                VARCHAR(50) NOT NULL UNIQUE,
    service_area            VARCHAR(50) NOT NULL DEFAULT 'lab' CHECK (service_area IN ('lab', 'imaging')),
    test_name               VARCHAR(255) NOT NULL,
    indication              TEXT,
    priority                VARCHAR(50) NOT NULL DEFAULT 'routine' CHECK (priority IN ('routine', 'urgent', 'asap')),
    
    status                  VARCHAR(50) NOT NULL DEFAULT 'pending_collection' 
                           CHECK (status IN ('pending_collection', 'received_in_lab', 'pending_review', 'finalized', 'critical')),
    verification_status     VARCHAR(50) NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified')),
    sample_label            VARCHAR(255),
    confirmed_at            TIMESTAMPTZ,
    
    result_value            VARCHAR(255),
    result_notes            TEXT,
    result_entered_at       TIMESTAMPTZ,
    result_patient_id_entry VARCHAR(255),
    
    critical_alert          BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_by_doctor  BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_at         TIMESTAMPTZ,
    
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lab_orders_appointment_id ON lab_orders(appointment_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_patient_id ON lab_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_order_id ON lab_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_status ON lab_orders(status);
CREATE INDEX IF NOT EXISTS idx_lab_orders_service_area ON lab_orders(service_area);
CREATE INDEX IF NOT EXISTS idx_lab_orders_created_at ON lab_orders(created_at DESC);

CREATE TABLE IF NOT EXISTS doctor_prescriptions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID REFERENCES tenants(id) ON DELETE SET NULL,
    appointment_id      UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    
    patient_id          VARCHAR(255) NOT NULL,
    
    medication          VARCHAR(255) NOT NULL,
    dosage              VARCHAR(120) NOT NULL,
    frequency           VARCHAR(120) NOT NULL,
    duration_days       INT NOT NULL DEFAULT 7,
    instructions        TEXT,
    
    status              VARCHAR(50) NOT NULL DEFAULT 'pending_dispense' 
                       CHECK (status IN ('draft', 'pending_dispense', 'dispensed')),
    
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctor_prescriptions_appointment_id ON doctor_prescriptions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_doctor_prescriptions_patient_id ON doctor_prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_doctor_prescriptions_status ON doctor_prescriptions(status);

CREATE TABLE IF NOT EXISTS doctor_followups (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id               UUID REFERENCES tenants(id) ON DELETE SET NULL,
    
    source_appointment_id   UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    followup_appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    
    patient_id              VARCHAR(255) NOT NULL,
    scheduled_at            TIMESTAMPTZ NOT NULL,
    reason                  TEXT NOT NULL,
    notes                   TEXT,
    
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctor_followups_source_appointment ON doctor_followups(source_appointment_id);
CREATE INDEX IF NOT EXISTS idx_doctor_followups_followup_appointment ON doctor_followups(followup_appointment_id);
CREATE INDEX IF NOT EXISTS idx_doctor_followups_patient_id ON doctor_followups(patient_id);

CREATE TABLE IF NOT EXISTS doctor_visit_summaries (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID REFERENCES tenants(id) ON DELETE SET NULL,
    appointment_id  UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    
    patient_id      VARCHAR(255) NOT NULL,
    
    summary         TEXT NOT NULL,
    disposition     VARCHAR(255) NOT NULL,
    
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctor_visit_summaries_appointment_id ON doctor_visit_summaries(appointment_id);
CREATE INDEX IF NOT EXISTS idx_doctor_visit_summaries_patient_id ON doctor_visit_summaries(patient_id);
