package dto

// CreateSchedulingRequest holds the fields required to create a scheduling.
type CreateSchedulingRequest struct {
}

// UpdateSchedulingRequest holds the fields that can be updated on a scheduling.
type UpdateSchedulingRequest struct {
	ID string `json:"id"`
}
