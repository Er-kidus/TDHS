package dto

// SurveillanceResponse is the standard response payload for a single surveillance.
type SurveillanceResponse struct {
	ID string `json:"id"`
}

// ListSurveillanceResponse is the response payload for a list of surveillances.
type ListSurveillanceResponse struct {
	Items []SurveillanceResponse `json:"items"`
	Total int                       `json:"total"`
}
