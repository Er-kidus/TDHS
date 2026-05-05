CREATE TABLE IF NOT EXISTS org_staff_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  actor_email TEXT,
  actor_role TEXT,
  actor_org_id TEXT,
  target_org_id TEXT NOT NULL,
  target_user_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_staff_audit_logs_target_org_created
  ON org_staff_audit_logs (target_org_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_org_staff_audit_logs_actor_created
  ON org_staff_audit_logs (actor_id, created_at DESC);