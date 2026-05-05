package dto

// CreateBedManagementRequest holds the fields required to create a bed-management.
type CreateBedManagementRequest struct {
}

// UpdateBedManagementRequest holds the fields that can be updated on a bed-management.
type UpdateBedManagementRequest struct {
	ID string `json:"id"`
}
