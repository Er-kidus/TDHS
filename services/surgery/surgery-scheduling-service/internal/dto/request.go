package dto

// CreateSurgerySchedulingRequest holds the fields required to create a surgery-scheduling.
type CreateSurgerySchedulingRequest struct {
}

// UpdateSurgerySchedulingRequest holds the fields that can be updated on a surgery-scheduling.
type UpdateSurgerySchedulingRequest struct {
	ID string `json:"id"`
}
