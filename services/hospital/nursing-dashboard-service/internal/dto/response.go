package dto

// NursingDashboardResponse is the standard response payload for a single nursing-dashboard.
type NursingDashboardResponse struct {
	ID string `json:"id"`
}

// ListNursingDashboardResponse is the response payload for a list of nursing-dashboards.
type ListNursingDashboardResponse struct {
	Items []NursingDashboardResponse `json:"items"`
	Total int                       `json:"total"`
}
