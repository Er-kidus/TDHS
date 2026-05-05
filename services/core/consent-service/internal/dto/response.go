package dto

// ConsentResponse is the standard response payload for a single consent.
type ConsentResponse struct {
	ID string `json:"id"`
}

// ListConsentResponse is the response payload for a list of consents.
type ListConsentResponse struct {
	Items []ConsentResponse `json:"items"`
	Total int                       `json:"total"`
}
