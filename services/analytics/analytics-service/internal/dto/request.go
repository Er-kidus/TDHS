package dto

// CreateAnalyticsRequest holds the fields required to create a analytics.
type CreateAnalyticsRequest struct {
}

// UpdateAnalyticsRequest holds the fields that can be updated on a analytics.
type UpdateAnalyticsRequest struct {
	ID string `json:"id"`
}
