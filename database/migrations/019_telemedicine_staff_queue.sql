-- 019_telemedicine_staff_queue.sql
-- Add telemedicine profile metadata for org staff and queue metadata for telemedicine sessions.

ALTER TABLE org_staff_profiles
  ADD COLUMN IF NOT EXISTS telemedicine_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS telemedicine_specialty TEXT,
  ADD COLUMN IF NOT EXISTS telemedicine_rate NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS telemedicine_currency VARCHAR(8) NOT NULL DEFAULT 'ETB',
  ADD COLUMN IF NOT EXISTS telemedicine_modes JSONB NOT NULL DEFAULT '["video","voice","chat"]'::jsonb;

-- Enable telemedicine profile defaults for already registered clinicians.
UPDATE org_staff_profiles
SET telemedicine_enabled = TRUE
WHERE LOWER(COALESCE(role, '')) IN ('doctor', 'nurse')
  AND telemedicine_enabled = FALSE;

ALTER TABLE patient_telemedicine_sessions
  ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS preferred_mode VARCHAR(16) NOT NULL DEFAULT 'video',
  ADD COLUMN IF NOT EXISTS requested_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS requested_currency VARCHAR(8) NOT NULL DEFAULT 'ETB';

CREATE INDEX IF NOT EXISTS idx_patient_telemedicine_sessions_status ON patient_telemedicine_sessions(status);
CREATE INDEX IF NOT EXISTS idx_patient_telemedicine_sessions_doctor_id ON patient_telemedicine_sessions(doctor_id);
