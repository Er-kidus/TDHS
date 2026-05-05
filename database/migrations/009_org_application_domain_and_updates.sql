-- 009_org_application_domain_and_updates.sql
-- Add domain assignment and organization-side service update request tracking.

ALTER TABLE org_applications
    ADD COLUMN IF NOT EXISTS organization_domain TEXT,
    ADD COLUMN IF NOT EXISTS update_requested_services JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS update_request_notes TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS update_request_status TEXT NOT NULL DEFAULT 'none',
    ADD COLUMN IF NOT EXISTS last_update_request_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS domain_configured_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_org_applications_update_request_status
    ON org_applications(update_request_status);

CREATE INDEX IF NOT EXISTS idx_org_applications_organization_domain
    ON org_applications(organization_domain);
