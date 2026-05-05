package dto

// CreateInteroperabilityRequest holds the fields required to create a interoperability.
type CreateInteroperabilityRequest struct {
}

// UpdateInteroperabilityRequest holds the fields that can be updated on a interoperability.
type UpdateInteroperabilityRequest struct {
	ID string `json:"id"`
}
