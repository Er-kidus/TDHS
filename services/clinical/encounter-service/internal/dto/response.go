package dto

// EncounterResponse is the standard response payload for a single encounter.
type EncounterResponse struct {
	ID string `json:"id"`
}

// ListEncounterResponse is the response payload for a list of encounters.
type ListEncounterResponse struct {
	Items []EncounterResponse `json:"items"`
	Total int                       `json:"total"`
}
