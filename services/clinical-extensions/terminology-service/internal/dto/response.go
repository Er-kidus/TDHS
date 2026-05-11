package dto

// TerminologyResponse is the standard response payload for a single terminology.
type TerminologyResponse struct {
	ID string `json:"id"`
}

// ListTerminologyResponse is the response payload for a list of terminologys.
type ListTerminologyResponse struct {
	Items []TerminologyResponse `json:"items"`
	Total int                       `json:"total"`
}
