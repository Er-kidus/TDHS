package dto

// CreateSurgeryRequest holds the fields required to create a surgery.
type CreateSurgeryRequest struct {
}

// UpdateSurgeryRequest holds the fields that can be updated on a surgery.
type UpdateSurgeryRequest struct {
	ID string `json:"id"`
}
