package dto

// CreatePractitionerRequest holds the fields required to create a practitioner.
type CreatePractitionerRequest struct {
}

// UpdatePractitionerRequest holds the fields that can be updated on a practitioner.
type UpdatePractitionerRequest struct {
	ID string `json:"id"`
}
