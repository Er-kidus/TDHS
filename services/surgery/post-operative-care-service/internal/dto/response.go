package dto

// PostOperativeCareResponse is the standard response payload for a single post-operative-care.
type PostOperativeCareResponse struct {
	ID string `json:"id"`
}

// ListPostOperativeCareResponse is the response payload for a list of post-operative-cares.
type ListPostOperativeCareResponse struct {
	Items []PostOperativeCareResponse `json:"items"`
	Total int                       `json:"total"`
}
