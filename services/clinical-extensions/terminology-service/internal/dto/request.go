package dto

// CreateTerminologyRequest holds the fields required to create a terminology.
type CreateTerminologyRequest struct {
}

// UpdateTerminologyRequest holds the fields that can be updated on a terminology.
type UpdateTerminologyRequest struct {
	ID string `json:"id"`
}
