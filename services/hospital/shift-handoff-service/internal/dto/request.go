package dto

// CreateShiftHandoffRequest holds the fields required to create a shift-handoff.
type CreateShiftHandoffRequest struct {
}

// UpdateShiftHandoffRequest holds the fields that can be updated on a shift-handoff.
type UpdateShiftHandoffRequest struct {
	ID string `json:"id"`
}
