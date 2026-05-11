package dto

// CreateNursingDashboardRequest holds the fields required to create a nursing-dashboard.
type CreateNursingDashboardRequest struct {
}

// UpdateNursingDashboardRequest holds the fields that can be updated on a nursing-dashboard.
type UpdateNursingDashboardRequest struct {
	ID string `json:"id"`
}
