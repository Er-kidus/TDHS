-- ============================================================
-- 004_clinical_care.sql
-- Pregnancy Care & Chronic Care module tables
-- ============================================================

-- ── Pregnancy Episodes ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patient_pregnancy_care (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id               UUID REFERENCES tenants(id),
    patient_id              UUID NOT NULL,
    organization_id         UUID NOT NULL,
    assigned_provider_id    UUID,              -- org_doctors.id
    lmp                     DATE,              -- Last Menstrual Period
    expected_delivery_date  DATE,
    gestational_age_weeks   INT,
    trimester               INT NOT NULL DEFAULT 1 CHECK (trimester BETWEEN 1 AND 3),
    gravidity               INT DEFAULT 1,
    parity                  INT DEFAULT 0,
    high_risk               BOOLEAN NOT NULL DEFAULT FALSE,
    risk_factors            JSONB NOT NULL DEFAULT '[]',
    existing_conditions     JSONB NOT NULL DEFAULT '[]',
    monitoring_requirements JSONB NOT NULL DEFAULT '{}',
    notes                   TEXT NOT NULL DEFAULT '',
    severity_level          VARCHAR(20) NOT NULL DEFAULT 'green' CHECK (severity_level IN ('green','yellow','red','critical')),
    status                  VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','closed','postpartum')),
    closed_at               TIMESTAMPTZ,
    created_by              UUID,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pregnancy_patient ON patient_pregnancy_care(patient_id);
CREATE INDEX IF NOT EXISTS idx_pregnancy_org     ON patient_pregnancy_care(organization_id);
CREATE INDEX IF NOT EXISTS idx_pregnancy_status  ON patient_pregnancy_care(status);

-- ── Pregnancy Vitals Log ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS pregnancy_vitals (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    episode_id      UUID NOT NULL REFERENCES patient_pregnancy_care(id) ON DELETE CASCADE,
    patient_id      UUID NOT NULL,
    blood_pressure  VARCHAR(20),
    blood_sugar     NUMERIC(6,2),
    weight_kg       NUMERIC(6,2),
    kick_count      INT,
    symptoms        JSONB NOT NULL DEFAULT '[]',
    notes           TEXT,
    severity        VARCHAR(20) NOT NULL DEFAULT 'green' CHECK (severity IN ('green','yellow','red','critical')),
    recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_preg_vitals_episode   ON pregnancy_vitals(episode_id);
CREATE INDEX IF NOT EXISTS idx_preg_vitals_patient   ON pregnancy_vitals(patient_id);
CREATE INDEX IF NOT EXISTS idx_preg_vitals_recorded  ON pregnancy_vitals(recorded_at DESC);

-- ── Chronic Care Enrollments ──────────────────────────────────
CREATE TABLE IF NOT EXISTS patient_chronic_care (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id               UUID REFERENCES tenants(id),
    patient_id              UUID NOT NULL,
    organization_id         UUID NOT NULL,
    assigned_provider_id    UUID,
    condition_name          VARCHAR(255) NOT NULL,
    icd_code                VARCHAR(20),
    care_plan               TEXT NOT NULL DEFAULT '',
    -- Personalized thresholds stored as JSONB
    alert_thresholds        JSONB NOT NULL DEFAULT '{}',
    -- e.g. {"bp_systolic_max": 140, "glucose_fasting_max": 126}
    monitoring_frequency    VARCHAR(50) NOT NULL DEFAULT 'daily',
    severity_level          VARCHAR(20) NOT NULL DEFAULT 'green' CHECK (severity_level IN ('green','yellow','red','critical')),
    risk_score              NUMERIC(4,2) NOT NULL DEFAULT 0,
    last_review_at          TIMESTAMPTZ,
    status                  VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','stable','critical','discharged')),
    created_by              UUID,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chronic_patient ON patient_chronic_care(patient_id);
CREATE INDEX IF NOT EXISTS idx_chronic_org     ON patient_chronic_care(organization_id);
CREATE INDEX IF NOT EXISTS idx_chronic_status  ON patient_chronic_care(status);

-- ── Chronic Vitals Log ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chronic_vitals (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id   UUID NOT NULL REFERENCES patient_chronic_care(id) ON DELETE CASCADE,
    patient_id      UUID NOT NULL,
    blood_pressure  VARCHAR(20),
    blood_sugar     NUMERIC(6,2),
    weight_kg       NUMERIC(6,2),
    oxygen_sat      NUMERIC(5,2),
    heart_rate      INT,
    symptoms        JSONB NOT NULL DEFAULT '[]',
    notes           TEXT,
    severity        VARCHAR(20) NOT NULL DEFAULT 'green' CHECK (severity IN ('green','yellow','red','critical')),
    recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chronic_vitals_enrollment ON chronic_vitals(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_chronic_vitals_patient    ON chronic_vitals(patient_id);
CREATE INDEX IF NOT EXISTS idx_chronic_vitals_recorded   ON chronic_vitals(recorded_at DESC);

-- ── Care Plan Tasks ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS care_plan_tasks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id   UUID,          -- NULL for pregnancy tasks
    episode_id      UUID,          -- NULL for chronic tasks
    patient_id      UUID NOT NULL,
    care_type       VARCHAR(20) NOT NULL CHECK (care_type IN ('chronic','pregnancy')),
    task_type       VARCHAR(50) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    due_date        DATE,
    completed       BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_care_tasks_patient ON care_plan_tasks(patient_id);
