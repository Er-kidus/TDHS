package dto

// AuditResponse is the standard response payload for a single audit.
type AuditResponse struct {
	ID string `json:"id"`
}

// ListAuditResponse is the response payload for a list of audits.
type ListAuditResponse struct {
	Items []AuditResponse `json:"items"`
	Total int                       `json:"total"`
}
