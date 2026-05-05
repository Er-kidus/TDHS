-- 014_org_configuration_extended_settings.sql
-- Persist full superadmin configuration blocks for each organization.

ALTER TABLE organization_configurations
ADD COLUMN IF NOT EXISTS feature_flags JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS workflow_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS communication JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS billing JSONB NOT NULL DEFAULT '{}'::jsonb;
