package dto

// InteroperabilityResponse is the standard response payload for a single interoperability.
type InteroperabilityResponse struct {
	ID string `json:"id"`
}

// ListInteroperabilityResponse is the response payload for a list of interoperabilitys.
type ListInteroperabilityResponse struct {
	Items []InteroperabilityResponse `json:"items"`
	Total int                       `json:"total"`
}
