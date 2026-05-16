-- ============================================================
-- 007_telemedicine_ai_profiles.sql
-- Telemedicine AI Matching & Enhanced Doctor Profile fields
-- ============================================================

-- ── Enhanced Telemedicine fields on org_staff_profiles ────────
ALTER TABLE org_staff_profiles
  ADD COLUMN IF NOT EXISTS telemedicine_enabled          BOOLEAN  NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS telemedicine_specialty        TEXT,
  ADD COLUMN IF NOT EXISTS telemedicine_rate             NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS telemedicine_currency         VARCHAR(10)   NOT NULL DEFAULT 'ETB',
  ADD COLUMN IF NOT EXISTS telemedicine_modes            JSONB         NOT NULL DEFAULT '["video","voice","chat"]',
  -- New AI-matching fields
  ADD COLUMN IF NOT EXISTS sub_specialty                 TEXT,
  ADD COLUMN IF NOT EXISTS years_experience              INTEGER       NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS languages_spoken              JSONB         NOT NULL DEFAULT '["en"]',
  ADD COLUMN IF NOT EXISTS online_status                 VARCHAR(20)   NOT NULL DEFAULT 'offline'
                                                         CHECK (online_status IN ('online','busy','offline')),
  ADD COLUMN IF NOT EXISTS session_capacity              INTEGER       NOT NULL DEFAULT 1 CHECK (session_capacity BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS current_sessions              INTEGER       NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS availability_schedule         JSONB         NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS certifications                JSONB         NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS areas_of_expertise            JSONB         NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS emergency_support             BOOLEAN       NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS consultation_types            JSONB         NOT NULL DEFAULT '["video","voice","chat"]',
  ADD COLUMN IF NOT EXISTS ai_compatibility_score        FLOAT         NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS profile_completeness          INTEGER       NOT NULL DEFAULT 0 CHECK (profile_completeness BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS last_online_at                TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS profile_updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW();

-- Index for fast AI-matching queries
CREATE INDEX IF NOT EXISTS idx_staff_online_status
  ON org_staff_profiles(online_status)
  WHERE online_status = 'online';

CREATE INDEX IF NOT EXISTS idx_staff_telemedicine_enabled
  ON org_staff_profiles(telemedicine_enabled)
  WHERE telemedicine_enabled = TRUE;

CREATE INDEX IF NOT EXISTS idx_staff_specialty_tele
  ON org_staff_profiles(telemedicine_specialty)
  WHERE telemedicine_specialty IS NOT NULL;

-- ── AI Triage Image Analysis results store ───────────────────
CREATE TABLE IF NOT EXISTS telemedicine_image_analyses (
  id                  UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id          UUID,        -- link to patient_telemedicine_sessions if exists
  patient_id          UUID,
  image_hash          TEXT,        -- SHA-256 of image data for dedup
  detected_conditions JSONB        NOT NULL DEFAULT '[]',
  severity_indicators JSONB        NOT NULL DEFAULT '[]',
  recommended_specialty TEXT,
  confidence          FLOAT        NOT NULL DEFAULT 0.0,
  raw_ai_response     TEXT,
  disclaimer          TEXT         NOT NULL DEFAULT 'This AI analysis is not a medical diagnosis. Always consult a qualified healthcare professional.',
  analyzed_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tele_image_patient ON telemedicine_image_analyses(patient_id);
CREATE INDEX IF NOT EXISTS idx_tele_image_session ON telemedicine_image_analyses(session_id);

-- ── AI Triage Session Scores (for queue ordering) ────────────
ALTER TABLE patient_telemedicine_sessions
  ADD COLUMN IF NOT EXISTS ai_urgency_level  VARCHAR(20) DEFAULT 'low'
                                             CHECK (ai_urgency_level IN ('low','moderate','urgent','emergent')),
  ADD COLUMN IF NOT EXISTS ai_triage_score   INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_specialty      TEXT,
  ADD COLUMN IF NOT EXISTS ai_reasons        JSONB   DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS symptoms_summary  TEXT,
  ADD COLUMN IF NOT EXISTS image_analysis_id UUID    REFERENCES telemedicine_image_analyses(id);

CREATE INDEX IF NOT EXISTS idx_tele_session_urgency
  ON patient_telemedicine_sessions(ai_urgency_level)
  WHERE status IN ('pending','accepted');
