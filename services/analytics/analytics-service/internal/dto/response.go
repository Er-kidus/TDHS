package dto

// AnalyticsResponse is the standard response payload for a single analytics.
type AnalyticsResponse struct {
	ID string `json:"id"`
}

// ListAnalyticsResponse is the response payload for a list of analyticss.
type ListAnalyticsResponse struct {
	Items []AnalyticsResponse `json:"items"`
	Total int                       `json:"total"`
}
