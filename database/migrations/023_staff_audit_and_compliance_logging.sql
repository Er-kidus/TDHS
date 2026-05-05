-- 023_staff_audit_and_compliance_logging.sql
-- Audit logging and compliance tracking tables

-- Staff audit log for all staff template changes
CREATE TABLE IF NOT EXISTS staff_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL CHECK (action IN ('approved', 'rejected', 'revoked', 'requested', 'auto_revoked')),
    staff_template_key VARCHAR(255) REFERENCES staff_role_templates(template_key),
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_audit_org_id ON staff_audit_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_audit_user_id ON staff_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_audit_created_at ON staff_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_staff_audit_action ON staff_audit_log(action);

-- Compliance audit log for nightly checks
CREATE TABLE IF NOT EXISTS compliance_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    organization_name VARCHAR(255),
    tier VARCHAR(50),
    status VARCHAR(50) NOT NULL CHECK (status IN ('COMPLIANT', 'AT_RISK', 'NON_COMPLIANT')),
    details JSONB,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_org_id ON compliance_audit_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_status ON compliance_audit_log(status);
CREATE INDEX IF NOT EXISTS idx_compliance_checked_at ON compliance_audit_log(checked_at DESC);

-- Staff credibility tracking
CREATE TABLE IF NOT EXISTS organization_staff_credibility (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
    credibility_score INT DEFAULT 100 CHECK (credibility_score BETWEEN 0 AND 100),
    violations_count INT DEFAULT 0,
    last_violation_at TIMESTAMPTZ,
    last_audit_at TIMESTAMPTZ,
    notes TEXT,
    flagged BOOLEAN DEFAULT FALSE,
    flag_reason VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credibility_org_id ON organization_staff_credibility(organization_id);
CREATE INDEX IF NOT EXISTS idx_credibility_flagged ON organization_staff_credibility(flagged);
CREATE INDEX IF NOT EXISTS idx_credibility_score ON organization_staff_credibility(credibility_score);

-- Staff credential verification tracking
CREATE TABLE IF NOT EXISTS staff_credential_verification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_staff_profile_id UUID NOT NULL,
    staff_template_key VARCHAR(255) NOT NULL REFERENCES staff_role_templates(template_key),
    verification_type VARCHAR(50) NOT NULL CHECK (verification_type IN ('license', 'certification', 'registration', 'education')),
    verification_number VARCHAR(255),
    issuing_authority VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'expired', 'revoked')),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credential_staff_profile_id ON staff_credential_verification(org_staff_profile_id);
CREATE INDEX IF NOT EXISTS idx_credential_status ON staff_credential_verification(status);
CREATE INDEX IF NOT EXISTS idx_credential_expiry_date ON staff_credential_verification(expiry_date);

-- Staff request history tracking
CREATE TABLE IF NOT EXISTS staff_request_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES organization_staff_template_requests(id) ON DELETE CASCADE,
    status_from VARCHAR(50),
    status_to VARCHAR(50),
    changed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_request_history_request_id ON staff_request_history(request_id);
CREATE INDEX IF NOT EXISTS idx_request_history_created_at ON staff_request_history(created_at DESC);

-- Trigger to log staff request status changes
CREATE OR REPLACE FUNCTION log_staff_request_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO staff_request_history (request_id, status_from, status_to, changed_by, notes)
    VALUES (NEW.id, OLD.status, NEW.status, NEW.approved_by, NEW.approval_notes);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS staff_request_change_trigger ON organization_staff_template_requests;

CREATE TRIGGER staff_request_change_trigger
AFTER UPDATE ON organization_staff_template_requests
FOR EACH ROW
EXECUTE FUNCTION log_staff_request_change();

-- View: Organization staffing summary
CREATE OR REPLACE VIEW organization_staffing_summary AS
SELECT 
  org.id,
  org.name,
  oc.tier,
  COUNT(DISTINCT CASE WHEN ostr.status = 'approved' THEN ostr.staff_template_key END) as approved_roles,
  COUNT(DISTINCT CASE WHEN ostr.status = 'pending' THEN ostr.staff_template_key END) as pending_roles,
  COUNT(DISTINCT CASE WHEN ostr.status = 'rejected' THEN ostr.staff_template_key END) as rejected_roles,
  (SELECT COUNT(*) FROM staff_template_tier_access WHERE organization_tier = oc.tier) as tier_available_roles,
  COALESCE(osc.credibility_score, 100) as credibility_score,
  COALESCE(osc.flagged, FALSE) as flagged,
  MAX(cal.checked_at) as last_compliance_check,
  CASE 
    WHEN MAX(cal.status) = 'COMPLIANT' THEN 'compliant'
    WHEN MAX(cal.status) = 'AT_RISK' THEN 'at_risk'
    WHEN MAX(cal.status) = 'NON_COMPLIANT' THEN 'non_compliant'
    ELSE 'unchecked'
  END as compliance_status
FROM organizations org
LEFT JOIN organization_configurations oc ON org.id = oc.organization_id
LEFT JOIN organization_staff_template_requests ostr ON org.id = ostr.organization_id
LEFT JOIN organization_staff_credibility osc ON org.id = osc.organization_id
LEFT JOIN compliance_audit_log cal ON org.id = cal.organization_id
GROUP BY org.id, org.name, oc.tier, osc.credibility_score, osc.flagged;

-- View: Non-compliant organizations requiring action
CREATE OR REPLACE VIEW non_compliant_organizations AS
SELECT 
  org.id,
  org.name,
  oc.tier,
  cal.status as compliance_status,
  osc.credibility_score,
  osc.flagged,
  ARRAY_AGG(DISTINCT sta.staff_template_key) FILTER (WHERE cal.details IS NOT NULL) as missing_staff_templates,
  cal.checked_at as last_check
FROM organizations org
LEFT JOIN organization_configurations oc ON org.id = oc.organization_id
LEFT JOIN compliance_audit_log cal ON org.id = cal.organization_id
LEFT JOIN staff_template_tier_access sta ON oc.tier = sta.organization_tier
LEFT JOIN organization_staff_credibility osc ON org.id = osc.organization_id
WHERE cal.status IN ('AT_RISK', 'NON_COMPLIANT')
  AND cal.checked_at = (SELECT MAX(checked_at) FROM compliance_audit_log WHERE organization_id = org.id)
GROUP BY org.id, org.name, oc.tier, cal.status, osc.credibility_score, osc.flagged, cal.checked_at
ORDER BY cal.status DESC, osc.credibility_score ASC;

-- Stored procedure to update credibility score
CREATE OR REPLACE FUNCTION update_org_credibility_score(
  org_id UUID,
  violation_count INT DEFAULT 0,
  violation_reason VARCHAR DEFAULT NULL
)
RETURNS INT AS $$
DECLARE
  base_score INT := 100;
  penalty INT := 0;
  new_score INT;
BEGIN
  -- Penalty per violation: -5 points
  penalty := violation_count * 5;
  
  new_score := GREATEST(0, base_score - penalty);
  
  UPDATE organization_staff_credibility
  SET 
    credibility_score = new_score,
    violations_count = violations_count + violation_count,
    last_violation_at = CASE WHEN violation_count > 0 THEN NOW() ELSE last_violation_at END,
    flagged = CASE WHEN new_score < 50 THEN TRUE ELSE flagged END,
    flag_reason = CASE WHEN new_score < 50 THEN 'Low credibility score' ELSE flag_reason END,
    updated_at = NOW()
  WHERE organization_id = org_id;
  
  RETURN new_score;
END;
$$ LANGUAGE plpgsql;

-- Seed initial credibility scores for demo organizations
INSERT INTO organization_staff_credibility (organization_id, credibility_score, violations_count)
SELECT org.id, 100, 0
FROM organizations org
WHERE org.slug IN ('hp-clinic-01', 'hc-center-01', 'ph-hospital-01', 'gs-hospital-01', 'nh-system-01')
ON CONFLICT (organization_id) DO NOTHING;
