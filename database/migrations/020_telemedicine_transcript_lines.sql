-- 020_telemedicine_transcript_lines.sql
-- Persist speaker-aware transcript lines per telemedicine session.

CREATE TABLE IF NOT EXISTS telemedicine_transcript_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    session_id UUID NOT NULL REFERENCES patient_telemedicine_sessions(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    speaker VARCHAR(255) NOT NULL,
    source VARCHAR(32) NOT NULL DEFAULT 'manual',
    content TEXT NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telemedicine_transcript_lines_session_time
    ON telemedicine_transcript_lines(session_id, occurred_at, created_at);
