package dto

// TriageResponse is the standard response payload for a single triage.
type TriageResponse struct {
	ID string `json:"id"`
}

// ListTriageResponse is the response payload for a list of triages.
type ListTriageResponse struct {
	Items []TriageResponse `json:"items"`
	Total int                       `json:"total"`
}
