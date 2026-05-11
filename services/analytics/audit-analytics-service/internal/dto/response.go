package dto

// AuditAnalyticsResponse is the standard response payload for a single audit-analytics.
type AuditAnalyticsResponse struct {
	ID string `json:"id"`
}

// ListAuditAnalyticsResponse is the response payload for a list of audit-analyticss.
type ListAuditAnalyticsResponse struct {
	Items []AuditAnalyticsResponse `json:"items"`
	Total int                       `json:"total"`
}
