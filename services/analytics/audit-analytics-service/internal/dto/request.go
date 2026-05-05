package dto

// CreateAuditAnalyticsRequest holds the fields required to create a audit-analytics.
type CreateAuditAnalyticsRequest struct {
}

// UpdateAuditAnalyticsRequest holds the fields that can be updated on a audit-analytics.
type UpdateAuditAnalyticsRequest struct {
	ID string `json:"id"`
}
