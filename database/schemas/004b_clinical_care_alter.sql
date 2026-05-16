-- Add missing columns to patient_pregnancy_care
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_pregnancy_care' AND column_name='organization_id') THEN
    ALTER TABLE patient_pregnancy_care ADD COLUMN organization_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_pregnancy_care' AND column_name='status') THEN
    ALTER TABLE patient_pregnancy_care ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_pregnancy_care' AND column_name='lmp') THEN
    ALTER TABLE patient_pregnancy_care ADD COLUMN lmp DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_pregnancy_care' AND column_name='gestational_age_weeks') THEN
    ALTER TABLE patient_pregnancy_care ADD COLUMN gestational_age_weeks INT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_pregnancy_care' AND column_name='gravidity') THEN
    ALTER TABLE patient_pregnancy_care ADD COLUMN gravidity INT DEFAULT 1;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_pregnancy_care' AND column_name='parity') THEN
    ALTER TABLE patient_pregnancy_care ADD COLUMN parity INT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_pregnancy_care' AND column_name='risk_factors') THEN
    ALTER TABLE patient_pregnancy_care ADD COLUMN risk_factors JSONB NOT NULL DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_pregnancy_care' AND column_name='assigned_provider_id') THEN
    ALTER TABLE patient_pregnancy_care ADD COLUMN assigned_provider_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_pregnancy_care' AND column_name='existing_conditions') THEN
    ALTER TABLE patient_pregnancy_care ADD COLUMN existing_conditions JSONB NOT NULL DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_pregnancy_care' AND column_name='monitoring_requirements') THEN
    ALTER TABLE patient_pregnancy_care ADD COLUMN monitoring_requirements JSONB NOT NULL DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_pregnancy_care' AND column_name='created_by') THEN
    ALTER TABLE patient_pregnancy_care ADD COLUMN created_by UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_pregnancy_care' AND column_name='closed_at') THEN
    ALTER TABLE patient_pregnancy_care ADD COLUMN closed_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add missing columns to patient_chronic_care
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_chronic_care' AND column_name='organization_id') THEN
    ALTER TABLE patient_chronic_care ADD COLUMN organization_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_chronic_care' AND column_name='status') THEN
    ALTER TABLE patient_chronic_care ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_chronic_care' AND column_name='icd_code') THEN
    ALTER TABLE patient_chronic_care ADD COLUMN icd_code VARCHAR(20);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_chronic_care' AND column_name='alert_thresholds') THEN
    ALTER TABLE patient_chronic_care ADD COLUMN alert_thresholds JSONB NOT NULL DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_chronic_care' AND column_name='monitoring_frequency') THEN
    ALTER TABLE patient_chronic_care ADD COLUMN monitoring_frequency VARCHAR(50) NOT NULL DEFAULT 'daily';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_chronic_care' AND column_name='assigned_provider_id') THEN
    ALTER TABLE patient_chronic_care ADD COLUMN assigned_provider_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_chronic_care' AND column_name='created_by') THEN
    ALTER TABLE patient_chronic_care ADD COLUMN created_by UUID;
  END IF;
END $$;

-- Indices (safe to repeat)
CREATE INDEX IF NOT EXISTS idx_pregnancy_patient ON patient_pregnancy_care(patient_id);
CREATE INDEX IF NOT EXISTS idx_pregnancy_org     ON patient_pregnancy_care(organization_id);
CREATE INDEX IF NOT EXISTS idx_pregnancy_status  ON patient_pregnancy_care(status);
CREATE INDEX IF NOT EXISTS idx_chronic_patient   ON patient_chronic_care(patient_id);
CREATE INDEX IF NOT EXISTS idx_chronic_org       ON patient_chronic_care(organization_id);
CREATE INDEX IF NOT EXISTS idx_chronic_status    ON patient_chronic_care(status);
