package dto

// ResultResponse is the standard response payload for a single result.
type ResultResponse struct {
	ID string `json:"id"`
}

// ListResultResponse is the response payload for a list of results.
type ListResultResponse struct {
	Items []ResultResponse `json:"items"`
	Total int                       `json:"total"`
}
