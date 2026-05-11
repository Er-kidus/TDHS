package repository

import "context"

func (r *Repository) InsertOrgStaffAuditLog(
	ctx context.Context,
	action string,
	actorID string,
	actorEmail string,
	actorRole string,
	actorOrgID string,
	targetOrgID string,
	targetUserID string,
) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO org_staff_audit_logs (
			action,
			actor_id,
			actor_email,
			actor_role,
			actor_org_id,
			target_org_id,
			target_user_id
		)
		VALUES ($1, $2, $3, $4, NULLIF($5, ''), $6, NULLIF($7, ''))
	`, action, actorID, actorEmail, actorRole, actorOrgID, targetOrgID, targetUserID)
	return err
}
