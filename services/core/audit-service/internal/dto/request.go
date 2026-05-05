package dto

// CreateAuditRequest holds the fields required to create a audit.
type CreateAuditRequest struct {
}

// UpdateAuditRequest holds the fields that can be updated on a audit.
type UpdateAuditRequest struct {
	ID string `json:"id"`
}
