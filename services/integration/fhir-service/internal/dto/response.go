package dto

// FhirResponse is the standard response payload for a single fhir.
type FhirResponse struct {
	ID string `json:"id"`
}

// ListFhirResponse is the response payload for a list of fhirs.
type ListFhirResponse struct {
	Items []FhirResponse `json:"items"`
	Total int                       `json:"total"`
}
