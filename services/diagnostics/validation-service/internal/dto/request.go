package dto

// CreateValidationRequest holds the fields required to create a validation.
type CreateValidationRequest struct {
}

// UpdateValidationRequest holds the fields that can be updated on a validation.
type UpdateValidationRequest struct {
	ID string `json:"id"`
}
