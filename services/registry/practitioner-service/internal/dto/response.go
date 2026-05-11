package dto

// PractitionerResponse is the standard response payload for a single practitioner.
type PractitionerResponse struct {
	ID string `json:"id"`
}

// ListPractitionerResponse is the response payload for a list of practitioners.
type ListPractitionerResponse struct {
	Items []PractitionerResponse `json:"items"`
	Total int                       `json:"total"`
}
