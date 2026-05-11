package dto

// TeleTriageResponse is the standard response payload for a single tele-triage.
type TeleTriageResponse struct {
	ID string `json:"id"`
}

// ListTeleTriageResponse is the response payload for a list of tele-triages.
type ListTeleTriageResponse struct {
	Items []TeleTriageResponse `json:"items"`
	Total int                       `json:"total"`
}
