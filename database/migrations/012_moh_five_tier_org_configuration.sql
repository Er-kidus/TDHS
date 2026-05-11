-- 012_moh_five_tier_org_configuration.sql
-- Align organizational tiers with Ethiopian MoH five-tier structure.

INSERT INTO organization_tier_requirements (tier, description, min_staff, default_services)
VALUES
    (
        'health-post',
        'Tier 1 PHCU level focused on community prevention and basic care.',
        '{"community-health-worker":2,"nurse":1,"midwife":1,"support":1}'::jsonb,
        '["ANC/PNC Follow-up","Immunization","Family Planning","Basic Illness Management","Referral Coordination","Billing Intake","Claims Preparation"]'::jsonb
    ),
    (
        'health-center',
        'Tier 2 PHCU hub with outpatient, diagnostics, pharmacy, and referral management.',
        '{"admin":1,"finance":1,"doctor":1,"health-officer":2,"nurse":4,"midwife":2,"lab":2,"pharmacist":1,"reception":2}'::jsonb,
        '["General Consultation","Laboratory","Pharmacy","Emergency Stabilization","Referral Management","Billing","Claims Submission"]'::jsonb
    ),
    (
        'primary-hospital',
        'Tier 3 hospital with inpatient, surgery, and expanded diagnostics.',
        '{"admin":2,"finance":2,"doctor":4,"surgeon":2,"obgyn":1,"nurse":10,"icu-nurse":2,"lab":3,"radiology":2,"pharmacist":2,"reception":3}'::jsonb,
        '["Inpatient Care","Surgery","Emergency Care","Laboratory","Imaging","Pharmacy","Referral Escalation","Billing","Claims Management"]'::jsonb
    ),
    (
        'general-specialized-hospital',
        'Tier 4 general and specialized tertiary care with advanced clinical workflows.',
        '{"admin":3,"finance":3,"consultant":8,"specialist":12,"resident":10,"nurse":25,"icu-nurse":8,"lab":6,"radiology":5,"pharmacist":4,"reception":5,"it":3}'::jsonb,
        '["Advanced Inpatient and Outpatient","Specialized Clinics","Critical Care","Advanced Diagnostics","Complex Surgery","Clinical Decision Support","Billing","Multi-Payer Claims"]'::jsonb
    ),
    (
        'national-health-system',
        'Tier 5 national oversight and interoperability governance layer.',
        '{"system-admin":3,"health-informatics":6,"policy":4,"compliance":4,"data-analyst":6}'::jsonb,
        '["National Interoperability","Population Reporting","Surveillance","Policy Oversight","National Claims Aggregation"]'::jsonb
    )
ON CONFLICT (tier) DO UPDATE SET
    description = EXCLUDED.description,
    min_staff = EXCLUDED.min_staff,
    default_services = EXCLUDED.default_services,
    updated_at = NOW();

UPDATE organization_configurations
SET tier = CASE tier
    WHEN 'basic' THEN 'health-center'
    WHEN 'standard' THEN 'primary-hospital'
    WHEN 'enterprise' THEN 'general-specialized-hospital'
    ELSE tier
END,
updated_at = NOW();

ALTER TABLE organization_configurations
ALTER COLUMN tier SET DEFAULT 'health-center';

DELETE FROM organization_tier_requirements
WHERE tier IN ('basic', 'standard', 'enterprise');
