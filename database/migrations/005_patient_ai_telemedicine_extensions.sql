-- 005_patient_ai_telemedicine_extensions.sql
-- Extensions for chronic care, pregnancy, recurrent medication tracking, AI consent/learning, and telemedicine artifacts

CREATE TABLE IF NOT EXISTS patient_chronic_care (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    condition_name VARCHAR(255) NOT NULL,
    care_plan TEXT NOT NULL,
    severity_level VARCHAR(50) NOT NULL DEFAULT 'medium',
    risk_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    last_review_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_pregnancy_care (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    trimester INT NOT NULL DEFAULT 1,
    expected_delivery_date DATE,
    high_risk BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT NOT NULL DEFAULT '',
    severity_level VARCHAR(50) NOT NULL DEFAULT 'low',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_recurrent_medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    taken_today BOOLEAN NOT NULL DEFAULT FALSE,
    adherence_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
    appointment_severity VARCHAR(50) NOT NULL DEFAULT 'low',
    medication_alert_severity VARCHAR(50) NOT NULL DEFAULT 'low',
    last_taken_at TIMESTAMPTZ,
    diet_notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_user_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL UNIQUE REFERENCES patients(id) ON DELETE CASCADE,
    allow_learning BOOLEAN NOT NULL DEFAULT FALSE,
    allow_summaries BOOLEAN NOT NULL DEFAULT TRUE,
    allow_analytics BOOLEAN NOT NULL DEFAULT FALSE,
    updated_by VARCHAR(255) NOT NULL DEFAULT 'system',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    model_key VARCHAR(120) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    mode VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'unloaded',
    version VARCHAR(50) NOT NULL DEFAULT 'v1',
    dataset_ref TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_learning_samples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    mode VARCHAR(50) NOT NULL,
    sample_type VARCHAR(80) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    consent_applied BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS org_doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    specialty VARCHAR(120) NOT NULL,
    license_number VARCHAR(120) NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telemedicine_session_artifacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    session_id UUID NOT NULL REFERENCES patient_telemedicine_sessions(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES org_doctors(id) ON DELETE SET NULL,
    recording_url TEXT,
    transcript_url TEXT,
    summary TEXT NOT NULL DEFAULT '',
    final_diagnosis TEXT NOT NULL DEFAULT '',
    symptoms JSONB NOT NULL DEFAULT '[]'::jsonb,
    follow_up_needed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telemedicine_anatomy_annotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    session_id UUID NOT NULL REFERENCES patient_telemedicine_sessions(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES org_doctors(id) ON DELETE SET NULL,
    body_region VARCHAR(120) NOT NULL,
    x_percent NUMERIC(6,2) NOT NULL,
    y_percent NUMERIC(6,2) NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    severity_level VARCHAR(50) NOT NULL DEFAULT 'medium',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO ai_models (tenant_id, model_key, display_name, mode, status, version, dataset_ref)
SELECT (SELECT id FROM tenants WHERE slug='default'), 'symptom-checker', 'Symptom Checker', 'care', 'loaded', 'v1', 'https://www.kaggle.com/datasets/niyarrbarman/symptom2disease'
WHERE NOT EXISTS (SELECT 1 FROM ai_models WHERE model_key='symptom-checker');

INSERT INTO ai_models (tenant_id, model_key, display_name, mode, status, version, dataset_ref)
SELECT (SELECT id FROM tenants WHERE slug='default'), 'telemed-summarizer', 'Telemedicine Summarizer', 'telemedicine', 'loaded', 'v1', 'https://physionet.org/content/mimic-iv-note/'
WHERE NOT EXISTS (SELECT 1 FROM ai_models WHERE model_key='telemed-summarizer');

INSERT INTO ai_models (tenant_id, model_key, display_name, mode, status, version, dataset_ref)
SELECT (SELECT id FROM tenants WHERE slug='default'), 'med-adherence-assistant', 'Medication Adherence Assistant', 'pharmacy', 'loaded', 'v1', 'https://www.kaggle.com/datasets/priyamchoksi/medication-adherence'
WHERE NOT EXISTS (SELECT 1 FROM ai_models WHERE model_key='med-adherence-assistant');

WITH seed_patient AS (
  SELECT id FROM patients ORDER BY created_at ASC LIMIT 1
)
INSERT INTO ai_user_consents (tenant_id, patient_id, allow_learning, allow_summaries, allow_analytics, updated_by)
SELECT (SELECT id FROM tenants WHERE slug='default'), seed_patient.id, TRUE, TRUE, TRUE, 'seed'
FROM seed_patient
WHERE NOT EXISTS (SELECT 1 FROM ai_user_consents c WHERE c.patient_id = seed_patient.id);

WITH seed_patient AS (
  SELECT id FROM patients ORDER BY created_at ASC LIMIT 1
)
INSERT INTO patient_chronic_care (tenant_id, patient_id, condition_name, care_plan, severity_level, risk_score, last_review_at)
SELECT (SELECT id FROM tenants WHERE slug='default'), seed_patient.id, 'Type 2 Diabetes', 'Weekly glucose monitoring and monthly physician review', 'medium', 62.5, NOW() - INTERVAL '7 days'
FROM seed_patient
WHERE NOT EXISTS (SELECT 1 FROM patient_chronic_care cc WHERE cc.patient_id = seed_patient.id AND cc.condition_name = 'Type 2 Diabetes');

WITH seed_patient AS (
  SELECT id FROM patients ORDER BY created_at ASC LIMIT 1
)
INSERT INTO patient_recurrent_medications (tenant_id, patient_id, medication_name, taken_today, adherence_percent, appointment_severity, medication_alert_severity, last_taken_at, diet_notes)
SELECT (SELECT id FROM tenants WHERE slug='default'), seed_patient.id, 'Metformin 500mg', TRUE, 91.3, 'low', 'medium', NOW() - INTERVAL '3 hours', 'Reduced sugar intake, improving meal consistency'
FROM seed_patient
WHERE NOT EXISTS (SELECT 1 FROM patient_recurrent_medications rm WHERE rm.patient_id = seed_patient.id AND rm.medication_name = 'Metformin 500mg');
