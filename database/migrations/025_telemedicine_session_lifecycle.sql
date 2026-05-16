-- 025_telemedicine_session_lifecycle.sql
-- Adds ended_at timestamp and room_name to telemedicine sessions.
-- Adds end/cancel status values to the lifecycle.

ALTER TABLE patient_telemedicine_sessions
  ADD COLUMN IF NOT EXISTS ended_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS room_name  TEXT;

-- Index for fast status lookups used by polling
CREATE INDEX IF NOT EXISTS idx_tele_sessions_status
  ON patient_telemedicine_sessions (status, patient_id);
