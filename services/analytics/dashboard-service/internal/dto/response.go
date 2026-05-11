package dto

// DashboardResponse is the standard response payload for a single dashboard.
type DashboardResponse struct {
	ID string `json:"id"`
}

// ListDashboardResponse is the response payload for a list of dashboards.
type ListDashboardResponse struct {
	Items []DashboardResponse `json:"items"`
	Total int                       `json:"total"`
}
