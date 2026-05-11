CREATE TABLE IF NOT EXISTS service_management_configurations (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  tier VARCHAR(64) NOT NULL,
  installed_services JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT service_management_configurations_tier_check CHECK (
    tier IN (
      'health-post',
      'health-center',
      'primary-hospital',
      'general-specialized-hospital',
      'national-health-system'
    )
  )
);


CREATE INDEX IF NOT EXISTS idx_service_management_tier
  ON service_management_configurations(tier);

CREATE INDEX IF NOT EXISTS idx_service_management_installed_services
  ON service_management_configurations USING GIN (installed_services);
