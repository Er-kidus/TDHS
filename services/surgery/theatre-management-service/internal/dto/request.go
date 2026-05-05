package dto

// CreateTheatreManagementRequest holds the fields required to create a theatre-management.
type CreateTheatreManagementRequest struct {
}

// UpdateTheatreManagementRequest holds the fields that can be updated on a theatre-management.
type UpdateTheatreManagementRequest struct {
	ID string `json:"id"`
}
