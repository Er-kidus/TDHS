package dto

// SpecimenResponse is the standard response payload for a single specimen.
type SpecimenResponse struct {
	ID string `json:"id"`
}

// ListSpecimenResponse is the response payload for a list of specimens.
type ListSpecimenResponse struct {
	Items []SpecimenResponse `json:"items"`
	Total int                       `json:"total"`
}
