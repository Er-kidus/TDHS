package dto

// CreateDashboardRequest holds the fields required to create a dashboard.
type CreateDashboardRequest struct {
}

// UpdateDashboardRequest holds the fields that can be updated on a dashboard.
type UpdateDashboardRequest struct {
	ID string `json:"id"`
}
