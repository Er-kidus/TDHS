package dto

// CreateFhirRequest holds the fields required to create a fhir.
type CreateFhirRequest struct {
}

// UpdateFhirRequest holds the fields that can be updated on a fhir.
type UpdateFhirRequest struct {
	ID string `json:"id"`
}
