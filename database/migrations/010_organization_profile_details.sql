-- 010_organization_profile_details.sql
-- Add patient-facing organization profile details and backfill from approved applications.

ALTER TABLE organizations
    ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(64),
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS services JSONB NOT NULL DEFAULT '[]'::jsonb;

WITH ranked_applications AS (
    SELECT
        organization_slug,
        organization_name,
        contact_name,
        contact_email,
        contact_phone,
        location_address,
        location_latitude,
        location_longitude,
        CASE
            WHEN configured_services IS NOT NULL AND configured_services <> '[]'::jsonb THEN configured_services
            ELSE COALESCE(requested_services, '[]'::jsonb)
        END AS resolved_services,
        ROW_NUMBER() OVER (
            PARTITION BY lower(organization_slug)
            ORDER BY
                CASE status
                    WHEN 'verified' THEN 3
                    WHEN 'approved' THEN 2
                    ELSE 1
                END DESC,
                updated_at DESC,
                created_at DESC
        ) AS rn
    FROM org_applications
)
UPDATE organizations org
SET
    name = COALESCE(NULLIF(app.organization_name, ''), org.name),
    contact_name = COALESCE(NULLIF(app.contact_name, ''), org.contact_name),
    contact_email = COALESCE(NULLIF(app.contact_email, ''), org.contact_email),
    contact_phone = COALESCE(NULLIF(app.contact_phone, ''), org.contact_phone),
    address = COALESCE(NULLIF(app.location_address, ''), org.address),
    latitude = COALESCE(NULLIF(app.location_latitude, 0), org.latitude),
    longitude = COALESCE(NULLIF(app.location_longitude, 0), org.longitude),
    services = COALESCE(app.resolved_services, org.services, '[]'::jsonb),
    updated_at = NOW()
FROM ranked_applications app
WHERE app.rn = 1
  AND lower(org.slug) = lower(app.organization_slug);

UPDATE organizations
SET
    address = COALESCE(NULLIF(address, ''), name || ' (address pending update)'),
    services = COALESCE(services, '[]'::jsonb),
    updated_at = NOW();
