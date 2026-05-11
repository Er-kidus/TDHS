package dto

// TeleconsultResponse is the standard response payload for a single teleconsult.
type TeleconsultResponse struct {
	ID string `json:"id"`
}

// ListTeleconsultResponse is the response payload for a list of teleconsults.
type ListTeleconsultResponse struct {
	Items []TeleconsultResponse `json:"items"`
	Total int                       `json:"total"`
}
