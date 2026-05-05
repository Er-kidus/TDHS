package dto

// CareplanResponse is the standard response payload for a single careplan.
type CareplanResponse struct {
	ID string `json:"id"`
}

// ListCareplanResponse is the response payload for a list of careplans.
type ListCareplanResponse struct {
	Items []CareplanResponse `json:"items"`
	Total int                       `json:"total"`
}
